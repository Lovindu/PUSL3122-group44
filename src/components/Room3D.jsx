import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Box, useGLTF, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

const furnitureTypes = {
  bunkbed: { 
    modelPath: '/models/bunk-bed.glb',
    scale: 0.3,
    height: 0
  },
  chair: { 
    modelPath: '/models/chair.glb',
    scale: 1,
    height: 0
  },
  TvStand: {
    modelPath: '/models/Tv-stand.glb',
    scale: 1,
    height: 0
  },
  table: {
    modelPath: "/models/table.glb",
    scale: 8,
    height: 0
  },
  fan: {
    modelPath: "/models/table_fan.glb",
    scale: 1,
    height: 0
  },
};

function Furniture({ type, position, dimensions, modelPath }) {
  const furnitureType = furnitureTypes[type];
  const modelPathToUse = modelPath || furnitureType?.modelPath;
  
  if (!modelPathToUse) {
    console.warn(`No model path found for furniture type: ${type}`);
    return null;
  }

  try {
    const { scene } = useGLTF(modelPathToUse);
    
    // Clone the scene to avoid issues with multiple instances
    const clonedScene = scene.clone();
    
    return (
      <primitive
        object={clonedScene}
        position={[position.x, (furnitureType?.height || 0.5) / 2, position.y]}
        scale={furnitureType?.scale || 1}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    console.error(`Error loading model for ${type}:`, error);
    return null;
  }
}

const Room3D = ({ roomSize, furniture, wallColor, floorColor }) => {
  const roomGeometry = useMemo(() => {
    return {
      width: roomSize.width,
      length: roomSize.length,
      height: 3, // Room height in meters
    };
  }, [roomSize]);

  return (
    <div style={{ width: '100%', height: '600px', background: '#1a1a1a' }}>
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 75 }}
        shadows
        dpr={[1, 2]}
      >
        <color attach="background" args={['#1a1a1a']} />
        <fog attach="fog" args={['#1a1a1a', 5, 20]} />
        
        {/* Main ambient light - increased intensity */}
        <ambientLight intensity={0.6} />
        
        {/* Multiple directional lights from different angles */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.8}
          castShadow
        />
        <directionalLight
          position={[0, 10, 10]}
          intensity={0.8}
          castShadow
        />
        <directionalLight
          position={[0, 10, -10]}
          intensity={0.8}
          castShadow
        />
        
        {/* Ceiling lights */}
        <pointLight position={[0, 2.8, 0]} intensity={1} color="#ffffff" />
        <pointLight position={[roomGeometry.width/2, 2.8, roomGeometry.length/2]} intensity={1} color="#ffffff" />
        <pointLight position={[-roomGeometry.width/2, 2.8, -roomGeometry.length/2]} intensity={1} color="#ffffff" />
        
        {/* Wall-mounted lights */}
        <pointLight position={[0, 1.5, roomGeometry.length]} intensity={0.8} color="#ffffff" />
        <pointLight position={[roomGeometry.width, 1.5, 0]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 1.5, 0]} intensity={0.8} color="#ffffff" />
        <pointLight position={[roomGeometry.width, 1.5, roomGeometry.length]} intensity={0.8} color="#ffffff" />
        
        {/* Room floor */}
        <Box
          args={[roomGeometry.width, 0.1, roomGeometry.length]}
          position={[roomGeometry.width / 2, -0.05, roomGeometry.length / 2]}
          receiveShadow
        >
          <meshStandardMaterial color={floorColor} />
        </Box>

        {/* Room walls */}
        <Box
          args={[roomGeometry.width, roomGeometry.height, 0.1]}
          position={[roomGeometry.width / 2, roomGeometry.height / 2, 0]}
          receiveShadow
        >
          <meshStandardMaterial color={wallColor} />
        </Box>
        <Box
          args={[roomGeometry.width, roomGeometry.height, 0.1]}
          position={[roomGeometry.width / 2, roomGeometry.height / 2, roomGeometry.length]}
          receiveShadow
        >
          <meshStandardMaterial color={wallColor} />
        </Box>
        <Box
          args={[0.1, roomGeometry.height, roomGeometry.length]}
          position={[0, roomGeometry.height / 2, roomGeometry.length / 2]}
          receiveShadow
        >
          <meshStandardMaterial color={wallColor} />
        </Box>
        <Box
          args={[0.1, roomGeometry.height, roomGeometry.length]}
          position={[roomGeometry.width, roomGeometry.height / 2, roomGeometry.length / 2]}
          receiveShadow
        >
          <meshStandardMaterial color={wallColor} />
        </Box>

        {/* Furniture */}
        {furniture.map((item) => (
          <Furniture
            key={item.id}
            type={item.type}
            position={item.position}
            dimensions={item.dimensions}
            modelPath={item.modelPath}
          />
        ))}

        {/* Environment and shadows */}
        <Environment preset="city" />
        <AccumulativeShadows
          temporal
          frames={100}
          alphaTest={0.85}
          opacity={0.8}
          scale={10}
          position={[0, -0.05, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={5}
            intensity={0.5}
            ambient={0.5}
            position={[5, 5, -5]}
          />
        </AccumulativeShadows>

        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default Room3D; 