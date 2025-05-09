import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./DesignEditor.css";
import AddIconWhite from "../assets/Plus-white.png";
import Room2D from '../components/Room2D';
import Room3D from '../components/Room3D';
import { db } from "../firebase";
import {  
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

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

const DesignEditor = () => {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  
  const { currentUser } = useAuth();
  const [is3DView, setIs3DView] = useState(state?.metadata?.view === "3D" || false);
  const [roomSize, setRoomSize] = useState(state?.roomDetails || { width: 10, length: 10, height: 3 });
  const [furniture, setFurniture] = useState(state?.existingFurniture || []);
  const [wallColor, setWallColor] = useState(state?.wallColor || '#e0e0e0');
  const [floorColor, setFloorColor] = useState(state?.floorColor || '#eaeaea');
  const [showDropdown, setShowDropdown] = useState(false);
  const [designName, setDesignName] = useState(state?.designName || '');
  const [customerName, setCustomerName] = useState(state?.customerName || '');
  const [userName, setUserName] = useState(state?.userName || '');
  const [isEditing, setIsEditing] = useState(state?.isEditing || false);
  const [designId, setDesignId] = useState(state?.designId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDesign = async () => {
      try {
        if (state?.designId) {
          const designDoc = await getDoc(doc(db, 'designs', state.designId));
          if (designDoc.exists()) {
            const designData = designDoc.data();
            
            setRoomSize(designData.room || state.roomDetails);
            setFurniture(designData.furniture || []);
            setWallColor(designData.wallColor || '#e0e0e0');
            setFloorColor(designData.floorColor || '#eaeaea');
            setDesignName(designData.name || '');
            setCustomerName(designData.customerName || '');
            setUserName(designData.userName || '');
            setIs3DView(designData.metadata?.view === "3D" || false);
          }
        }
      } catch (error) {
        console.error('Error loading design data:', error);
        alert('Error loading design data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDesign();
  }, [state]);

  const addFurnitureToRoom = (item) => {
    const catalogItem = furnitureCatalog.find(f => f.id === item.id);
    setFurniture([
      ...furniture,
      {
        ...item,
        type: item.id,
        image: item.image,
        modelPath: catalogItem?.modelPath,
        color: item.colors ? item.colors[0] : '#888',
        id: Date.now(),
        position: { x: roomSize.width / 2, y: roomSize.length / 2 },
        dimensions: {
          width: item.width || 1,
          length: item.length || 1,
        }
      },
    ]);
    setShowDropdown(false);
  };

  const removeFurniture = (id) => {
    setFurniture(furniture.filter((f) => f.id !== id));
  };

  const updateFurniturePositions = (updatedArray) => {
    setFurniture(updatedArray);
  };

  const capture2DPreview = () => {
    return JSON.stringify({
      width: roomSize.width,
      length: roomSize.length,
      furniture: furniture.map(item => ({
        id: item.id,
        type: item.type,
        position: item.position,
        dimensions: item.dimensions
      })),
      wallColor,
      floorColor
    });
  };

  const handleSaveDesign = async () => {
    if (!currentUser) {
      alert("Please log in to save your design");
      return;
    }

    try {
      const name = designName || "My Living Room Design";
      const preview2D = capture2DPreview();

      // Prepare the design data
      const designData = {
        name,
        customerName: customerName || '',
        userName: userName || '',
        userId: currentUser.uid,
        room: {
          width: Number(roomSize.width),
          length: Number(roomSize.length),
          height: Number(roomSize.height)
        },
        furniture: furniture.map(item => {
          const catalogItem = furnitureCatalog.find(f => f.id === item.type);
          return {
            id: item.id,
            type: item.type,
            name: item.name || catalogItem?.name,
            position: {
              x: Number(item.position.x),
              y: Number(item.position.y)
            },
            dimensions: {
              width: Number(item.dimensions.width),
              length: Number(item.dimensions.length)
            },
            image: item.image,
            modelPath: catalogItem?.modelPath
          };
        }),
        metadata: {
          view: is3DView ? "3D" : "2D",
          scale: 1,
          version: "1.0"
        },
        preview2D,
        wallColor,
        floorColor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      let designRef;
      
      if (isEditing && designId) {
        // Update existing design
        designRef = doc(db, 'designs', designId);
        await updateDoc(designRef, {
          ...designData,
          updatedAt: serverTimestamp()
        });
        
        // Update in user's designs subcollection
        await updateDoc(doc(db, 'users', currentUser.uid, 'userDesigns', designId), {
          ...designData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new design
        designRef = await addDoc(collection(db, 'designs'), designData);
        
        // Add to user's designs subcollection
        await setDoc(doc(db, 'users', currentUser.uid, 'userDesigns', designRef.id), {
          designId: designRef.id,
          ...designData
        });
      }
      
      alert("Design saved successfully!");
      navigate('/'); // Navigate back to home after successful save
    } catch (error) {
      console.error("Error saving design:", error);
      alert(`Failed to save design: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading design...</div>;
  }

  return (
    <div className='designEditor'>
      <nav className='designEditor-nav'>
        <div className="designEditor-nav-left">
          <button onClick={() => navigate('/')} className='designEditor-back-btn'>
            ← Back to Home
          </button>
          <button onClick={() => setShowDropdown((v) => !v)} className='designEditor-add-furniture'>Add Furniture <img src={AddIconWhite} alt="" /></button>
        </div>

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

      <section className='desginEditor-section'>
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
            
            <div className='roomprop-firstrow'>
              <div>
                <p>Height</p>
                <input 
                  type="number" 
                  name='height' 
                  value={roomSize.height} 
                  onChange={(e) => {setRoomSize({...roomSize, height: Number(e.target.value)})}}
                />
              </div>

              <div>
                <p>Width</p>
                <input 
                  type="number" 
                  name='width' 
                  value={roomSize.width} 
                  onChange={(e) => {setRoomSize({...roomSize, width: Number(e.target.value)})}}
                />
              </div>
            </div>

            <div>
              <p>Length</p>
              <input 
                type="number" 
                name='length' 
                value={roomSize.length} 
                onChange={(e) => {setRoomSize({...roomSize, length: Number(e.target.value)})}}
              />
            </div>

            <div className='design-info-section'>
              <h4>Design Information</h4>
              <div className='design-info-item'>
                <p>Customer Name:</p>
                <span>{customerName || 'Not specified'}</span>
              </div>
              <div className='design-info-item'>
                <p>Design Name:</p>
                <span>{designName || 'Not specified'}</span>
              </div>
            </div>

            <button>Delete design</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DesignEditor