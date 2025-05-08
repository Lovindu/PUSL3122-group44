import React from "react";
import * as THREE from "three";

export default function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 1.5, 3]}>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.BackSide} />
      </mesh>

      <mesh position={[-4, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.BackSide} />
      </mesh>

      <mesh position={[4, 1.5, 0]}>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#eeeeee" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
