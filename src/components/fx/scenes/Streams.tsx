"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mountStage } from "../stage";

/**
 * Xtract: data streams. Packets race along curved lanes from the chain on
 * the left to the consumer on the right, each lane a faint hairline, each
 * packet a bright head with a fading tail.
 */
const VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aLane;
attribute float aPhase;
attribute float aSpeed;
attribute float aTail;
uniform vec3 uPts[128];
varying float vTail;
varying float vDepth;
vec3 laneAt(float lane, float u) {
  float fi = lane * 16.0 + u * 15.0;
  int i = int(floor(fi));
  float f = fract(fi);
  vec3 a = uPts[i];
  vec3 b = uPts[min(i + 1, 127)];
  return mix(a, b, f);
}
void main() {
  float u = fract(aPhase + uTime * aSpeed) ;
  u = clamp(u - aTail * 0.06, 0.0, 1.0);
  vec3 p = laneAt(aLane, u);
  vTail = aTail;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp((-mv.z - 10.0) / 30.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (aTail < 0.01 ? 11.0 : 7.0 - aTail * 4.5) * uPixelRatio * (18.0 / -mv.z);
}
`;
const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uTint;
uniform vec3 uPale;
uniform float uOpacity;
varying float vTail;
varying float vDepth;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.12, r);
  vec3 col = mix(uPale, uTint, clamp(vTail, 0.0, 1.0));
  float a = soft * (1.0 - vTail * 0.85) * (1.0 - vDepth * 0.5) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

export function Streams({ className, tint = "#a78bfa", tintLight = "#7c3aed" }: { className?: string; tint?: string; tintLight?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return mountStage({
      host: el,
      tint,
      tintLight,
      fov: 30,
      shiftRight: 4,
      build: ({ scene, camera, theme, renderer }) => {
        // Eight lanes, 16 samples each, packed into one uniform array.
        const lanes = 8;
        const pts: THREE.Vector3[] = [];
        const lineGeos: THREE.BufferGeometry[] = [];
        for (let l = 0; l < lanes; l++) {
          const y = (l - (lanes - 1) / 2) * 1.15;
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-14, y * 0.25 - 1.5, -6 + l * 0.3),
            new THREE.Vector3(-6, y * 0.7 - 0.6, -2),
            new THREE.Vector3(2, y * 1.05 + 0.2, 1),
            new THREE.Vector3(12, y * 1.25 + 0.6, 2.5),
          ]);
          const sampled = curve.getPoints(15);
          pts.push(...sampled);
          lineGeos.push(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)));
        }
        const th = theme();
        const lineMat = new THREE.LineBasicMaterial({ color: th.tint, transparent: true, opacity: th.light ? 0.4 : 0.42 });
        const lines = lineGeos.map((g) => new THREE.Line(g, lineMat));
        lines.forEach((ln) => scene.add(ln));

        const perLane = 10;
        const tailN = 9;
        const count = lanes * perLane * tailN;
        const lane = new Float32Array(count);
        const phase = new Float32Array(count);
        const speed = new Float32Array(count);
        const tail = new Float32Array(count);
        let k = 0;
        for (let l = 0; l < lanes; l++)
          for (let p = 0; p < perLane; p++) {
            const ph = Math.random();
            const sp = 0.07 + Math.random() * 0.06;
            for (let tl = 0; tl < tailN; tl++) {
              lane[k] = l;
              phase[k] = ph;
              speed[k] = sp;
              tail[k] = tl / (tailN - 1);
              k++;
            }
          }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        geo.setAttribute("aLane", new THREE.BufferAttribute(lane, 1));
        geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
        geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
        geo.setAttribute("aTail", new THREE.BufferAttribute(tail, 1));
        geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          depthWrite: false,
          blending: th.light ? THREE.NormalBlending : THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() },
            uPts: { value: pts },
            uTint: { value: th.tint },
            uPale: { value: th.tintPale },
            uOpacity: { value: 1 },
          },
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        scene.add(points);

        // Consumer bracket at the right: two short verticals where the lanes land.
        const bracketGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(12.6, -5.2, 2.5),
          new THREE.Vector3(12.6, 5.6, 2.5),
        ]);
        const bracketMat = new THREE.LineBasicMaterial({ color: th.tint, transparent: true, opacity: 0.6 });
        const bracket = new THREE.Line(bracketGeo, bracketMat);
        scene.add(bracket);

        camera.position.set(0, 1.2, 24);
        camera.lookAt(0, 0.4, 0);
        scene.rotation.y = -0.22;
        return {
          update: (t) => {
            mat.uniforms.uTime.value = t;
            scene.rotation.y = -0.22 + Math.sin(t * 0.1) * 0.04;
          },
          onTheme: (p) => {
            lineMat.color = p.tint;
            lineMat.opacity = p.light ? 0.4 : 0.42;
            bracketMat.color = p.tint;
            mat.uniforms.uTint.value = p.tint;
            mat.uniforms.uPale.value = p.tintPale;
            mat.blending = p.light ? THREE.NormalBlending : THREE.AdditiveBlending;
            mat.needsUpdate = true;
          },
          dispose: () => {
            lineGeos.forEach((g) => g.dispose());
            lineMat.dispose();
            geo.dispose();
            mat.dispose();
            bracketGeo.dispose();
            bracketMat.dispose();
          },
        };
      },
    });
  }, [tint, tintLight]);
  return <div ref={host} className={className} aria-hidden="true" />;
}
