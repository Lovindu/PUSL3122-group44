import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Designs.css';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc,
  deleteDoc
} from 'firebase/firestore';

// 2D Preview Component
const Design2DPreview = ({ previewData, onRemoveFurniture = null }) => {
  try {
    // Parse JSON data from the preview2D field
    const roomData = JSON.parse(previewData);
    const { width, length, furniture, wallColor, floorColor } = roomData;
    
    // Scale for preview (adjust as needed)
    const scale = 30; // pixels per meter
    const roomWidthPx = width * scale;
    const roomLengthPx = length * scale;
    
    // Define furniture type to image mapping
    const furnitureImages = {
      bunkbed: '/images/bunkbed.svg',
      chair: '/images/chair.svg',
      TvStand: '/images/Tv-stand.png',
      table: '/images/table.png',
      fan: '/images/fan.png'
    };
    
    return (
      <div 
        style={{ 
          width: `${roomWidthPx}px`, 
          height: `${roomLengthPx}px`, 
          maxWidth: '80vw',
          maxHeight: '60vh',
          background: floorColor || '#eaeaea',
          border: `2px solid ${wallColor || '#e0e0e0'}`,
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden',
          margin: '0 auto'
        }}
      >
        {furniture?.map((item, index) => {
          // Calculate position and size based on room dimensions
          const leftPx = item.position.x * scale;
          const topPx = item.position.y * scale;
          const widthPx = item.dimensions.width * scale;
          const lengthPx = item.dimensions.length * scale;
          
          // Get image path for this furniture type
          const imagePath = furnitureImages[item.type];
          
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: `${widthPx}px`,
                height: `${lengthPx}px`,
                left: `${leftPx - (widthPx/2)}px`,
                top: `${topPx - (lengthPx/2)}px`,
                borderRadius: '2px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              title={item.type || 'Furniture item'}
            >
              {imagePath ? (
                <img 
                  src={imagePath}
                  alt={item.type}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#8B4513', 
                    borderRadius: '2px'
                  }}
                />
              )}
              
              {onRemoveFurniture && (
                <button
                  onClick={() => onRemoveFurniture(index)}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#a33',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("Error parsing preview data:", error);
    return (
      <div className="preview-error">
        Could not render preview. Invalid data format.
      </div>
    );
  }
};

export default function DesignManagement() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('latest');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Fetch designs from userDesigns subcollections
  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      try {
        console.log("Starting direct fetch approach...");
        
        const designsData = [];
        
        // Get all users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        console.log(`Found ${usersSnapshot.docs.length} users`);
        
        // For each user, check their userDesigns collection
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const userName = userDoc.data().name || 'Unknown User';
          
          try {
            // Get this user's designs
            const userDesignsRef = collection(db, 'users', userId, 'userDesigns');
            const userDesignsSnapshot = await getDocs(userDesignsRef);
            
            console.log(`User ${userId} (${userName}) has ${userDesignsSnapshot.docs.length} designs`);
            
            // Process each design
            for (const designDoc of userDesignsSnapshot.docs) {
              try {
                const designData = designDoc.data();
                
                // Create a design object with proper timestamp handling
                const design = {
                  id: designDoc.id,
                  ...designData,
                  userId: userId,
                  userName: designData.userName || userName, // Use the stored userName or fall back to the user's name
                  createdAt: designData.createdAt?.toDate?.() || new Date()
                };
                
                designsData.push(design);
              } catch (err) {
                console.error(`Error processing design for user ${userId}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error fetching designs for user ${userId}:`, err);
          }
        }
        
        console.log(`Total designs found: ${designsData.length}`);
        setDesigns(designsData);
        
      } catch (error) {
        console.error('Error in fetch process:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Handle design deletion
  const handleDeleteDesign = async (designId, userId) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    
    try {
      // Delete from the user's subcollection
      await deleteDoc(doc(db, 'users', userId, 'userDesigns', designId));
      
      // Also try to delete from the main designs collection if it exists
      try {
        await deleteDoc(doc(db, 'designs', designId));
      } catch (error) {
        console.log('Note: Design may not exist in main designs collection');
      }
      
      // Update local state to remove deleted design
      setDesigns(designs.filter(design => design.id !== designId));
      alert('Design deleted successfully');
      
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design. Please try again.');
    }
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
  };

  // Open preview modal
  const handlePreviewClick = (design) => {
    setSelectedDesign(design);
    setPreviewModalOpen(true);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setSelectedDesign(null);
  };

  // Filter and sort designs based on search query and filter value
  const filteredAndSortedDesigns = designs
    .filter(design => 
      design.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filterValue === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Dashboard</h2>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => navigate('/adminusers')}>User Management</button>
          <button className="admin-nav-link" onClick={() => navigate('/adminfurniture')}>Furniture management</button>
          <button className="admin-nav-link active">Design management</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate('/adminlogin')}>Logout</button>
      </aside>
      <main className="admin-main-content">
        <div className="admin-main-header">
          <h2 className="admin-main-title">Design management</h2>
        </div>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search designs"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <span className="admin-search-icon">🔍</span>
          </div>
          <div className="filter-container">
            <select 
              className="filter-select"
              value={filterValue}
              onChange={handleFilterChange}
            >
              <option value="latest">Filter by latest date</option>
              <option value="oldest">Filter by oldest date</option>
            </select>
          </div>
        </div>
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="loading-indicator">Loading designs...</div>
          ) : (
            <table className="design-table">
              <thead>
                <tr>
                  <th>Design name</th>
                  <th>Designer</th>
                  <th>Date created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDesigns.length > 0 ? (
                  filteredAndSortedDesigns.map((design) => (
                    <tr key={design.id} className="user-row">
                      <td>{design.name || 'Unnamed Design'}</td>
                      <td>{design.userName || 'Unknown User'}</td>
                      <td>{design.createdAt.toLocaleDateString()}</td>
                      <td className="design-actions">
                        <button 
                          className="preview-btn"
                          onClick={() => handlePreviewClick(design)}
                        >
                          Preview
                        </button>
                        <button 
                          className="admin-delete-btn"
                          onClick={() => handleDeleteDesign(design.id, design.userId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      {searchQuery ? 'No designs match your search' : 'No designs found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewModalOpen && selectedDesign && (
        <div className="design-preview-modal-overlay" onClick={handleClosePreview}>
          <div className="design-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="design-preview-header">
              <h3>
                {selectedDesign.name || 'Unnamed Design'} 
                <span className="design-preview-subtitle">
                  by {selectedDesign.userName || 'Unknown User'}
                </span>
              </h3>
              <button className="design-preview-close-btn" onClick={handleClosePreview}>×</button>
            </div>
            <div className="design-preview-content">
              {selectedDesign.preview2D ? (
                <Design2DPreview previewData={selectedDesign.preview2D} />
              ) : (
                <div className="no-preview-message">
                  No preview data available for this design.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
