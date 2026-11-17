"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import DiceFace from "./DiceFace";

const REST_Y = -0.5;
const ANIM_SECONDS = 1.3;
const FALL_SECONDS = 1.12;

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBounce = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

// ── Geometrias ─────────────────────────────────────────────────────────────
// d10: bipirâmide pentagonal (10 faces triangulares isósceles — leitura instantânea de d10).
function d10Bipyramid() {
  const H = 1.16;
  const R = 0.8;
  const pos = [];
  const pt = (angleDeg) => [
    Math.cos((angleDeg * Math.PI) / 180) * R,
    0,
    Math.sin((angleDeg * Math.PI) / 180) * R,
  ];
  const top = [0, H, 0];
  const bottom = [0, -H, 0];
  for (let k = 0; k < 5; k += 1) {
    const a = pt(k * 72);
    const b = pt(k * 72 + 72);
    pos.push(...top, ...a, ...b);
    pos.push(...bottom, ...b, ...a);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function boxFaces() {
  const s = 1.46;
  const h = s / 2;
  return [
    { center: [h, 0, 0], normal: [1, 0, 0], kind: "box" },
    { center: [-h, 0, 0], normal: [-1, 0, 0], kind: "box" },
    { center: [0, h, 0], normal: [0, 1, 0], kind: "box" },
    { center: [0, -h, 0], normal: [0, -1, 0], kind: "box" },
    { center: [0, 0, h], normal: [0, 0, 1], kind: "box" },
    { center: [0, 0, -h], normal: [0, 0, -1], kind: "box" },
  ].map((f) => ({ ...f, size: s * 0.66 }));
}

// Extrai faces lógicas (centro, normal, área) de geometrias de "triangle soup".
// Podem existir múltiplos triângulos por face (ex.: pentágonos do d12 são 3 tris);
// os vértices duplicados são removidos antes de tirar a média do centro.
function soupFaces(geometry, trisPerFace) {
  const p = geometry.attributes.position;
  const faces = [];
  const faceCount = p.count / (3 * trisPerFace);
  for (let f = 0; f < faceCount; f += 1) {
    const unique = new Map();
    let area = 0;
    let normal = null;
    for (let t = 0; t < trisPerFace; t += 1) {
      const base = (f * trisPerFace + t) * 3;
      const v0 = new THREE.Vector3().fromBufferAttribute(p, base);
      const v1 = new THREE.Vector3().fromBufferAttribute(p, base + 1);
      const v2 = new THREE.Vector3().fromBufferAttribute(p, base + 2);
      const cross = new THREE.Vector3().crossVectors(v1.clone().sub(v0), v2.clone().sub(v0));
      area += cross.length() * 0.5;
      if (!normal) normal = cross.clone().normalize();
      [v0, v1, v2].forEach((v) => {
        unique.set(v.toArray().map((n) => n.toFixed(4)).join(","), v);
      });
    }
    const center = new THREE.Vector3();
    unique.forEach((v) => center.add(v));
    center.multiplyScalar(1 / unique.size);
    if (normal.dot(center) < 0) normal.negate();
    faces.push({ center: center.toArray(), normal: normal.toArray(), area });
  }
  return faces;
}

function buildDie(sides) {
  if (sides === 6) {
    const geometry = new THREE.BoxGeometry(1.46, 1.46, 1.46);
    return { geometry, faces: boxFaces(), flatShading: false };
  }
  if (sides === 10 || sides === 100) {
    const geometry = d10Bipyramid();
    return { geometry, faces: soupFaces(geometry, 1), flatShading: true };
  }
  let geometry;
  let trisPerFace = 1;
  if (sides === 4) geometry = new THREE.TetrahedronGeometry(1.12, 0);
  else if (sides === 8) geometry = new THREE.OctahedronGeometry(1.14, 0);
  else if (sides === 12) {
    geometry = new THREE.DodecahedronGeometry(1.06, 0);
    trisPerFace = 3;
  } else geometry = new THREE.IcosahedronGeometry(1.1, 0);
  return { geometry, faces: soupFaces(geometry, trisPerFace), flatShading: true };
}

function makeNumberTexture(label) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 256, 256);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 148px Georgia, 'Times New Roman', serif";
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "#1b130a";
  ctx.fillText(String(label), 128, 138);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeDieMesh({ geometry, faces, flatShading }, faceLabels, accent, discarded) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: discarded ? "#8f97a3" : accent,
    roughness: 0.34,
    metalness: 0.18,
    flatShading,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(geometry, bodyMaterial);
  group.add(body);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 12),
    new THREE.LineBasicMaterial({ color: 0x241a10, transparent: true, opacity: 0.9 })
  );
  group.add(edges);

  faces.forEach((face, index) => {
    if (faceLabels[index] === undefined) return;
    const normal = new THREE.Vector3(...face.normal).normalize();
    const center = new THREE.Vector3(...face.center);
    const distance = Math.abs(center.dot(normal));
    const size = face.size ?? (face.area ? Math.sqrt(face.area) * 0.56 : 0.5);
    const plane = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({
      map: makeNumberTexture(faceLabels[index]),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const decal = new THREE.Mesh(plane, material);
    decal.position.copy(normal).multiplyScalar(distance + 0.012);
    const n = normal.clone();
    const up0 = Math.abs(n.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up0, n).normalize();
    const up = new THREE.Vector3().crossVectors(n, right).normalize();
    decal.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, n));
    decal.renderOrder = 2;
    group.add(decal);
  });

  return group;
}

function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.filter(Boolean).forEach((material) => {
      if (material.map) material.map.dispose();
      material.dispose();
    });
  });
}

function randomUnitAxis() {
  const v = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
  return v.lengthSq() > 0.0001 ? v.normalize() : new THREE.Vector3(0, 1, 0);
}

