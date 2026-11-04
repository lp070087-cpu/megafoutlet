"use client";

import { Canvas } from "@react-three/fiber";
import { ALTURA_ESTANDE } from "./geometria";

export default function MiniaturaEstande({ largura, profundidade }: {
  largura: number;
  profundidade: number;
}) {
  const extent = Math.max(largura + 1.8, profundidade, 3);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [extent * 0.9, extent * 0.9, extent * 1.2], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      onCreated={({ camera }) => camera.lookAt(0.5, 0.6, 0)}
      fallback={<p className="p-4 text-xs text-muted">Miniatura indisponível. Dimensões descritas abaixo.</p>}
      role="img"
      aria-label={`Volume ilustrativo de ${largura} por ${profundidade} metros, ao lado de uma figura humana de 1,70 metro`}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#efe8de"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 9, 7]} intensity={2} />
      <mesh position={[0, ALTURA_ESTANDE / 2, 0]}>
        <boxGeometry args={[largura, ALTURA_ESTANDE, profundidade]} />
        <meshStandardMaterial color="#c34f66" roughness={0.8} />
      </mesh>
      <group position={[largura / 2 + 0.65, 0, 0]}>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color="#353535" />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
          <meshStandardMaterial color="#353535" />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.19, 0.15, 0.6, 10]} />
          <meshStandardMaterial color="#353535" />
        </mesh>
        {[-1, 1].map(side => (
          <group key={side}>
            <mesh position={[side * 0.1, 0.375, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.75, 8]} />
              <meshStandardMaterial color="#353535" />
            </mesh>
            <mesh position={[side * 0.26, 1.05, 0]}>
              <cylinderGeometry args={[0.055, 0.05, 0.6, 8]} />
              <meshStandardMaterial color="#353535" />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0.5, -0.04, 0]}>
        <boxGeometry args={[largura + 2.2, 0.08, profundidade + 1]} />
        <meshStandardMaterial color="#e3dbd0" />
      </mesh>
    </Canvas>
  );
}
