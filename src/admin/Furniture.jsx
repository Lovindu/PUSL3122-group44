import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import './Furniture.css';

export default function FurnitureManagement() {
  const navigate = useNavigate();
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [furnitureForm, setFurnitureForm] = useState({
    name: '',
    imagePath: '',
    modelPath: '',
    stockCount: 0,
    price: 0
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState(null);

  // Fetch furniture from Firestore
  useEffect(() => {
    const fetchFurniture = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'furniture'));
        const furnitureData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFurniture(furnitureData);
      } catch (error) {
        console.error('Error fetching furniture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFurniture();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFurnitureForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new furniture
  const handleAddFurniture = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'furniture'), {
        name: furnitureForm.name,
        imagePath: furnitureForm.imagePath,
        modelPath: furnitureForm.modelPath,
        stockCount: Number(furnitureForm.stockCount),
        price: Number(furnitureForm.price)
      });
      
      setFurniture(prev => [...prev, { 
        id: docRef.id, 
        ...furnitureForm,
        stockCount: Number(furnitureForm.stockCount),
        price: Number(furnitureForm.price)
      }]);
      
      setIsAddModalOpen(false);
      setFurnitureForm({
        name: '',
        imagePath: '',
        modelPath: '',
        stockCount: 0,
        price: 0
      });
    } catch (error) {
      console.error('Error adding furniture:', error);
      alert('Failed to add furniture. Please try again.');
    }
  };

  // Delete furniture
  const handleDeleteFurniture = async (id) => {
    if (!confirm('Are you sure you want to delete this furniture?')) return;

    try {
      await deleteDoc(doc(db, 'furniture', id));
      setFurniture(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting furniture:', error);
      alert('Failed to delete furniture. Please try again.');
    }
  };

  // Handle edit click
  const handleEditClick = (item) => {
    setEditingFurniture(item);
    setFurnitureForm({
      name: item.name,
      imagePath: item.imagePath,
      modelPath: item.modelPath,
      stockCount: item.stockCount,
      price: item.price
    });
    setIsEditModalOpen(true);
  };

  // Handle edit submission
  const handleEditFurniture = async (e) => {
    e.preventDefault();
    if (!editingFurniture) return;

    try {
      await updateDoc(doc(db, 'furniture', editingFurniture.id), {
        name: furnitureForm.name,
        imagePath: furnitureForm.imagePath,
        modelPath: furnitureForm.modelPath,
        stockCount: Number(furnitureForm.stockCount),
        price: Number(furnitureForm.price)
      });
      
      setFurniture(prev => prev.map(item => 
        item.id === editingFurniture.id 
          ? { 
              ...item, 
              ...furnitureForm,
              stockCount: Number(furnitureForm.stockCount),
              price: Number(furnitureForm.price)
            }
          : item
      ));
      
      setIsEditModalOpen(false);
      setEditingFurniture(null);
    } catch (error) {
      console.error('Error updating furniture:', error);
      alert('Failed to update furniture. Please try again.');
    }
  };

  // Filter furniture based on search
  const filteredFurniture = furniture.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin dashboard</h2>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => navigate('/adminusers')}>User Management</button>
          <button className="admin-nav-link active">Furniture management</button>
          <button className="admin-nav-link" onClick={() => navigate('/admindesigns')}>Design management</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate('/adminlogin')}>Logout</button>
      </aside>
      <main className="admin-main-content">
        <div className="admin-main-header">
          <h2 className="admin-main-title">Furniture management</h2>
          <button 
            className="admin-add-furniture-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add new furniture
          </button>
        </div>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="admin-search-icon">🔍</span>
          </div>
        </div>
        <div className="furniture-grid">
          {loading ? (
            <div className="loading-indicator">Loading furniture...</div>
          ) : (
            filteredFurniture.map((item) => (
              <div className="furniture-card" key={item.id}>
                <div className="furniture-card-title">{item.name}</div>
                <div className="furniture-card-image">
                  <img src={item.imagePath} alt={item.name} />
                </div>
                <div className="furniture-card-details">
                  <p>Price: ${item.price}</p>
                  <p>Stock: {item.stockCount}</p>
                </div>
                <div className="furniture-card-actions">
                  <button 
                    className="admin-edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="admin-delete-btn"
                    onClick={() => handleDeleteFurniture(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Furniture Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Add New Furniture</h2>
            <form onSubmit={handleAddFurniture}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={furnitureForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image Path:</label>
                <input
                  type="text"
                  name="imagePath"
                  value={furnitureForm.imagePath}
                  onChange={handleInputChange}
                  placeholder="/images/chair.jpg"
                  required
                />
              </div>
              <div className="form-group">
                <label>Model Path:</label>
                <input
                  type="text"
                  name="modelPath"
                  value={furnitureForm.modelPath}
                  onChange={handleInputChange}
                  placeholder="/models/chair.glb"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Count:</label>
                <input
                  type="number"
                  name="stockCount"
                  value={furnitureForm.stockCount}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={furnitureForm.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Add Furniture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Furniture Modal */}
      {isEditModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Edit Furniture</h2>
            <form onSubmit={handleEditFurniture}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={furnitureForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image Path:</label>
                <input
                  type="text"
                  name="imagePath"
                  value={furnitureForm.imagePath}
                  onChange={handleInputChange}
                  placeholder="/images/chair.jpg"
                  required
                />
              </div>
              <div className="form-group">
                <label>Model Path:</label>
                <input
                  type="text"
                  name="modelPath"
                  value={furnitureForm.modelPath}
                  onChange={handleInputChange}
                  placeholder="/models/chair.glb"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Count:</label>
                <input
                  type="number"
                  name="stockCount"
                  value={furnitureForm.stockCount}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={furnitureForm.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingFurniture(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
