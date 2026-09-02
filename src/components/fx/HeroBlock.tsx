"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The block: a lattice of points that can hold a cube, a sphere, or morph
 * between them while a verification scan sweeps through, turning raw grey
 * points into tinted verified ones. Reused across the site with a different
 * tint, mode, and placement per page.
 */
export interface HeroBlockProps {
  className?: string;
  /** Accent hex for verified points (dark theme) and its light-theme counterpart. */
  tint?: string;
  tintLight?: string;
  mode?: "morph" | "cube" | "sphere";
  /** Object radius multiplier. */
  scale?: number;
  /** World-space offset; x is ignored on narrow screens (object centers). */
  x?: number;
  y?: number;
  /** Lattice resolution per axis (n^3 points). */
  density?: number;
  opacity?: number;
  /** Rotation speed multiplier. */
  spin?: number;
}

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

export function HeroBlock({
  className,
  tint = "#3b82f6",
  tintLight = "#2563eb",
  mode = "morph",
  scale = 1,
  x = 0,
  y = 0,
  density,
  opacity = 1,
  spin = 1,
}: HeroBlockProps) {
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

    const n = density ?? (isMobile ? 20 : 28);
    const count = n * n * n;
    const half = 4.1 * scale;
    const R = 5.3 * scale;
    const cube = new Float32Array(count * 3);
    const sphere = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    let i = 0;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let ix = 0; ix < n; ix++) {
      for (let iy = 0; iy < n; iy++) {
        for (let iz = 0; iz < n; iz++) {
          cube[i * 3] = (ix / (n - 1) - 0.5) * 2 * half;
          cube[i * 3 + 1] = (iy / (n - 1) - 0.5) * 2 * half;
          cube[i * 3 + 2] = (iz / (n - 1) - 0.5) * 2 * half;
          const t = i / count;
          const yy = 1 - t * 2;
          const rr = Math.sqrt(1 - yy * yy);
          const th = golden * i;
          const rad = R * (0.86 + (0.14 * ((i * 7919) % 97)) / 97);
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
    const palette = () => {
      const v = new THREE.Color(light() ? tintLight : tint);
      const band = light() ? v.clone().multiplyScalar(0.8) : v.clone().lerp(new THREE.Color("#ffffff"), 0.75);
      return {
        raw: new THREE.Color(light() ? "#a3abbf" : "#3b4357"),
        verified: v,
        band,
        opacity: (light() ? 0.9 : 1) * opacity,
      };
    };
    const pal = palette();
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: light() ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: mode === "sphere" ? 1 : 0 },
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
      const narrow = w < 760;
      group.position.x = narrow ? 0 : x;
      group.position.y = narrow ? y + 1.2 : y;
      // Keep the object a similar apparent size on very tall or wide viewports.
      const fit = Math.min(1, (w / h) / 1.2);
      camera.position.z = 17.5 / Math.max(0.72, fit);
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

      if (mode === "morph") {
        const period = 10.2;
        const k = t % period;
        let m = 0;
        if (k < 3.5) m = 0;
        else if (k < 5.1) m = ease((k - 3.5) / 1.6);
        else if (k < 8.6) m = 1;
        else m = 1 - ease((k - 8.6) / 1.6);
        mat.uniforms.uMorph.value = reduce ? 0.5 : m;
      }
      const sp = (t % 4.4) / 4.4;
      mat.uniforms.uScan.value = reduce ? 7 * scale : (-7.5 + sp * 15) * scale;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      group.rotation.y = 0.6 + t * 0.12 * spin + mouse.x * 0.25;
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
  }, [tint, tintLight, mode, scale, x, y, density, opacity, spin]);

  return <div ref={host} className={className} aria-hidden="true" />;
}
