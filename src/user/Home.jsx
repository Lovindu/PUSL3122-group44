import { useState, useEffect, useMemo } from 'react'; // Add useMemo import
import { useNavigate } from 'react-router-dom';
import './Home.css';
import plusIcon from '../assets/plus-icon.svg';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';

function Home() {
  const navigate = useNavigate();
  const { currentUser, fetchUserData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('latest');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  
  // Load user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      if (currentUser) {
        try {
          const userData = await fetchUserData(currentUser);
          if (userData) {
            setUserName(userData.name || '');
            setUserId(currentUser.uid);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    getUserData();
  }, [currentUser, fetchUserData]);
  
  // Load user designs whenever userId changes
  useEffect(() => {
    if (userId) {
      getUserDesigns(userId);
    }
  }, [userId]);
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const handleCreateNewDesign = () => {
    navigate('/roomsetup');
  };

  const getUserDesigns = async (userId) => {
    try {
      // Fetch designs from the userDesigns subcollection under the user document
      const userDesignsRef = collection(db, 'users', userId, 'userDesigns');
      const querySnapshot = await getDocs(userDesignsRef);
      
      console.log(`Found ${querySnapshot.docs.length} designs for user ${userId}`);
      
      const designs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure timestamps are properly handled
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        };
      });
      
      setSavedDesigns(designs);
      return designs;
    } catch (error) {
      console.error('Error getting user designs from subcollection:', error);
      setSavedDesigns([]);
      throw error;
    }
  };

  // Filter and sort designs based on search query and filter value
  const filteredAndSortedDesigns = useMemo(() => {
    // First, filter designs based on search query
    let filtered = savedDesigns.filter(design => 
      design.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then, sort based on filter value
    return filtered.sort((a, b) => {
      // Convert Firestore timestamps to JS Date objects for comparison
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      
      // Sort based on the selected filter
      if (filterValue === 'latest') {
        return dateB - dateA; // Most recent first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  }, [savedDesigns, searchQuery, filterValue]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="welcome-header">Welcome, {userName || 'User'}!</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="content-container">
        <div 
          className="create-design-card"
          onClick={handleCreateNewDesign}
        >
          <div className="icon-container">
            <img src={plusIcon} alt="Create" className="plus-icon" />
          </div>
          <p className="create-text">Create New Design</p>
        </div>

        <div className="saved-designs-section">
          <div className='saved-designs-title'>
            <h2 className="section-title">Saved Designs</h2>
          </div>
          
          <div className="controls-row">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">
                <span role="img" aria-label="search">🔍</span>
              </button>
            </div>
            
            <div className="filter-container">
              <select 
                className="filter-select"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <option value="latest">Filter by latest date</option>
                <option value="oldest">Filter by oldest date</option>
              </select>
            </div>
          </div>

          <div className="designs-grid">
            {filteredAndSortedDesigns.map(design => (
              <div key={design.id} className="design-card">
                <div className="design-thumbnail"></div>
                <h3 className="design-title">{design.name}</h3>
                <p className="design-date">{design.createdAt?.toDate?.().toLocaleDateString() || 'No date'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
