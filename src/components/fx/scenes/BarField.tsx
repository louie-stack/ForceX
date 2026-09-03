"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mountStage } from "../stage";

/**
 * Xamine: a terrain of columns whose heights move like a live metric
 * surface. Heights are computed in the vertex shader from time, so the CPU
 * does nothing per frame beyond a uniform.
 */
const VERT = /* glsl */ `
uniform float uTime;
attribute vec2 aCell;
attribute float aSeed;
varying float vH;
varying vec3 vN;
varying vec2 vUv;
varying float vDepth;
float field(vec2 p, float t) {
  float a = sin(p.x * 0.55 + t * 0.6) * 0.5 + 0.5;
  float b = sin(p.y * 0.7 - t * 0.45 + p.x * 0.2) * 0.5 + 0.5;
  float c = sin((p.x + p.y) * 0.35 + t * 0.9) * 0.5 + 0.5;
  return 0.35 + (a * 0.45 + b * 0.35 + c * 0.2) * 3.4;
}
void main() {
  float h = field(aCell, uTime) * (0.85 + aSeed * 0.3);
  vec3 p = position;
  p.y = (p.y + 0.5) * h;
  p.x += aCell.x;
  p.z += aCell.y;
  vH = h;
  vN = normal;
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp((-mv.z - 12.0) / 40.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uBg;
uniform vec3 uTint;
uniform vec3 uDeep;
uniform vec3 uPale;
varying float vH;
varying vec3 vN;
varying vec2 vUv;
varying float vDepth;
void main() {
  vec3 n = normalize(vN);
  float ndl = clamp(dot(n, normalize(vec3(-0.4, 1.0, 0.6))), 0.0, 1.0);
  float top = clamp(n.y, 0.0, 1.0);
  float hh = clamp(vH / 4.2, 0.0, 1.0);
  vec3 col = mix(uDeep, uTint, 0.25 + 0.75 * ndl);
  col = mix(col, uPale, top * hh * 0.55);
  col = mix(uDeep * 0.6, col, 0.35 + 0.65 * vUv.y);
  col = mix(col, uBg, vDepth);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function BarField({ className, tint = "#2dd4bf", tintLight = "#0d9488" }: { className?: string; tint?: string; tintLight?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return mountStage({
      host: el,
      tint,
      tintLight,
      fov: 30,
      shiftRight: 4.5,
      build: ({ scene, camera, theme }) => {
        const nx = 26;
        const nz = 16;
        const cells: number[] = [];
        const seeds: number[] = [];
        for (let i = 0; i < nx; i++)
          for (let j = 0; j < nz; j++) {
            cells.push((i - (nx - 1) / 2) * 0.9, (j - (nz - 1) / 2) * 0.9);
            seeds.push(Math.random());
          }
        const box = new THREE.BoxGeometry(0.52, 1, 0.52);
        const geo = new THREE.InstancedBufferGeometry();
        geo.index = box.index;
        geo.setAttribute("position", box.getAttribute("position"));
        geo.setAttribute("normal", box.getAttribute("normal"));
        geo.setAttribute("uv", box.getAttribute("uv"));
        geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(new Float32Array(cells), 2));
        geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
        geo.instanceCount = seeds.length;
        const th = theme();
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms: {
            uTime: { value: 0 },
            uBg: { value: th.bg },
            uTint: { value: th.tint },
            uDeep: { value: th.tintDeep },
            uPale: { value: th.tintPale },
          },
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.frustumCulled = false;
        mesh.rotation.y = -0.55;
        scene.add(mesh);
        camera.position.set(0, 9.5, 22);
        camera.lookAt(0, 0.6, -2);
        return {
          update: (t) => {
            mat.uniforms.uTime.value = t;
            mesh.rotation.y = -0.55 + Math.sin(t * 0.08) * 0.06;
          },
          onTheme: (p) => {
            mat.uniforms.uBg.value = p.bg;
            mat.uniforms.uTint.value = p.tint;
            mat.uniforms.uDeep.value = p.tintDeep;
            mat.uniforms.uPale.value = p.tintPale;
          },
          dispose: () => {
            geo.dispose();
            box.dispose();
            mat.dispose();
          },
        };
      },
    });
  }, [tint, tintLight]);
  return <div ref={host} className={className} aria-hidden="true" />;
}
