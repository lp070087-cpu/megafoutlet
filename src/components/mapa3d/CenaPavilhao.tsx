"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Color, OrthographicCamera, TOUCH, Vector3 } from "three";
import type { OrbitControls as ControleOrbit } from "three-stdlib";
import { useReducedMotion } from "motion/react";
import { ACESSOS, AREAS_ESPECIAIS, RUAS } from "@/data/areas";
import { ESTANDES, type Estande } from "@/data/planta";
import { GRUPOS_STATUS } from "@/lib/types";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { CORES_AREAS, DIAGONAL, PISO, ponto, volume, type ComandoCamera } from "./geometria";
import { Fallback2D } from "./EstadosCena";
import { Edificio, ModulosArquitetonicos, MobiliarioComum } from "./Arquitetura";
import { PLANTA_ILUSTRATIVA } from "@/lib/ambiente";

interface Props {
  visiveis: Set<string>;
  selecionado: string | null;
  coresPlanta: boolean;
  comando: ComandoCamera;
  onSelecionar: (estande: Estande) => void;
  onFalha: () => void;
}

type PortalEtiquetas = RefObject<HTMLDivElement>;

function Etiqueta({ children, x, y, z, portal }: {
  children: React.ReactNode;
  x: number;
  y: number;
  z: number;
  portal: PortalEtiquetas;
}) {
  return (
    <Html center portal={portal} position={[x, y, z]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <span className="block max-w-32 rounded bg-ivory/90 px-1.5 py-1 text-center text-[9px] leading-tight text-graphite">
        {children}
      </span>
    </Html>
  );
}

function Pavilhao({ portal }: { portal: PortalEtiquetas }) {
  const compacto = useThree(state => state.size.width < 560);
  return (
    <>
      <Edificio />
      <MobiliarioComum />
      {AREAS_ESPECIAIS.map(area => {
        const rect = volume(area);
        const altura = area.tipo === "palco" ? 0.6 : 0.35;
        return (
          <group key={area.id}>
            <mesh receiveShadow position={[rect.x, altura / 2, rect.z]}>
              <boxGeometry args={[rect.largura, altura, rect.profundidade]} />
              <meshStandardMaterial color={CORES_AREAS[area.tipo]} roughness={0.9} />
            </mesh>
            {!compacto && (
              <Etiqueta portal={portal} x={rect.x} y={altura + 0.2} z={rect.z}>
                {area.nome}{area.precisao === "aproximada" && !PLANTA_ILUSTRATIVA ? " · aprox." : ""}
              </Etiqueta>
            )}
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
            <Etiqueta portal={portal} x={x} y={2.2} z={z}>{acesso.rotulo}</Etiqueta>
          </group>
        );
      })}
      {RUAS.map((rua, index) => {
        const [x, z] = ponto(rua.x, rua.y);
        return (
          <Html
            key={index}
            portal={portal}
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

function Estandes({ visiveis, selecionado, coresPlanta, onSelecionar, portal }: Omit<Props, "comando" | "onFalha"> & { portal: PortalEtiquetas }) {
  const [hover, setHover] = useState<number | null>(null);
  const { grupoDe } = useStatusEstandes();
  const corDe = useCallback((e: Estande, index: number) => {
    const grupo = GRUPOS_STATUS.find(item => item.id === grupoDe(e.id));
    const cor = new Color(selecionado === e.id ? "#c34f66" : coresPlanta ? e.cor : grupo?.cor ?? "#a7a29b");
    if (hover === index && selecionado !== e.id) cor.lerp(new Color("#ffffff"), 0.28);
    return "#" + cor.getHexString();
  }, [grupoDe, coresPlanta, selecionado, hover]);
  useEffect(() => {
    document.body.style.cursor = hover === null ? "" : "pointer";
    return () => { document.body.style.cursor = ""; };
  }, [hover]);
  return <>
    <ModulosArquitetonicos visiveis={visiveis} corDe={corDe} onSelecionar={onSelecionar} onHover={setHover} />
    {ESTANDES.filter((e,i) => visiveis.has(e.id) && (e.id === selecionado || i === hover)).map(e => {
      const r = volume(e);
      return <Etiqueta key={e.id} portal={portal} x={r.x} y={3.25} z={r.z}><strong>{e.numero}</strong> · {e.dimensao.replace("x", " × ")} m</Etiqueta>;
    })}
  </>;
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

function ajustarVista(camera: OrthographicCamera) {
  camera.position.set(150, 200, 48);
  camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  camera.zoom = 1; camera.updateProjectionMatrix();
  let maxX = 0, maxY = 0;
  for (const x of [-PISO.largura / 2, PISO.largura / 2]) for (const z of [-PISO.profundidade / 2, PISO.profundidade / 2]) for (const y of [-1.1, 3.6]) {
    const p = new Vector3(x,y,z).project(camera);
    maxX = Math.max(maxX, Math.abs(p.x)); maxY = Math.max(maxY, Math.abs(p.y));
  }
  // Frustum follows viewport pixels; preserve a margin on narrow screens too.
  camera.zoom = 0.9 / Math.max(maxX, maxY);
  camera.updateProjectionMatrix();
  return { position: camera.position.clone(), zoom: camera.zoom };
}

/** A câmera é um objeto externo do Three, atualizado imperativamente pelo controle. */
function atualizarZoom(camera: OrthographicCamera, zoom: number) {
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
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
    if (!(camera instanceof OrthographicCamera)) return;
    ajustarVista(camera);
    camera.lookAt(0, 0, 0);
    ref.current?.target.set(0, 0, 0);
    ref.current?.update();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    if (comando.sequencia === 0 || !ref.current) return;
    const controls = ref.current;
    if (!(camera instanceof OrthographicCamera)) return;
    const startZoom = camera.zoom;
    const start = camera.position.clone();
    const startTarget = controls.target.clone();
    const foco = comando.tipo === "focar" ? comando.alvo : undefined;
    const target = comando.tipo === "geral" ? new Vector3() : foco ? new Vector3(foco.x, 0, foco.z) : startTarget.clone();
    const fitted = ajustarVista(camera.clone());
    const endZoom = comando.tipo === "geral" ? fitted.zoom : foco
      ? Math.min(35, Math.min(size.width, size.height) / (foco.raio * 2.6))
      : comando.tipo === "ampliar" ? Math.min(45, startZoom * 1.38)
      : comando.tipo === "reduzir" ? Math.max(0.5, startZoom * 0.72) : startZoom;
    const offset = start.clone().sub(startTarget);
    // Zoom ortográfico preserva a distância segura das paredes.
    const distance = Math.max(DIAGONAL, offset.length());
    const end = comando.tipo === "superior"
      ? target.clone().add(new Vector3(0, Math.max(9, offset.length()), 0.01))
      : comando.tipo === "geral"
      ? fitted.position
      : target.clone().add(offset.normalize().multiplyScalar(distance));
    const began = performance.now();
    function tick(now: number) {
      const progress = reduced ? 1 : Math.min(1, (now - began) / 550);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(start, end, eased);
      atualizarZoom(camera as OrthographicCamera, startZoom + (endZoom - startZoom) * eased);
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
      minZoom={0.5}
      maxZoom={45}
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
  const portal = useRef<HTMLDivElement>(null!);
  return (
    <div className="relative h-full">
      <div ref={portal} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      <Canvas
        orthographic
        shadows="soft"
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ position: [150, 200, 48], zoom: 4, near: 0.1, far: DIAGONAL * 6 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.domElement.dataset.mapVersion = "arquitetura-v2"; }}
        fallback={<Fallback2D />}
        style={{ touchAction: "none" }}
      >
        <color attach="background" args={["#f4f6f8"]} />
        <hemisphereLight args={["#ffffff", "#a8b3c4", 1.5]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          castShadow position={[-40, 90, 35]} intensity={2.6}
          shadow-mapSize={[2048, 2048]} shadow-radius={4} shadow-bias={-0.001} shadow-normalBias={0.08}
          shadow-camera-left={-DIAGONAL / 2} shadow-camera-right={DIAGONAL / 2}
          shadow-camera-top={DIAGONAL / 2} shadow-camera-bottom={-DIAGONAL / 2}
          shadow-camera-far={DIAGONAL * 3}
        />
        <Pavilhao portal={portal} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.12, 0]}>
          <planeGeometry args={[PISO.largura * 1.6, PISO.profundidade * 1.6]} />
          <meshStandardMaterial color="#f4f6f8" roughness={1} />
        </mesh>
        <Estandes portal={portal} visiveis={props.visiveis} selecionado={props.selecionado} coresPlanta={props.coresPlanta} onSelecionar={props.onSelecionar} />
        <Camera comando={props.comando} onFalha={props.onFalha} />
      </Canvas>
    </div>
  );
}
