import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    isAdmin: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [addUserError, setAddUserError] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(usersQuery);
        
        const userData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: doc.data().isAdmin ? 'Admin' : 'User',
          status: 'Active' // Default status
        }));
        
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search filtering
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) || 
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Open edit modal with user data
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      isAdmin: user.role === 'Admin'
    });
    setIsModalOpen(true);
  };

  // Update user in Firestore
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        name: editForm.name,
        isAdmin: editForm.isAdmin
        // Don't update email as it's used for authentication
      });
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === editingUser.id) {
          return {
            ...user,
            name: editForm.name,
            role: editForm.isAdmin ? 'Admin' : 'User'
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Delete user from Firestore
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };
  
  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  // Handle role change in dropdown
  const handleRoleChange = (e) => {
    const isAdmin = e.target.value === 'Admin';
    setEditForm({...editForm, isAdmin});
  };

  // Open add user modal
  const handleOpenAddUserModal = () => {
    setAddUserForm({
      name: '',
      email: '',
      password: '',
      isAdmin: false
    });
    setAddUserError('');
    setShowPassword(false);
    setIsAddUserModalOpen(true);
  };

  // Handle add user form input changes
  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role selection for new user
  const handleAddUserRoleChange = (e) => {
    const isAdmin = e.target.value === 'Admin';
    setAddUserForm(prev => ({
      ...prev,
      isAdmin
    }));
  };

  // Create new user in Firebase Auth and Firestore - Admin stays logged in
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserLoading(true);
    
    try {
      // Get Firebase API key
      const apiKey = "AIzaSyCoZE1CAKRawJWXIErpYORPq0pTd8-k5zg";
      
      // Call Firebase Auth REST API directly
      const authResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: addUserForm.email,
            password: addUserForm.password,
            returnSecureToken: true
          })
        }
      );
      
      const authData = await authResponse.json();
      
      if (authData.error) {
        throw new Error(authData.error.message);
      }
      
      const userId = authData.localId;
      
      // Store user data in Firestore
      await setDoc(doc(db, 'users', userId), {
        name: addUserForm.name,
        email: addUserForm.email,
        isAdmin: addUserForm.isAdmin,
        createdAt: serverTimestamp(),
        status: 'Active'
      });
      
      // Update local state
      setUsers(prev => [
        {
          id: userId,
          name: addUserForm.name,
          email: addUserForm.email,
          role: addUserForm.isAdmin ? 'Admin' : 'User',
          status: 'Active',
          createdAt: new Date()
        },
        ...prev
      ]);
      
      setIsAddUserModalOpen(false);
      
    } catch (error) {
      console.error('Error creating user:', error);
      setAddUserError(typeof error === 'string' ? error : error.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Dashboard</h2>
        <nav className="admin-nav">
          <button className="admin-nav-link active">User Management</button>
          <button className="admin-nav-link" onClick={() => navigate('/adminfurniture')}>Furniture management</button>
          <button className="admin-nav-link" onClick={() => navigate('/admindesigns')}>Design management</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate('/adminlogin')}>Logout</button>
      </aside>
      <main className="admin-main-content">
        <div className="admin-main-header">
          <h2 className="admin-main-title">User Management</h2>
          <button className="admin-add-user-btn" onClick={handleOpenAddUserModal}>Add new user</button>
        </div>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="admin-search-icon">🔍</span>
          </div>
        </div>
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="loading-indicator">Loading users...</div>
          ) : (
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>Username/email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`status-indicator status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="admin-edit-btn" 
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="admin-delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  disabled
                  title="Email cannot be changed"
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select 
                  className="role-select"
                  value={editForm.isAdmin ? 'Admin' : 'User'}
                  onChange={handleRoleChange}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
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

      {/* Add New User Modal */}
      {isAddUserModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Add New User</h2>
            {addUserError && (
              <div className="error-message">{addUserError}</div>
            )}
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  name="name"
                  value={addUserForm.name} 
                  onChange={handleAddUserInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  name="email"
                  value={addUserForm.email} 
                  onChange={handleAddUserInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={addUserForm.password} 
                    onChange={handleAddUserInputChange}
                    required
                    minLength="6"
                    className="password-input"
                  />
                  <button 
                    type="button"
                    className="password-toggle-btn"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select 
                  className="role-select"
                  value={addUserForm.isAdmin ? 'Admin' : 'User'}
                  onChange={handleAddUserRoleChange}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={addUserLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={addUserLoading}
                >
                  {addUserLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
