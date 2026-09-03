"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mountStage } from "../stage";

/**
 * MCP and Address LinX: a relationship graph. A hub, a shell of nodes,
 * hairline links, and pulses that travel hub to node and node to node.
 * The whole graph turns slowly.
 */
const PULSE_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aPhase;
attribute float aSpeed;
varying float vAlpha;
void main() {
  float u = fract(aPhase + uTime * aSpeed);
  vec3 p = mix(aFrom, aTo, u);
  vAlpha = sin(u * 3.14159);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 6.0 * uPixelRatio * (16.0 / -mv.z);
}
`;
const PULSE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uPale;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, r);
  gl_FragColor = vec4(uPale, soft * vAlpha);
}
`;

export function NodeGraph({ className, tint = "#f472b6", tintLight = "#db2777" }: { className?: string; tint?: string; tintLight?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return mountStage({
      host: el,
      tint,
      tintLight,
      fov: 30,
      shiftRight: 5.5,
      build: ({ scene, camera, theme, renderer }) => {
        const th = theme();
        const N = 26;
        const nodes: THREE.Vector3[] = [];
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th2 = golden * i;
          const rad = 5.2 + (i % 3) * 0.9;
          nodes.push(new THREE.Vector3(Math.cos(th2) * r * rad, y * rad * 0.8, Math.sin(th2) * r * rad));
        }
        const hub = new THREE.Vector3(0, 0, 0);
        const links: [THREE.Vector3, THREE.Vector3][] = [];
        nodes.forEach((n) => links.push([hub, n]));
        for (let i = 0; i < N; i++) {
          const j = (i * 7 + 3) % N;
          if (nodes[i].distanceTo(nodes[j]) < 7.5) links.push([nodes[i], nodes[j]]);
        }
        const linePts: THREE.Vector3[] = [];
        links.forEach(([a, b]) => linePts.push(a, b));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
        const lineMat = new THREE.LineBasicMaterial({ color: th.tint, transparent: true, opacity: th.light ? 0.3 : 0.25 });
        scene.add(new THREE.LineSegments(lineGeo, lineMat));

        // Nodes as small discs
        const nodeGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const nodeMat = new THREE.MeshBasicMaterial({ color: th.tintPale });
        const nodeMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, N + 1);
        const m = new THREE.Matrix4();
        nodes.forEach((n, i) => nodeMesh.setMatrixAt(i, m.makeTranslation(n.x, n.y, n.z)));
        nodeMesh.setMatrixAt(N, m.makeScale(2.2, 2.2, 2.2));
        scene.add(nodeMesh);
        const ringGeo = new THREE.RingGeometry(0.55, 0.6, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: th.tint, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        scene.add(ring);

        // Pulses
        const P = links.length * 2;
        const from = new Float32Array(P * 3);
        const to = new Float32Array(P * 3);
        const phase = new Float32Array(P);
        const speed = new Float32Array(P);
        for (let i = 0; i < P; i++) {
          const [a, b] = links[i % links.length];
          const flip = i >= links.length;
          const s = flip ? b : a;
          const e = flip ? a : b;
          from.set([s.x, s.y, s.z], i * 3);
          to.set([e.x, e.y, e.z], i * 3);
          phase[i] = Math.random();
          speed[i] = 0.12 + Math.random() * 0.12;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(P * 3), 3));
        pGeo.setAttribute("aFrom", new THREE.BufferAttribute(from, 3));
        pGeo.setAttribute("aTo", new THREE.BufferAttribute(to, 3));
        pGeo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
        pGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
        pGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
        const pMat = new THREE.ShaderMaterial({
          vertexShader: PULSE_VERT,
          fragmentShader: PULSE_FRAG,
          transparent: true,
          depthWrite: false,
          blending: th.light ? THREE.NormalBlending : THREE.AdditiveBlending,
          uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() }, uPale: { value: th.tintPale } },
        });
        const pulses = new THREE.Points(pGeo, pMat);
        pulses.frustumCulled = false;
        scene.add(pulses);

        camera.position.set(0, 2, 22);
        camera.lookAt(0, 0, 0);
        return {
          update: (t) => {
            pMat.uniforms.uTime.value = t;
            scene.rotation.y = t * 0.08;
            scene.rotation.x = Math.sin(t * 0.15) * 0.08;
            ring.lookAt(camera.position);
          },
          onTheme: (p) => {
            lineMat.color = p.tint;
            lineMat.opacity = p.light ? 0.3 : 0.25;
            nodeMat.color = p.tintPale;
            ringMat.color = p.tint;
            pMat.uniforms.uPale.value = p.tintPale;
            pMat.blending = p.light ? THREE.NormalBlending : THREE.AdditiveBlending;
            pMat.needsUpdate = true;
          },
          dispose: () => {
            lineGeo.dispose();
            lineMat.dispose();
            nodeGeo.dispose();
            nodeMat.dispose();
            ringGeo.dispose();
            ringMat.dispose();
            pGeo.dispose();
            pMat.dispose();
          },
        };
      },
    });
  }, [tint, tintLight]);
  return <div ref={host} className={className} aria-hidden="true" />;
}
