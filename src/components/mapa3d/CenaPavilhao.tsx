"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Color, InstancedMesh, Object3D, TOUCH, Vector3 } from "three";
import type { OrbitControls as ControleOrbit } from "three-stdlib";
import { useReducedMotion } from "motion/react";
import { ACESSOS, AREAS_ESPECIAIS, RUAS } from "@/data/areas";
import { ESTANDES, type Estande } from "@/data/planta";
import { GRUPOS_STATUS } from "@/lib/types";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { ALTURA_ESTANDE, CORES_AREAS, DIAGONAL, PISO, ponto, volume, type ComandoCamera } from "./geometria";
import { Fallback2D } from "./EstadosCena";
import { PLANTA_ILUSTRATIVA } from "@/lib/ambiente";

interface Props {
  selecionado: string | null;
  coresPlanta: boolean;
  comando: ComandoCamera;
  onSelecionar: (estande: Estande) => void;
  onFalha: () => void;
}

function Etiqueta({ children, x, y, z }: {
  children: React.ReactNode;
  x: number;
  y: number;
  z: number;
}) {
  return (
    <Html center position={[x, y, z]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <span className="block max-w-32 rounded bg-ivory/90 px-1.5 py-1 text-center text-[9px] leading-tight text-graphite">
        {children}
      </span>
    </Html>
  );
}

function Pavilhao() {
  return (
    <>
      <mesh position={[0, -0.13, 0]}>
        <boxGeometry args={[PISO.largura, 0.25, PISO.profundidade]} />
        <meshStandardMaterial color="#efe8de" roughness={1} />
      </mesh>
      {[-1, 1].map(side => (
        <group key={side}>
          <mesh position={[side * PISO.largura / 2, 0.25, 0]}>
            <boxGeometry args={[0.18, 0.5, PISO.profundidade]} />
            <meshStandardMaterial color="#d5cabc" />
          </mesh>
          <mesh position={[0, 0.25, side * PISO.profundidade / 2]}>
            <boxGeometry args={[PISO.largura, 0.5, 0.18]} />
            <meshStandardMaterial color="#d5cabc" />
          </mesh>
        </group>
      ))}
      {AREAS_ESPECIAIS.map(area => {
        const rect = volume(area);
        const altura = area.tipo === "palco" ? 0.6 : 0.35;
        return (
          <group key={area.id}>
            <mesh position={[rect.x, altura / 2, rect.z]}>
              <boxGeometry args={[rect.largura, altura, rect.profundidade]} />
              <meshStandardMaterial color={CORES_AREAS[area.tipo]} roughness={0.9} />
            </mesh>
            <Etiqueta x={rect.x} y={altura + 0.2} z={rect.z}>
              {area.nome}{area.precisao === "aproximada" && !PLANTA_ILUSTRATIVA ? " · aprox." : ""}
            </Etiqueta>
          </group>
        );
      })}
      {ACESSOS.map(acesso => {
        const [x, z] = ponto(acesso.x, acesso.y);
        const color = acesso.tipo === "emergencia" || acesso.tipo === "saida" ? "#527264" : "#80666b";
        return (
          <group key={acesso.id}>
            <mesh position={[x, 0.7, z]}>
              <cylinderGeometry args={[0.28, 0.28, 1.4, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <Etiqueta x={x} y={2.2} z={z}>{acesso.rotulo}</Etiqueta>
          </group>
        );
      })}
      {RUAS.map((rua, index) => {
        const [x, z] = ponto(rua.x, rua.y);
        return (
          <Html
            key={index}
            transform
            center
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.03, z]}
            distanceFactor={8}
            zIndexRange={[2, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="whitespace-nowrap text-[9px] uppercase tracking-widest text-muted">Rua · {rua.largura}</span>
          </Html>
        );
      })}
    </>
  );
}

function Estandes({ selecionado, coresPlanta, onSelecionar }: Omit<Props, "comando" | "onFalha">) {
  const ref = useRef<InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const { grupoDe } = useStatusEstandes();
  const { invalidate } = useThree();
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    ESTANDES.forEach((estande, index) => {
      const rect = volume(estande);
      dummy.position.set(rect.x, ALTURA_ESTANDE / 2 + (selecionado === estande.id ? 0.25 : 0), rect.z);
      // pequena folga para cada estande ser lido como uma unidade
      dummy.scale.set(Math.max(0.2, rect.largura - 0.18), ALTURA_ESTANDE, Math.max(0.2, rect.profundidade - 0.18));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
  }, [selecionado, dummy, invalidate]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    ESTANDES.forEach((estande, index) => {
      const grupo = GRUPOS_STATUS.find(item => item.id === grupoDe(estande.id));
      color.set(selecionado === estande.id ? "#c34f66" : coresPlanta ? estande.cor : grupo?.cor ?? "#a7a29b");
      if (hover === index && selecionado !== estande.id) color.lerp(new Color("#ffffff"), 0.35);
      mesh.setColorAt(index, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    invalidate();
  }, [grupoDe, coresPlanta, selecionado, hover, color, invalidate]);

  useEffect(() => {
    // padrão R3F: cursor aplicado ao documento enquanto aponta um estande
    document.body.style.cursor = hover === null ? "" : "pointer";
    return () => { document.body.style.cursor = ""; };
  }, [hover]);

  function select(event: ThreeEvent<MouseEvent>) {
    if (event.instanceId === undefined || event.delta > 4) return;
    event.stopPropagation();
    onSelecionar(ESTANDES[event.instanceId]);
  }
  const labels = ESTANDES.filter((item, index) => item.id === selecionado || index === hover);

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, ESTANDES.length]}
        onClick={select}
        onPointerMove={event => { event.stopPropagation(); setHover(event.instanceId ?? null); }}
        onPointerOut={() => setHover(null)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.78} metalness={0} />
      </instancedMesh>
      {labels.map(estande => {
        const rect = volume(estande);
        return (
          <Etiqueta key={estande.id} x={rect.x} y={2.1} z={rect.z}>
            <strong>{estande.numero}</strong> · {estande.id}
          </Etiqueta>
        );
      })}
    </>
  );
}

/** Mantém o alvo dentro do pavilhão e a câmera acima do piso (mutação imperativa do three.js). */
function limitarCamera(controle: ControleOrbit | null, camera: { position: Vector3 }) {
  const alvo = controle?.target;
  if (alvo) {
    alvo.x = Math.max(-PISO.largura / 2, Math.min(PISO.largura / 2, alvo.x));
    alvo.z = Math.max(-PISO.profundidade / 2, Math.min(PISO.profundidade / 2, alvo.z));
    alvo.y = 0;
  }
  camera.position.y = Math.max(1.8, camera.position.y);
}

function Camera({ comando, onFalha }: Pick<Props, "comando" | "onFalha">) {
  const ref = useRef<ControleOrbit>(null);
  const frame = useRef<number | null>(null);
  const { camera, size, invalidate, gl } = useThree();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = gl.domElement;
    function lost(event: Event) { event.preventDefault(); onFalha(); }
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFalha]);

  useLayoutEffect(() => {
    const distance = Math.max(PISO.profundidade, PISO.largura / Math.max(0.3, size.width / size.height)) / (2 * Math.tan(42 * Math.PI / 360)) * 1.2;
    camera.position.copy(new Vector3(0.65, 1, 1).normalize().multiplyScalar(distance));
    camera.lookAt(0, 0, 0);
    ref.current?.target.set(0, 0, 0);
    ref.current?.update();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    if (comando.sequencia === 0 || !ref.current) return;
    const controls = ref.current;
    const start = camera.position.clone();
    const startTarget = controls.target.clone();
    const foco = comando.tipo === "focar" ? comando.alvo : undefined;
    const target = comando.tipo === "geral" ? new Vector3() : foco ? new Vector3(foco.x, 0, foco.z) : startTarget.clone();
    const fit = Math.max(PISO.profundidade, PISO.largura / Math.max(0.3, size.width / size.height)) / (2 * Math.tan(42 * Math.PI / 360)) * 1.2;
    const offset = start.clone().sub(startTarget);
    const distance = foco
      ? Math.min(DIAGONAL * 1.5, Math.max(9, foco.raio * 2.6))
      : Math.min(DIAGONAL * 3, Math.max(5, offset.length() * (comando.tipo === "ampliar" ? 0.72 : 1.38)));
    const end = comando.tipo === "geral"
      ? new Vector3(0.65, 1, 1).normalize().multiplyScalar(fit)
      : target.clone().add(offset.normalize().multiplyScalar(distance));
    const began = performance.now();
    function tick(now: number) {
      const progress = reduced ? 1 : Math.min(1, (now - began) / 550);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(start, end, eased);
      controls.target.lerpVectors(startTarget, target, eased);
      controls.update();
      invalidate();
      frame.current = progress < 1 ? requestAnimationFrame(tick) : null;
    }
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [comando, reduced, camera, size.width, size.height, invalidate]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping={!reduced}
      dampingFactor={0.12}
      minDistance={5}
      maxDistance={DIAGONAL * 3}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2 - 0.08}
      screenSpacePanning={false}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      onStart={() => { if (frame.current !== null) cancelAnimationFrame(frame.current); }}
      onChange={() => limitarCamera(ref.current, camera)}
    />
  );
}

export default function CenaPavilhao(props: Props) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [80, 120, 120], fov: 42, near: 0.1, far: DIAGONAL * 6 }}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      fallback={<Fallback2D />}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#faf7f2"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[30, 70, 30]} intensity={2} />
      <Pavilhao />
      <Estandes selecionado={props.selecionado} coresPlanta={props.coresPlanta} onSelecionar={props.onSelecionar} />
      <Camera comando={props.comando} onFalha={props.onFalha} />
    </Canvas>
  );
}
