import { useState } from 'react';

const SCALE = 50; // 1 meter = 50px
const CANVAS_SIZE = 600; // 600x600px canvas

const Room2D = ({ roomSize, furniture, onAddFurniture, onUpdateFurniture, onRemoveFurniture, furnitureCatalog }) => {
  const [selectedFurnitureId, setSelectedFurnitureId] = useState('');

  const handleDropdownChange = (e) => {
    setSelectedFurnitureId(e.target.value);
    const item = furnitureCatalog.find(f => f.id === e.target.value);
    if (item) {
      onAddFurniture({
        ...item,
        type: item.id,
        position: { x: roomSize.width / 2, y: roomSize.length / 2 },
        dimensions: {
          width: item.width || 1,
          length: item.length || 1,
        },
        id: Date.now(),
      });
    }
  };

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (event, item) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setDraggedItem(item);
  };

  const handleDrag = (event) => {
    if (!draggedItem) return;
    const rect = event.currentTarget.parentNode.getBoundingClientRect();
    const x = ((event.clientX - rect.left - dragOffset.x) / SCALE);
    const y = ((event.clientY - rect.top - dragOffset.y) / SCALE);
    const updatedFurniture = furniture.map(item => {
      if (item.id === draggedItem.id) {
        return { ...item, position: { x, y } };
      }
      return item;
    });
    if (onUpdateFurniture) {
      onUpdateFurniture(updatedFurniture);
    }
  };

  const handleDragEnd = () => setDraggedItem(null);

  const handleRemoveFurniture = (event, id) => {
    event.stopPropagation();
    onRemoveFurniture(id);
  };

  return (
    <div>
      <select
        value={selectedFurnitureId}
        onChange={handleDropdownChange}
        style={{ padding: '0.5rem 1rem', borderRadius: 8, fontSize: '1rem', marginBottom: 16 }}
      >
        <option value="">Add Furniture...</option>
        {furnitureCatalog.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <div
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          position: 'relative',
          backgroundColor: '#f5f5f5',
          cursor: 'default',
          overflow: 'hidden',
          border: '1px solid #333',
          borderRadius: "10px"
        }}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {furniture.map((item) => {
          const widthPx = (item.dimensions?.width || 1) * SCALE;
          const lengthPx = (item.dimensions?.length || 1) * SCALE;
          const leftPx = (item.position?.x || 0) * SCALE - widthPx / 2;
          const topPx = (item.position?.y || 0) * SCALE - lengthPx / 2;
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                width: `${widthPx}px`,
                height: `${lengthPx}px`,
                left: `${leftPx}px`,
                top: `${topPx}px`,
                cursor: 'move',
                userSelect: 'none',
                zIndex: 2,
              }}
              onMouseDown={(e) => handleDragStart(e, item)}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
              <button
                onClick={(e) => handleRemoveFurniture(e, item.id)}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#a33',
                }}
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Room2D; 