import React from 'react';
import "./DesignEditor.css";
import AddIconWhite from "../assets/Plus-white.png";
import './DesignEditor.css';
import { useState } from 'react';
import Room2D from '../components/Room2D';
import Room3D from '../components/Room3D';
import { db } from "../firebase";
import {  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const furnitureCatalog = [
  {
    id: 'bunkbed',
    name: 'bunkbed',
    image: '/images/bunkbed.svg',
    modelPath: '/models/bunk-bed.glb',
    width: 0.5,
    length: 0.5,
    colors: ['#222', '#888'],
    colorNames: ['Black', 'Gray'],
  },
  {
    id: 'chair',
    name: 'chair',
    image: '/images/chair.svg',
    modelPath: '/models/chair.glb',
    width: 0.6,
    length: 0.6,
    colors: ['#222', '#888'],
    colorNames: ['Black', 'Gray'],
  },
  {
    id: 'TvStand',
    name: 'Tvstand',
    image: '/images/Tv-stand.png',
    modelPath: '/models/Tv-stand.glb',
    width: 0.6,
    length: 0.6,
    colors: ['#222', '#888'],
    colorNames: ['Black', 'Gray'],
  },
  {
    id: 'table',
    name: 'table',
    image: '/images/table.png',
    modelPath: '/models/table.glb',
    width: 0.6,
    length: 0.6,
    colors: ['#222', '#888'],
    colorNames: ['Black', 'Gray'],
  },
  {
    id: 'fan',
    name: 'fan',
    image: '/images/fan.png',
    modelPath: '/models/table_fan.glb',
    width: 0.6,
    length: 0.6,
    colors: ['#222', '#888'],
    colorNames: ['Black', 'Gray'],
  },
];

/* const furnitureData = [
  { id: "furniture1", name: "Chair", type: "chair", image: "/images/chair.svg", modelPath: "/models/chair.glb" },
  { id: "furniture2", name: "bunkbed", type: "bunkbed", image: "/images/bunkbed.svg", modelPath: "/models/bunk-bed.glb" },
  { id: "furniture3", name: "Tv-stand", type: "tv-stand", image: "/images/Tv-stand.png", modelPath: "/models/Tv-stand.glb" },
]; */

const DesignEditor = () => {
  const location = useLocation();
  const passedData = location.state || {};
  
  const { currentUser } = useAuth();
  const [is3DView, setIs3DView] = useState(false);
  const [roomSize, setRoomSize] = useState(passedData.roomDetails || { width: 10, length: 10, height: 3 });
  const [furniture, setFurniture] = useState([]);
  const [wallColor, setWallColor] = useState('#e0e0e0');
  const [floorColor, setFloorColor] = useState('#eaeaea');
  const [showDropdown, setShowDropdown] = useState(false);
  const [designName, setDesignName] = useState(passedData.designName || '');

  const addFurnitureToRoom = (item) => {
    setFurniture([
      ...furniture,
      {
        ...item,
        type: item.id,
        image: item.image,
        modelPath: item.modelPath,
        color: item.colors ? item.colors[0] : '#888',
        id: Date.now(),
        position: { x: roomSize.width / 2, y: roomSize.length / 2 },
        dimensions: {
          width: item.width || 1,
          length: item.length || 1,
        }
      },
    ])
    setShowDropdown(false);
  };

  const removeFurniture = (id) => {
    setFurniture(furniture.filter((f) => f.id !== id));
  };

  const updateFurniturePositions = (updatedArray) => {
    setFurniture(updatedArray);
  };

  const saveDesign = async (designData) => {
    try {
      const designRef = await addDoc(collection(db, 'designs'), {
        ...designData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert("design saved" + designRef.id);
      return designRef.id;
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  }

  const handleSaveDesign = async () => {
    if (!currentUser) {
      alert("Please log in to save your design");
      return;
    }

    // Use the designName state that now comes from Setup.jsx
    const name = designName || "My Living Room Design";

    const designData = {
      name, // This will now be the name passed from Setup.jsx if available
      userId: currentUser.uid,
      room: {
        width: roomSize.width,
        length: roomSize.length,
        height: roomSize.height
      },
      furniture: furniture.map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        position: item.position,
        dimensions: item.dimensions,
        image: item.image
      })),
      metadata: {
        view: is3DView ? "3D" : "2D",
        scale: 1,
        version: "1.0"
      }
    };
    
    try {
      // Save to main designs collection (your existing code)
      const designId = await saveDesign(designData);
      
      // ALSO save reference to this design in the user's subcollection
      await setDoc(doc(db, 'users', currentUser.uid, 'userDesigns', designId), {
        designId,
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        thumbnailUrl: "", // Could add thumbnail later
      });
      
      alert("Design saved successfully!");
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Failed to save design. Please try again.");
    }
  };

  console.log(roomSize);

  return (
    <div className='designEditor'>
      <nav className='designEditor-nav'>
        <button onClick={() => setShowDropdown((v) => !v)} className='designEditor-add-furniture'>Add Furniture <img src={AddIconWhite} alt="" /></button>

        <div className='designEditor-nav-right'>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Wall Color
            <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', background: 'none' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Floor Color
            <input type="color" value={floorColor} onChange={e => setFloorColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', background: 'none' }} />
          </label>
          <button className='designEditor-button' onClick={() => setIs3DView((v) => !v)}>Switch to {is3DView ? '2D' : '3D'} View</button>
          <button className='designEditor-button-save' onClick={handleSaveDesign}>Save</button>
        </div>
      </nav>

      <section  className='desginEditor-section'>
        <div className='editor-section'>
          <div style={{ width: 600, height: "auto", margin: '0 auto', background: '#f5f5f5', border: 'none', position: 'relative', padding: "10px", borderRadius: '10px' }}>
            {is3DView ? (
              <Room3D
                roomSize={roomSize}
                furniture={furniture}
                wallColor={wallColor}
                floorColor={floorColor}
              />
            ) : (
              <Room2D
                roomSize={roomSize}
                furniture={furniture}
                onAddFurniture={addFurnitureToRoom}
                onUpdateFurniture={updateFurniturePositions}
                onRemoveFurniture={removeFurniture}
                furnitureCatalog={furnitureCatalog}
              />
            )}
          </div>
        </div>

        <div className='designEditor-sidebar'>
          {showDropdown && (
            <div style={{ marginBottom: 16, background: '#fff', border: 'px solid #ccc', borderRadius: 8, padding: 16, display: 'inline-block' }}>
              {furnitureCatalog.map((item) => (
                <button key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: 8, borderRadius: 6, border: '1px solid #eee', background: '#fafafa', cursor: 'pointer' }} onClick={() => addFurnitureToRoom(item)}>
                  <img src={item.image} alt={item.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className='designEditor-roomprop'>
            <h3>Room Properties</h3>
            <div className="form-group">
              <p>Design Name</p>
              <input 
                type="text" 
                name='designName' 
                value={designName} 
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Enter design name"
              />
            </div>
            <div className='roomprop-firstrow'>
              <div>
                <p>Height</p>
                <input type="number" name='height' value={roomSize.height} onChange={(e) => {setRoomSize({...roomSize, height: e.target.value})}}/>
              </div>

              <div>
                <p>Width</p>
                <input type="number" name='width' value={roomSize.width} onChange={(e) => {setRoomSize({...roomSize, width: e.target.value})}}/>
              </div>
            </div>

            <div>
              <p>Length</p>
              <input type="number" name='length' value={roomSize.length} onChange={(e) => {setRoomSize({...roomSize, length: e.target.value})}}/>
            </div>
            <button>Delete design</button>
          </div>

        </div>
      </section>
    </div>
  )
}

export default DesignEditor