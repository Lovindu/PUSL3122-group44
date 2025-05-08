import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import plusIcon from '../assets/plus-icon.svg';
import { db } from '../firebase';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('latest');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [userId, setUserId] = useState("uuids1234");
  
  // Mock data for designs
  const designs = [
    { id: 1, title: 'Design for john', date: '02/04/2025' },
    { id: 2, title: 'Design for john', date: '02/04/2025' },
    { id: 3, title: 'Design for john', date: '02/04/2025' },
    { id: 4, title: 'Design for john', date: '02/04/2025' },
    { id: 5, title: 'Design for john', date: '02/04/2025' },
    { id: 6, title: 'Design for john', date: '02/04/2025' },
    { id: 7, title: 'Design for john', date: '02/04/2025' },
    { id: 8, title: 'Design for john', date: '02/04/2025' }
  ];
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const handleCreateNewDesign = () => {
    navigate('/roomsetup');
  };

  const getUserDesigns = async (userId) => {
    try {
      const designsQuery = query(
        collection(db, 'designs'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(designsQuery);
      setSavedDesigns(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))); 
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user designs:', error);
      throw error;
    }
  };

  console.log(savedDesigns);

  useEffect(() => {
    getUserDesigns("uuids1234"); 
  }, [])

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="welcome-header">Welcome, User!</h1>
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
            {savedDesigns.map(design => (
              <div key={design.id} className="design-card">
                <div className="design-thumbnail"></div>
                <h3 className="design-title">{design.name}</h3>
                <p className="design-date">{design.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
