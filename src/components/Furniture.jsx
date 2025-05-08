import React from "react";
import { useGLTF } from "@react-three/drei";

export default function Furniture({ url, position, rotation = [0, 0, 0], scale = [0.5, 0.5, 0.5] }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />;
}