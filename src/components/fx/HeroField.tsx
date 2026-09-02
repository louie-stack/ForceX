"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A field of points rendered as a data terrain. A verification scan travels
 * across it: points ahead of the scan are raw (grey), the band is bright, and
 * everything behind it is verified (accent). Mouse adds gentle parallax.
 */
const VERT = /* glsl */ `
uniform float uTime;
uniform float uScan;
uniform float uPixelRatio;
uniform float uSize;
attribute float aSeed;
varying float vState;
varying float vFade;
varying float vSeed;

// Simplex-style value noise, cheap enough for 30k verts.
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

void main(){
  vec3 p = position;
  float n = snoise(p.xz * 0.11 + vec2(uTime * 0.05, uTime * 0.03));
  float n2 = snoise(p.xz * 0.35 - vec2(uTime * 0.08, 0.0));
  p.y += n * 2.2 + n2 * 0.55;

  // Scan travels along x (-halfW..halfW); distance behind scan => verified.
  float d = uScan - p.x;
  float band = 1.0 - smoothstep(0.0, 1.6, abs(d));
  float verified = smoothstep(0.0, 2.5, d);
  vState = verified;
  vFade = band;
  vSeed = aSeed;

  // Verified points lift slightly and settle into a calmer surface.
  p.y += band * 0.9;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = uSize * (1.0 + band * 1.6 + verified * 0.25);
  gl_PointSize = sz * uPixelRatio * (18.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRaw;
uniform vec3 uVerified;
uniform vec3 uBand;
uniform float uOpacity;
varying float vState;
varying float vFade;
varying float vSeed;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float soft = smoothstep(0.5, 0.12, r);
  vec3 col = mix(uRaw, uVerified, vState);
  col = mix(col, uBand, vFade);
  float twinkle = 0.75 + 0.25 * sin(vSeed * 40.0 + vState * 6.0);
  float a = soft * (0.35 + vState * 0.45 + vFade * 0.9) * twinkle * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

export function HeroField({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 720;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 9.5, 22);
    camera.lookAt(0, -1.5, 0);

    const cols = isMobile ? 110 : 220;
    const rows = isMobile ? 70 : 120;
    const W = 60;
    const D = 32;
    const count = cols * rows;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pos[i * 3] = (c / (cols - 1) - 0.5) * W;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = (r / (rows - 1) - 0.5) * D;
        seed[i] = Math.random();
        i++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const readTheme = () => document.documentElement.getAttribute("data-theme") === "light";
    const palette = (light: boolean) => ({
      raw: new THREE.Color(light ? "#9aa3b8" : "#3a4256"),
      verified: new THREE.Color(light ? "#2563eb" : "#3b82f6"),
      band: new THREE.Color(light ? "#1d4ed8" : "#dbeafe"),
      opacity: light ? 0.85 : 1,
    });
    const pal = palette(readTheme());

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: readTheme() ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScan: { value: -W / 2 - 4 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: isMobile ? 2.6 : 2.2 },
        uRaw: { value: pal.raw },
        uVerified: { value: pal.verified },
        uBand: { value: pal.band },
        uOpacity: { value: pal.opacity },
      },
    });
    const points = new THREE.Points(geo, mat);
    points.rotation.y = -0.12;
    scene.add(points);

    const mo = new MutationObserver(() => {
      const p = palette(readTheme());
      mat.uniforms.uRaw.value = p.raw;
      mat.uniforms.uVerified.value = p.verified;
      mat.uniforms.uBand.value = p.band;
      mat.uniforms.uOpacity.value = p.opacity;
      mat.blending = readTheme() ? THREE.NormalBlending : THREE.AdditiveBlending;
      mat.needsUpdate = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
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

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    const clock = new THREE.Clock();
    const period = 11; // seconds per full scan
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = reduce ? 0 : t;
      const phase = (t % period) / period;
      mat.uniforms.uScan.value = reduce ? W / 2 + 6 : -W / 2 - 6 + phase * (W + 12);
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      camera.position.x = mouse.x * 1.6;
      camera.position.y = 9.5 - mouse.y * 0.8;
      camera.lookAt(0, -1.5, 0);
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
