"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mountStage } from "@/components/fx/stage";

/**
 * The specimen: one Litecoin block as a physical object, lit in a dark
 * room, that changes state through the six gates of the pipeline.
 * Progress runs 0..6 (one unit per gate) and is set from the pinned
 * ScrollTrigger; the scene eases toward it every frame.
 *
 *  0..1 Parse        raw grey block, slowly turning
 *  1..2 Store        floor and contact shadow appear, the block settles
 *  2..3 Reconcile    three ledger rings swing in and lock to the axes
 *  3..4 Validate     block turns accent, scan bands sweep its faces
 *  4..5 Cross-check  a glass twin from the node slides in and snaps on
 *  5..6 Verify       block goes green and breathes light
 */
export interface SpecimenHandle {
  set: (p: number) => void;
}

const BLOCK_VERT = /* glsl */ `
varying vec3 vN;
varying vec2 vUv;
varying vec3 vNv;
varying vec3 vV;
varying vec3 vP;
void main() {
  vN = normal;
  vUv = uv;
  vP = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNv = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const BLOCK_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRawA;
uniform vec3 uRawB;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform vec3 uGoodA;
uniform vec3 uGoodB;
uniform vec3 uEdge;
uniform vec3 uLight;
uniform float uState;
uniform float uGood;
uniform float uScan;
uniform float uScanOn;
uniform float uFlash;
uniform float uGlow;
uniform float uGhost;
varying vec3 vN;
varying vec2 vUv;
varying vec3 vNv;
varying vec3 vV;
varying vec3 vP;
void main() {
  vec3 n = normalize(vN);
  float ndl = clamp(dot(n, normalize(uLight)), 0.0, 1.0);
  float fill2 = clamp(dot(n, normalize(vec3(-0.6, 0.2, -0.5))), 0.0, 1.0) * 0.35;
  float rim = pow(1.0 - clamp(dot(normalize(vNv), normalize(vV)), 0.0, 1.0), 3.5);
  vec2 fw = fwidth(vUv);
  vec2 d = min(vUv, 1.0 - vUv);
  float e = min(d.x, d.y);
  float w = max(fw.x, fw.y) * 1.2;
  float edge = 1.0 - smoothstep(w, w * 2.6, e);

  vec3 raw = mix(uRawB, uRawA, 0.2 + 0.8 * ndl + fill2);
  vec3 tint = mix(uTintB, uTintA, 0.25 + 0.75 * ndl + fill2);
  vec3 good = mix(uGoodB, uGoodA, 0.25 + 0.75 * ndl + fill2);
  vec3 col = mix(raw, tint, uState);
  col = mix(col, good, uGood);
  col *= 0.9 + 0.1 * vUv.y;
  col = mix(col, uEdge, rim * (0.22 + 0.25 * uState));
  col = mix(col, mix(col, uEdge, 0.35), edge * (0.5 + 0.5 * uState));

  // Validation scan: a thin luminous band travelling up the block.
  float band = exp(-abs(vP.y - uScan) * 22.0) * uScanOn;
  col = mix(col, uEdge, band * 0.85);
  col = mix(col, uEdge, uFlash * 0.75);
  col += uEdge * uGlow * 0.18;

  if (uGhost > 0.5) {
    float a = 0.10 + edge * 0.85 + rim * 0.25;
    gl_FragColor = vec4(mix(col, uEdge, 0.5), a);
    return;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

const FLOOR_VERT = /* glsl */ `
varying vec3 vP;
void main() {
  vP = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FLOOR_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uLine;
uniform vec3 uBg;
uniform float uAlpha;
uniform float uShadow;
varying vec3 vP;
void main() {
  vec2 g = abs(fract(vP.xy * 0.9 + 0.5) - 0.5) / fwidth(vP.xy * 0.9);
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  float r = length(vP.xy);
  float fade = 1.0 - smoothstep(1.2, 5.2, r);
  float shadow = exp(-r * r * 0.9) * uShadow;
  float a = (line * 0.8 * fade + shadow * 0.9) * uAlpha;
  vec3 col = mix(uLine, uBg * 0.2, shadow);
  gl_FragColor = vec4(col, a);
}
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const seg = (p: number, a: number, b: number) => ease((p - a) / (b - a));

export const BlockSpecimen = forwardRef<SpecimenHandle, { className?: string }>(function BlockSpecimen({ className }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const target = useRef(0);

  useImperativeHandle(ref, () => ({ set: (p: number) => (target.current = p) }), []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return mountStage({
      host: el,
      tint: "#3b82f6",
      tintLight: "#3b82f6",
      fov: 28,
      build: ({ scene, camera }) => {
        camera.position.set(0, 1.6, 7.4);
        camera.lookAt(0, 0.02, 0);

        const edge = new THREE.Color("#dbe7ff");
        const uniforms = {
          uRawA: { value: new THREE.Color("#5a6580") },
          uRawB: { value: new THREE.Color("#1a2130") },
          uTintA: { value: new THREE.Color("#5b9dff") },
          uTintB: { value: new THREE.Color("#1e3fa6") },
          uGoodA: { value: new THREE.Color("#5fe39a") },
          uGoodB: { value: new THREE.Color("#146b44") },
          uEdge: { value: edge },
          uLight: { value: new THREE.Vector3(0.55, 1.0, 0.8) },
          uState: { value: 0 },
          uGood: { value: 0 },
          uScan: { value: -2 },
          uScanOn: { value: 0 },
          uFlash: { value: 0 },
          uGlow: { value: 0 },
          uGhost: { value: 0 },
        };

        const geo = new RoundedBoxGeometry(1.25, 1.25, 1.25, 5, 0.08);
        const blockMat = new THREE.ShaderMaterial({ uniforms, vertexShader: BLOCK_VERT, fragmentShader: BLOCK_FRAG });
        const block = new THREE.Mesh(geo, blockMat);
        scene.add(block);

        // The node's copy of the block: same shape, glass.
        const ghostUniforms = THREE.UniformsUtils.clone(uniforms);
        ghostUniforms.uGhost.value = 1;
        ghostUniforms.uState.value = 1;
        const ghostMat = new THREE.ShaderMaterial({
          uniforms: ghostUniforms,
          vertexShader: BLOCK_VERT,
          fragmentShader: BLOCK_FRAG,
          transparent: true,
          depthWrite: false,
        });
        const ghost = new THREE.Mesh(geo, ghostMat);
        ghost.visible = false;
        scene.add(ghost);

        // Ledger rings.
        const ringGeo = new THREE.TorusGeometry(1.18, 0.011, 8, 160);
        const rings = [0, 1, 2].map(() => {
          const m = new THREE.MeshBasicMaterial({ color: new THREE.Color("#8fb6ff"), transparent: true, opacity: 0, depthWrite: false });
          const r = new THREE.Mesh(ringGeo, m);
          scene.add(r);
          return r;
        });
        const ringRest = [
          new THREE.Euler(Math.PI / 2, 0, 0),
          new THREE.Euler(0, 0, 0),
          new THREE.Euler(0, Math.PI / 2, 0),
        ];
        const ringLoose = [
          new THREE.Euler(1.1, 0.6, 0.3),
          new THREE.Euler(0.5, -0.9, 1.2),
          new THREE.Euler(-0.8, 1.4, -0.4),
        ];

        // Floor with contact shadow.
        const floorU = {
          uLine: { value: new THREE.Color("#3a4766") },
          uBg: { value: new THREE.Color("#04060b") },
          uAlpha: { value: 0 },
          uShadow: { value: 0 },
        };
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(14, 14),
          new THREE.ShaderMaterial({ uniforms: floorU, vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, transparent: true, depthWrite: false }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.64;
        scene.add(floor);

        let cur = 0;
        let spin = 0;
        const tmpE = new THREE.Euler();

        const update = (t: number, dt: number) => {
          cur += (target.current - cur) * Math.min(1, dt * 7);
          const p = cur;
          spin += dt * 0.22;

          // Block pose: floats and turns while raw, settles once stored.
          const settle = seg(p, 1.15, 1.85);
          const hover = (1 - settle) * (0.3 + Math.sin(t * 0.9) * 0.05);
          block.position.y = hover;
          block.rotation.set(0.28 + (1 - settle) * 0.22 * Math.sin(t * 0.5), spin + p * 0.55, 0);

          // Floor.
          floorU.uAlpha.value = seg(p, 1.0, 1.5);
          floorU.uShadow.value = settle;

          // Rings.
          const ringIn = seg(p, 2.0, 2.35);
          const ringOut = 1 - seg(p, 3.0, 3.35);
          const lock = seg(p, 2.35, 2.9);
          rings.forEach((r, i) => {
            const a = ringLoose[i];
            const b = ringRest[i];
            tmpE.set(a.x + (b.x - a.x) * lock, a.y + (b.y - a.y) * lock + (1 - lock) * t * (0.6 + i * 0.2), a.z + (b.z - a.z) * lock);
            r.rotation.copy(tmpE);
            r.position.y = block.position.y;
            (r.material as THREE.MeshBasicMaterial).opacity = ringIn * ringOut * (0.55 + 0.45 * lock);
          });

          // State colour and validation scans.
          uniforms.uState.value = seg(p, 3.0, 3.5);
          const scanSpan = clamp01((p - 3.25) / 0.7);
          const scanOn = scanSpan > 0 && scanSpan < 1 ? 1 : 0;
          uniforms.uScanOn.value = scanOn;
          uniforms.uScan.value = -0.75 + ((scanSpan * 3) % 1) * 1.5;

          // The node's twin slides in from the right and snaps into the block.
          const twinIn = seg(p, 4.0, 4.7);
          const twinOut = seg(p, 4.8, 5.0);
          ghost.visible = twinIn > 0 && twinOut < 1;
          ghost.position.set((1 - twinIn) * 2.1, block.position.y + (1 - twinIn) * 0.35, (1 - twinIn) * -0.6);
          ghost.rotation.set(block.rotation.x + (1 - twinIn) * 0.5, block.rotation.y + (1 - twinIn) * 0.9, (1 - twinIn) * 0.3);
          ghost.scale.setScalar(1 + (1 - twinIn) * 0.05);
          ghostMat.opacity = 1 - twinOut;
          const snap = seg(p, 4.68, 4.74) * (1 - seg(p, 4.74, 5.05));
          uniforms.uFlash.value = snap;

          // Verified.
          const good = seg(p, 5.0, 5.5);
          uniforms.uGood.value = good;
          uniforms.uGlow.value = good * (0.5 + 0.5 * Math.sin(t * 2.2));
        };

        return {
          update,
          dispose: () => {
            geo.dispose();
            ringGeo.dispose();
            blockMat.dispose();
            ghostMat.dispose();
            rings.forEach((r) => (r.material as THREE.Material).dispose());
            floor.geometry.dispose();
            (floor.material as THREE.Material).dispose();
          },
        };
      },
    });
  }, []);

  return <div ref={host} className={className} aria-hidden="true" />;
});
