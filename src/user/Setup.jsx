import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Setup.css';

function Setup() {
  const navigate = useNavigate();
  const { currentUser, fetchUserData } = useAuth();
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    designName: '',
    roomHeight: '',
    roomWidth: '',
    roomLength: '',
  });
  const [errors, setErrors] = useState({
    customerName: '',
    designName: ''
  });

  // Fetch the current user's name when component mounts
  useEffect(() => {
    const getUserName = async () => {
      if (currentUser) {
        try {
          const userData = await fetchUserData(currentUser);
          if (userData && userData.name) {
            setUserName(userData.name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    getUserName();
  }, [currentUser, fetchUserData]);

  const validateForm = () => {
    const newErrors = {
      customerName: '',
      designName: ''
    };
    let isValid = true;

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
      isValid = false;
    }

    if (!formData.designName.trim()) {
      newErrors.designName = 'Design name is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Navigate to DesignEditor with state containing room details and userName
    navigate('/designEditor', { 
      state: { 
        designName: formData.designName.trim(),
        customerName: formData.customerName.trim(),
        userName: userName,
        roomDetails: {
          width: parseFloat(formData.roomWidth) || 10,
          length: parseFloat(formData.roomLength) || 10,
          height: parseFloat(formData.roomHeight) || 3
        }
      } 
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  const goToDesigner = () => {
    
  }

  return (
    <div className="room-specifications-container">
      <div className="specifications-form-container">
        <h2 className="specifications-title">Enter room specifications</h2>
        
        <form onSubmit={handleSubmit} className="specifications-form">
          <div className="form-group">
            <label htmlFor="customerName">Customer name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              className={`form-input ${errors.customerName ? 'error' : ''}`}
              placeholder="Enter customer name"
            />
            {errors.customerName && <span className="error-message">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="designName">Design Name</label>
            <input
              type="text"
              id="designName"
              name="designName"
              value={formData.designName}
              onChange={handleChange}
              className={`form-input ${errors.designName ? 'error' : ''}`}
              placeholder="Enter design name"
            />
            {errors.designName && <span className="error-message">{errors.designName}</span>}
          </div>
          
          {/* <div className="form-group">
            <label htmlFor="roomHeight">Room Height</label>
            <input
              type="text"
              id="roomHeight"
              name="roomHeight"
              value={formData.roomHeight}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomWidth">Room Width</label>
            <input
              type="text"
              id="roomWidth"
              name="roomWidth"
              value={formData.roomWidth}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomLength">Room length</label>
            <input
              type="text"
              id="roomLength"
              name="roomLength"
              value={formData.roomLength}
              onChange={handleChange}
              className="form-input"
            />
          </div> */}
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={!formData.customerName.trim() || !formData.designName.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Setup;
