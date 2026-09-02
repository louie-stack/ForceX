"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The block. Thirteen thousand points that morph between a cube lattice and
 * a sphere while a verification scan sweeps through them: raw grey above the
 * scan, a bright band at it, verified blue below. Slow rotation, mouse tilt,
 * additive glow.
 */
const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uScan;
uniform float uPixelRatio;
uniform float uSize;
attribute vec3 aSphere;
attribute float aSeed;
varying float vState;
varying float vBand;
varying float vDepth;
varying float vSeed;

void main() {
  vec3 p = mix(position, aSphere, uMorph);
  // Breathing jitter so the lattice never looks frozen.
  p += 0.06 * vec3(
    sin(uTime * 0.9 + aSeed * 31.0),
    cos(uTime * 0.7 + aSeed * 17.0),
    sin(uTime * 1.1 + aSeed * 23.0)
  );
  float d = uScan - p.y;
  vBand = 1.0 - smoothstep(0.0, 1.1, abs(d));
  vState = smoothstep(0.0, 1.6, d);
  vSeed = aSeed;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp((-mv.z - 8.0) / 20.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = uSize * (0.8 + vBand * 1.8 + vState * 0.3);
  gl_PointSize = sz * uPixelRatio * (16.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRaw;
uniform vec3 uVerified;
uniform vec3 uBand;
uniform float uOpacity;
varying float vState;
varying float vBand;
varying float vDepth;
varying float vSeed;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, r);
  vec3 col = mix(uRaw, uVerified, vState);
  col = mix(col, uBand, vBand);
  float tw = 0.8 + 0.2 * sin(vSeed * 50.0);
  float a = soft * (0.42 + vState * 0.55 + vBand * 0.9) * tw * (1.0 - vDepth * 0.5) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

export function HeroBlock({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 760;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.2, 17.5);

    const n = isMobile ? 20 : 28;
    const count = n * n * n;
    const half = 4.1;
    const cube = new Float32Array(count * 3);
    const sphere = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const R = 5.3;
    let i = 0;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        for (let z = 0; z < n; z++) {
          cube[i * 3] = (x / (n - 1) - 0.5) * 2 * half;
          cube[i * 3 + 1] = (y / (n - 1) - 0.5) * 2 * half;
          cube[i * 3 + 2] = (z / (n - 1) - 0.5) * 2 * half;
          // Fibonacci sphere with a little radial depth so it reads as a volume.
          const t = i / count;
          const yy = 1 - t * 2;
          const rr = Math.sqrt(1 - yy * yy);
          const th = golden * i;
          const rad = R * (0.86 + 0.14 * ((i * 7919) % 97) / 97);
          sphere[i * 3] = Math.cos(th) * rr * rad;
          sphere[i * 3 + 1] = yy * rad;
          sphere[i * 3 + 2] = Math.sin(th) * rr * rad;
          seed[i] = Math.random();
          i++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(cube, 3));
    geo.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const light = () => document.documentElement.getAttribute("data-theme") === "light";
    const palette = () => ({
      raw: new THREE.Color(light() ? "#a3abbf" : "#3b4357"),
      verified: new THREE.Color(light() ? "#2563eb" : "#3b82f6"),
      band: new THREE.Color(light() ? "#1d4ed8" : "#e0ecff"),
      opacity: light() ? 0.9 : 1,
    });
    const pal = palette();
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: light() ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uScan: { value: -6 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: isMobile ? 2.8 : 2.6 },
        uRaw: { value: pal.raw },
        uVerified: { value: pal.verified },
        uBand: { value: pal.band },
        uOpacity: { value: pal.opacity },
      },
    });
    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.add(points);
    group.position.x = isMobile ? 0 : 4.4;
    group.position.y = isMobile ? 2.6 : 1.1;
    group.rotation.set(0.5, 0.6, 0);
    scene.add(group);

    const mo = new MutationObserver(() => {
      const p = palette();
      mat.uniforms.uRaw.value = p.raw;
      mat.uniforms.uVerified.value = p.verified;
      mat.uniforms.uBand.value = p.band;
      mat.uniforms.uOpacity.value = p.opacity;
      mat.blending = light() ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.needsUpdate = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      group.position.x = w < 760 ? 0 : Math.min(4.4, (w / h) * 2.5);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    const ease = (t: number) => t * t * (3 - 2 * t);
    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = reduce ? 0 : clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      // Morph cycle: cube 3.5s, morph 1.6s, sphere 3.5s, morph 1.6s.
      const period = 10.2;
      const k = t % period;
      let m = 0;
      if (k < 3.5) m = 0;
      else if (k < 5.1) m = ease((k - 3.5) / 1.6);
      else if (k < 8.6) m = 1;
      else m = 1 - ease((k - 8.6) / 1.6);
      mat.uniforms.uMorph.value = reduce ? 0.5 : m;

      // Scan sweeps bottom to top every 4.4s, then resets.
      const sp = (t % 4.4) / 4.4;
      mat.uniforms.uScan.value = reduce ? 7 : -7.5 + sp * 15;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      group.rotation.y = 0.6 + t * 0.12 + mouse.x * 0.25;
      group.rotation.x = 0.5 + mouse.y * 0.18;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className={className} aria-hidden="true" />;
}
