"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mountStage } from "../stage";

/**
 * Data Quality: a tilted board of control tiles. Tiles flip from pending
 * grey to passing tint in waves that travel across the board, the way a
 * per-block control set settles at each new tip.
 */
const VERT = /* glsl */ `
uniform float uTime;
attribute vec2 aCell;
attribute float aSeed;
varying float vOn;
varying vec2 vUv;
varying float vFlip;
void main() {
  // A wave sweeps across x; each tile flips slightly after its neighbour.
  float wave = fract(uTime * 0.11 + aCell.x * 0.035 + aSeed * 0.08);
  float on = smoothstep(0.0, 0.08, wave) * (1.0 - smoothstep(0.62, 0.72, wave));
  float flip = smoothstep(0.0, 0.08, wave) * (1.0 - smoothstep(0.08, 0.16, wave));
  float ang = flip * 3.14159;
  vec3 p = position;
  float c = cos(ang), s = sin(ang);
  p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
  p.x += aCell.x;
  p.y += aCell.y;
  vOn = on;
  vFlip = flip;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;
const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRaw;
uniform vec3 uTint;
uniform vec3 uPale;
uniform vec3 uBg;
varying float vOn;
varying vec2 vUv;
varying float vFlip;
void main() {
  vec2 d = min(vUv, 1.0 - vUv);
  float e = min(d.x, d.y);
  float edge = 1.0 - smoothstep(0.0, 0.08, e);
  vec3 offCol = mix(uBg, uRaw, 0.55);
  vec3 onCol = mix(uTint, uPale, 0.15 + 0.35 * vUv.y);
  vec3 col = mix(offCol, onCol, vOn);
  col = mix(col, uPale, vFlip * 0.6);
  col = mix(col, mix(col, uPale, 0.25), edge);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function StatusBoard({ className, tint = "#4ade80", tintLight = "#16a34a" }: { className?: string; tint?: string; tintLight?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return mountStage({
      host: el,
      tint,
      tintLight,
      fov: 30,
      shiftRight: 5,
      build: ({ scene, camera, theme }) => {
        const nx = 22;
        const ny = 12;
        const cells: number[] = [];
        const seeds: number[] = [];
        for (let i = 0; i < nx; i++)
          for (let j = 0; j < ny; j++) {
            cells.push((i - (nx - 1) / 2) * 0.86, (j - (ny - 1) / 2) * 0.86);
            seeds.push(Math.random());
          }
        const plane = new THREE.PlaneGeometry(0.66, 0.66);
        const geo = new THREE.InstancedBufferGeometry();
        geo.index = plane.index;
        geo.setAttribute("position", plane.getAttribute("position"));
        geo.setAttribute("uv", plane.getAttribute("uv"));
        geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(new Float32Array(cells), 2));
        geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
        geo.instanceCount = seeds.length;
        const th = theme();
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: { value: 0 },
            uRaw: { value: th.raw },
            uTint: { value: th.tint },
            uPale: { value: th.tintPale },
            uBg: { value: th.bg },
          },
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        mesh.rotation.set(-0.5, -0.35, 0);
        scene.add(mesh);
        camera.position.set(0, 3.5, 24);
        camera.lookAt(0, 0, 0);
        return {
          update: (t) => {
            mat.uniforms.uTime.value = t;
            mesh.rotation.y = -0.35 + Math.sin(t * 0.07) * 0.05;
          },
          onTheme: (p) => {
            mat.uniforms.uRaw.value = p.raw;
            mat.uniforms.uTint.value = p.tint;
            mat.uniforms.uPale.value = p.tintPale;
            mat.uniforms.uBg.value = p.bg;
          },
          dispose: () => {
            geo.dispose();
            plane.dispose();
            mat.dispose();
          },
        };
      },
    });
  }, [tint, tintLight]);
  return <div ref={host} className={className} aria-hidden="true" />;
}
