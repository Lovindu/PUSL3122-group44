import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Setup.css';

function Setup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    designName: '',
    roomHeight: '',
    roomWidth: '',
    roomLength: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    navigate('/designEditor');
  };

  const handleCancel = () => {
    navigate('/home');
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
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Design Name</label>
            <input
              type="text"
              id="designName"
              name="designName"
              value={formData.designName}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          
          <div className="form-group">
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
          </div>
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="create-button" onClick={goToDesigner}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Setup;
