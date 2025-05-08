import React from 'react';
import "./DesignEditor.css";
import AddIconWhite from "../assets/Plus-white.png";
import './DesignEditor.css';
import { useState } from 'react';
import Room2D from '../components/Room2D';
import Room3D from '../components/Room3D';

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
  const [is3DView, setIs3DView] = useState(false);
  const [roomSize] = useState({ width: 10, length: 10, height: 3 });
  const [furniture, setFurniture] = useState([]);
  const [wallColor, setWallColor] = useState('#e0e0e0');
  const [floorColor, setFloorColor] = useState('#eaeaea');
  const [showDropdown, setShowDropdown] = useState(false);

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
          <button className='designEditor-button-save'>Save</button>
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
            <div className='roomprop-firstrow'>
              <div>
                <p>Height</p>
                <input type="number" name='height' value={roomSize.height}/>
              </div>

              <div>
                <p>Width</p>
                <input type="number" name='width' value={roomSize.width}/>
              </div>
            </div>

            <div>
              <p>Length</p>
              <input type="number" name='length' value={roomSize.length}/>
            </div>
            <button>Delete design</button>
          </div>

        </div>
      </section>
    </div>
  )
}

export default DesignEditor