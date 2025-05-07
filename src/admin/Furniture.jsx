import { useNavigate } from 'react-router-dom';
import './Furniture.css';

const furnitureList = Array(8).fill({
  name: 'Furniture name',
  availability: 'In stock'
});

export default function FurnitureManagement() {
  const navigate = useNavigate();

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
          <button className="admin-add-furniture-btn">Add new furniture</button>
        </div>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search"
            />
            <span className="admin-search-icon">🔍</span>
          </div>
        </div>
        <div className="furniture-grid">
          {furnitureList.map((item, i) => (
            <div className="furniture-card" key={i}>
              <div className="furniture-card-title">{item.name}</div>
              <div className="furniture-card-image">
              </div>
              <div className="furniture-card-availability">
                Availability: <span>{item.availability}</span>
              </div>
              <div className="furniture-card-actions">
                <button className="admin-edit-btn">Edit</button>
                <button className="admin-delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
