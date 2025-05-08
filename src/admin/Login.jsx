import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import furnitureLogo from '../assets/Logo.png';
import { useAuth } from '../context/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Try to login
      const userCredential = await login(email, password);
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().isAdmin) {
        navigate('/adminusers');
      } else {
        // If not admin, sign them out and show error
        await logout();
        setError('Access denied. You need admin privileges to access this page.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={furnitureLogo} alt="Furniture Logo" className="furniture-logo" />
        </div>

        <div className="login-content">
          <h1 className="welcome-text">Admin Login</h1>
          <p className="login-subtitle">Enter admin credentials to login</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="footer-text">
            <p>All rights reserved for Furniture</p>
          </div>
        </div>
      </div>
      <div className="login-image-container">
      </div>
    </div>
  );
}

export default AdminLogin;
