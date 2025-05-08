import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Room from "./Room";
import Furniture from "./Furniture";

export default function RoomDesigner() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Room />

        {/* Add furniture with props */}
        <Furniture url="/models/bunk-bed.glb" position={[1, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Furniture url="/models/chair.glb" position={[-1, 0, -1]} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}