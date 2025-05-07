import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import furnitureLogo from '../assets/Logo.png';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { username, password, rememberMe });
    
    
    if (username && password) {
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={furnitureLogo} alt="Furniture Logo" className="furniture-logo" />
        </div>

        <div className="login-content">
          <h1 className="welcome-text">Welcome Back!</h1>
          <p className="login-subtitle">Enter you credentials to login</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

            <button type="submit" className="login-button">Login</button>
          </form>

          <div className="footer-text">
            <p>All right reserved for Furniture</p>
          </div>
        </div>
      </div>
      <div className="login-image-container">
      </div>
    </div>
  );
}

export default Login;
