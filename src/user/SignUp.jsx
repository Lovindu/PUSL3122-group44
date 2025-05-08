import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import furnitureLogo from '../assets/Logo.png';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        isAdmin: false,
        createdAt: new Date(),
      });
      
      console.log('User created successfully:', user.uid);
      navigate('/'); // Navigate to home page after successful signup
      
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container-user">
      <div className="login-form-container">
        <div className="logo-container">
          <img src={furnitureLogo} alt="Furniture Logo" className="furniture-logo" />
        </div>

        <div className="login-content">
          <h1 className="welcome-text">Welcome!</h1>
          <p className="login-subtitle">Enter your credentials to signup</p>

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
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              <a href="/login" className="forgot-password">Already have an account?</a>
            </div>

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className="footer-text">
            <p>All rights reserved for Furniture</p>
          </div>
        </div>
      </div>
      <div className="login-image-container-user">
      </div>
    </div>
  );
}

export default SignUp;