const CAMERA_DIR = new THREE.Vector3(0, 0.16, 1).normalize();

export default function DiceRoll3D({ roll }) {
  const mountRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  const isContest = roll.mode === "advantage" || roll.mode === "disadvantage";
  const allValues = isContest ? roll.rolls.slice(0, 2) : roll.rolls;
  const sides = Number(roll.sides) || 20;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let fallbackFrame;
    const triggerFallback = () => {
      fallbackFrame = window.requestAnimationFrame(() => setFallback(true));
    };

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced || typeof window.WebGLRenderingContext === "undefined") {
      triggerFallback();
      return () => window.cancelAnimationFrame(fallbackFrame);
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      triggerFallback();
      return () => window.cancelAnimationFrame(fallbackFrame);
    }

    const width = Math.max(280, mount.clientWidth || 420);
    const height = 178;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = `${height}px`;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const isD100 = sides === 100;
    const slots = Math.min(allValues.length, 8);
    const spacingBase = isD100 ? 2.35 : 2.15;
    const diceCount = isD100 ? slots * 2 : slots;
    const dieScale = diceCount <= 2 ? 1 : Math.min(0.9, 3.0 / (diceCount + 0.6));
    const spacing = spacingBase * dieScale;
    camera.position.set(0, 0.95, 4.6 + Math.max(0, diceCount - 1) * 1.55);
    camera.lookAt(0, -0.12, 0);

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--theme-accent").trim() || "#d89b38";

    const ambient = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff1dc, 2.35);
    key.position.set(3.2, 4.6, 5.2);
    scene.add(key);
    const rim = new THREE.PointLight(0xffc266, 26, 40, 1.9);
    rim.position.set(-4.2, -1.4, 2.6);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9db4ff, 0.6);
    fill.position.set(-3, 2, -4);
    scene.add(fill);

    // Constrói malhas: para d100, par de dados (dezenas + unidades).
    const builds = [];
    allValues.slice(0, slots).forEach((value, slot) => {
      const spread = (slot - (Math.min(allValues.length, slots) - 1) / 2) * spacing;
      const isDiscarded = isContest && value === roll.discarded && allValues.indexOf(value) === slot;
      if (isD100) {
        const v = Number(value);
        const tens = v === 100 ? 0 : Math.floor(v / 10) * 10;
        const ones = v % 10;
        builds.push({ sides: 10, spread: spread - 0.66 * dieScale, labels: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], targetLabel: tens, discarded: isDiscarded });
        builds.push({ sides: 10, spread: spread + 0.66 * dieScale, labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], targetLabel: ones, discarded: isDiscarded });
      } else {
        const labels = Array.from({ length: sides }, (_, i) => i + 1);
        builds.push({ sides, spread, labels, targetLabel: Number(value), discarded: isDiscarded });
      }
    });

    const dice = [];
    builds.forEach((build) => {
      const { geometry, faces, flatShading } = buildDie(build.sides);
      const mesh = makeDieMesh({ geometry, faces, flatShading }, build.labels, accent, build.discarded);
      mesh.scale.setScalar(dieScale);
      const x = build.spread;
      mesh.position.set(x + (Math.random() - 0.5) * 0.5, 2.15, (Math.random() - 0.5) * 0.4);
      scene.add(mesh);

      const targetIndex = build.labels.findIndex((label) => Number(label) === build.targetLabel);
      const faceIndex = targetIndex >= 0 ? targetIndex : 0;
      const normalLocal = new THREE.Vector3(...faces[faceIndex].normal).normalize();
      const qAlign = new THREE.Quaternion().setFromUnitVectors(normalLocal, CAMERA_DIR);
      const twist = (Math.random() - 0.5) * 1.1;
      const qTilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.24, 0, twist, "XYZ"));
      const qTarget = qTilt.clone().multiply(qAlign);
      const qStart = qTarget
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(randomUnitAxis(), Math.PI * 3.5 + Math.random() * Math.PI * 1.5));
      mesh.quaternion.copy(qStart);

      dice.push({ mesh, qStart, qTarget, x });
    });

    const clock = new THREE.Clock();
    let frameId;
    const render = () => {
      frameId = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      const fallT = clamp01(t / FALL_SECONDS);
      const spinT = clamp01(t / ANIM_SECONDS);
      dice.forEach(({ mesh, qStart, qTarget, x }) => {
        mesh.position.y = REST_Y + 3.3 * (1 - easeOutBounce(fallT));
        mesh.position.x += (x - mesh.position.x) * 0.12;
        mesh.quaternion.slerpQuaternions(qStart, qTarget, easeInOutCubic(spinT));
      });
      renderer.render(scene, camera);
      if (t >= ANIM_SECONDS + 0.15) {
        dice.forEach(({ mesh, qTarget, x }) => {
          mesh.position.y = REST_Y;
          mesh.position.x = x;
          mesh.quaternion.copy(qTarget);
        });
        renderer.render(scene, camera);
        cancelAnimationFrame(frameId);
      }
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      dice.forEach(({ mesh }) => {
        scene.remove(mesh);
        disposeObject(mesh);
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roll.id]);

  if (fallback) {
    return (
      <div className="dice-roll-dice" role="img" aria-label={`Total ${roll.total}`}>
        {allValues.map((value, index) => {
          const discarded = isContest && value === roll.discarded && allValues.indexOf(value) === index;
          return (
            <div key={`${roll.id}-${index}`} className={`dice-static-die${discarded ? " dice-roll-die-discarded" : ""}`}>
              <DiceFace sides={sides} value={value} />
            </div>
          );
        })}
      </div>
    );
  }

  return <div ref={mountRef} className="dice-3d-mount" role="img" aria-label={`Rolagem ${roll.formula}`} />;
}
