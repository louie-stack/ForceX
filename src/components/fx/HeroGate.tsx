"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ScrollTrigger, reduceMotion } from "@/lib/gsap";

/**
 * The verification gate. A lattice of blocks flows out of the depth toward
 * the viewer. Before the gate a block is hollow and sits slightly off the
 * lattice; as it crosses the luminous plane it snaps into place and turns
 * solid. Every position is computed on the GPU from time, so the CPU only
 * updates a handful of uniforms and pins three live readouts to the scene.
 */
const LANE = 1.5;
const GATE_Z = -7;
const LAYERS = 2;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uLen;
uniform float uZFar;
uniform float uGate;
uniform float uBuild;
uniform vec3 uCursor;
uniform float uCursorOn;
attribute vec3 aCell;
attribute float aSeed;
varying vec3 vN;
varying vec2 vUv;
varying float vVer;
varying float vFlash;
varying float vDepth;
varying float vGlow;
varying float vRaw;
varying vec3 vNv;
varying vec3 vV;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  float z = uZFar + mod(aCell.z + uTime * uSpeed, uLen);
  float ver = smoothstep(uGate - 0.3, uGate + 0.3, z);
  // Unverified blocks only materialise on the last stretch before the gate.
  vRaw = smoothstep(uGate - 14.0, uGate - 4.0, z);
  vec3 jit = vec3(hash(aSeed * 3.1) - 0.5, hash(aSeed * 7.7) - 0.5, 0.0) * 0.62;
  vec3 c = vec3(aCell.x, aCell.y, z) + jit * (1.0 - ver);
  c.y += sin(z * 0.22 + aCell.x * 0.4 + uTime * 0.5) * 0.12 * (1.0 - ver);
  float dc = distance(c.xz, uCursor.xz);
  float lift = exp(-dc * dc * 0.3) * uCursorOn;
  c.y += lift * 0.55;
  float build = smoothstep(0.0, 1.0, uBuild * 1.7 - aSeed * 0.7);
  float flash = ver * exp(-max(z - uGate, 0.0) * 0.75);
  float s = build * mix(0.7, 0.8, ver);
  vec3 p = c + position * s;
  vN = normal;
  vUv = uv;
  vVer = ver;
  vFlash = flash;
  vGlow = lift;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNv = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  vDepth = clamp((-mv.z - 14.0) / 46.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uBg;
uniform vec3 uRaw;
uniform vec3 uVerified;
uniform vec3 uVerified2;
uniform vec3 uFlash;
uniform vec3 uLight;
uniform vec3 uRawFill;
uniform vec3 uRawFill2;
varying vec3 vN;
varying vec2 vUv;
varying float vVer;
varying float vFlash;
varying float vDepth;
varying float vGlow;
varying float vRaw;
varying vec3 vNv;
varying vec3 vV;

void main() {
  vec2 fw = fwidth(vUv);
  vec2 d = min(vUv, 1.0 - vUv);
  float e = min(d.x, d.y);
  float w = max(fw.x, fw.y) * 1.3;
  float edge = 1.0 - smoothstep(w, w * 2.4, e);
  float solid = step(0.5, vVer);
  if (solid < 0.5 && vRaw < 0.03) discard;
  vec3 n = normalize(vN);
  float ndl = clamp(dot(n, normalize(uLight)), 0.0, 1.0);
  float rim = pow(1.0 - clamp(dot(normalize(vNv), normalize(vV)), 0.0, 1.0), 3.0);
  // Verified: lit accent cube with light edges.
  vec3 fill = mix(uVerified2, uVerified, 0.25 + 0.75 * ndl);
  fill *= 0.88 + 0.12 * vUv.y;
  fill = mix(fill, uFlash, rim * 0.28);
  vec3 solidCol = mix(fill, mix(fill, uFlash, 0.3), edge);
  // Unverified: the same cube, unlit. Shaded grey glass with a pale edge, materialising toward the gate.
  vec3 rawFill = mix(uRawFill2, uRawFill, 0.3 + 0.7 * ndl);
  rawFill *= 0.9 + 0.1 * vUv.y;
  rawFill = mix(rawFill, uRaw, rim * 0.35);
  vec3 rawCol = mix(rawFill, uRaw, edge * 0.85);
  // Unverified cubes stay fully formed but sit low against the background.
  vec3 col = solid > 0.5 ? solidCol : mix(uBg, rawCol, vRaw * 0.5);
  col = mix(col, uFlash, vFlash * 0.9);
  col = mix(col, uFlash, vGlow * 0.55);
  col = mix(col, uBg, vDepth * solid);
  gl_FragColor = vec4(col, 1.0);
}
`;

const GATE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GATE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uTime;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  vec2 d = min(vUv, 1.0 - vUv);
  float e = min(d.x, d.y);
  float frame = 1.0 - smoothstep(0.0, 0.006, e);
  float glow = exp(-e * 12.0) * 0.22;
  float scanPos = fract(uTime * 0.16);
  float scan = exp(-abs(vUv.y - scanPos) * 36.0) * 0.5;
  float a = (frame * 0.95 + glow + scan * 0.8 + 0.02) * uAlpha;
  gl_FragColor = vec4(uColor, a);
}
`;

const FLOOR_VERT = /* glsl */ `
varying vec3 vP;
varying float vDist;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FLOOR_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uRaw;
uniform vec3 uVerified;
uniform float uLane;
uniform float uGate;
uniform float uAlpha;
uniform vec2 uRes;
varying vec3 vP;
varying float vDist;
void main() {
  vec2 g = vec2(vP.x / uLane + 0.5, vP.z / uLane);
  vec2 f = abs(fract(g) - 0.5);
  vec2 fw = fwidth(g) * 1.2;
  float line = max(smoothstep(0.5 - fw.x, 0.5, f.x), smoothstep(0.5 - fw.y, 0.5, f.y));
  float ver = smoothstep(uGate - 0.3, uGate + 0.3, vP.z);
  vec3 col = mix(uRaw, uVerified, ver);
  float fade = smoothstep(4.0, 12.0, vDist) * (1.0 - smoothstep(24.0, 40.0, vDist));
  // The grid runs to the edges of the viewport and dissolves in the last stretch on each side.
  float sx = gl_FragCoord.x / uRes.x;
  fade *= smoothstep(0.0, 0.22, min(sx, 1.0 - sx));
  float a = (line * mix(0.3, 0.7, ver) + ver * 0.07) * fade * uAlpha;
  gl_FragColor = vec4(col, a);
}
`;

export interface HeroGateProps {
  className?: string;
  /** `home`: centred scene with the HUD bar vars. `page`: scene weighted to the right behind left-aligned copy. */
  variant?: "home" | "page";
  /** Accent for verified blocks and the gate (dark theme) and its light-theme counterpart. */
  tint?: string;
  tintLight?: string;
}

export function HeroGate({ className = "vg__gl", variant = "home", tint = "#3b82f6", tintLight = "#2563eb" }: HeroGateProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const section = el.closest<HTMLElement>("[data-gate]");
    if (!section) return;
    const reduce = reduceMotion();
    const isMobile = window.innerWidth < 760;
    const isPage = variant === "page";

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isMobile ? 36 : 30, 1, 0.1, 140);
    const camHome = { y: 6.5, z: 17 };
    let zExtra = 0;
    const look = new THREE.Vector3(0, isMobile ? 6.0 : 3.6, -12);

    // ---- Lattice
    const lanesX = isMobile ? 6 : 8;
    const rows = 40;
    const len = rows * LANE;
    const zFar = GATE_Z - len * 0.7;
    const cells: number[] = [];
    const seeds: number[] = [];
    for (let ix = 0; ix < lanesX; ix++) {
      for (let iy = 0; iy < LAYERS; iy++) {
        for (let iz = 0; iz < rows; iz++) {
          if (Math.random() < 0.28) continue;
          cells.push((ix - (lanesX - 1) / 2) * LANE, iy * LANE, iz * LANE);
          seeds.push(Math.random());
        }
      }
    }
    const count = seeds.length;
    const box = new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = box.index;
    geo.setAttribute("position", box.getAttribute("position"));
    geo.setAttribute("normal", box.getAttribute("normal"));
    geo.setAttribute("uv", box.getAttribute("uv"));
    geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(new Float32Array(cells), 3));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
    geo.instanceCount = count;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -20), 80);

    const light = () => document.documentElement.getAttribute("data-theme") === "light";
    const WHITE = new THREE.Color("#ffffff");
    const BLACK = new THREE.Color("#000000");
    const palette = () => {
      const base = new THREE.Color(light() ? tintLight : tint);
      return light()
        ? {
            bg: new THREE.Color("#f5f6f9"),
            raw: new THREE.Color("#8e9ab4"),
            rawFill: new THREE.Color("#e2e6ef"),
            rawFill2: new THREE.Color("#b7c0d3"),
            verified: base.clone().lerp(WHITE, 0.12),
            verified2: base.clone().lerp(BLACK, 0.25),
            flash: base.clone().lerp(WHITE, 0.82),
            gate: base.clone(),
            gateAlpha: 0.5,
          }
        : {
            bg: new THREE.Color("#04060b"),
            raw: new THREE.Color("#7383a8"),
            rawFill: new THREE.Color("#2a3450"),
            rawFill2: new THREE.Color("#121a2b"),
            verified: base.clone(),
            verified2: base.clone().lerp(BLACK, 0.55),
            flash: base.clone().lerp(WHITE, 0.8),
            gate: base.clone().lerp(WHITE, 0.25),
            gateAlpha: 1,
          };
    };
    const pal = palette();
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: reduce ? 0.25 : 1.1 },
        uLen: { value: len },
        uZFar: { value: zFar },
        uGate: { value: GATE_Z },
        uBuild: { value: reduce ? 1 : 0 },
        uCursor: { value: new THREE.Vector3(0, 0, 999) },
        uCursorOn: { value: 0 },
        uBg: { value: pal.bg },
        uRaw: { value: pal.raw },
        uVerified: { value: pal.verified },
        uVerified2: { value: pal.verified2 },
        uFlash: { value: pal.flash },
        uLight: { value: new THREE.Vector3(-0.4, 1, 0.7) },
        uRawFill: { value: pal.rawFill },
        uRawFill2: { value: pal.rawFill2 },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    // ---- The gate plane
    // The panel stands on the floor and rises well above the top layer, leaving headroom for the HUD bar.
    const gateW = lanesX * LANE + 2.2;
    const gateBottom = -LANE / 2 - 0.3;
    const gateTopY = (LAYERS - 0.5) * LANE + 2.0;
    const gateH = gateTopY - gateBottom;
    const gateY = (gateTopY + gateBottom) / 2;
    const gateMat = new THREE.ShaderMaterial({
      vertexShader: GATE_VERT,
      fragmentShader: GATE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: light() ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: { uColor: { value: pal.gate }, uTime: { value: 0 }, uAlpha: { value: 0 } },
    });
    const gate = new THREE.Mesh(new THREE.PlaneGeometry(gateW, gateH), gateMat);
    gate.position.set(0, gateY, GATE_Z);
    scene.add(gate);

    // ---- Floor lattice
    const floorMat = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERT,
      fragmentShader: FLOOR_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uRaw: { value: pal.raw },
        uVerified: { value: pal.verified },
        uLane: { value: LANE },
        uGate: { value: GATE_Z },
        uAlpha: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, len + 20), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -LANE / 2 - 0.3, zFar + len / 2);
    scene.add(floor);
    // Page heroes carry copy on the left, so the whole scene sits to the right.
    // Narrow hosts (the auth side panel) keep it centred.
    if (isPage && !isMobile && el.clientWidth > 900) {
      mesh.position.x = 5.5;
      gate.position.x = 5.5;
      floor.position.x = 5.5;
      zExtra = 3;
    }

    let gateAlphaTarget = pal.gateAlpha;
    const mo = new MutationObserver(() => {
      const p = palette();
      mat.uniforms.uBg.value = p.bg;
      mat.uniforms.uRaw.value = p.raw;
      mat.uniforms.uRawFill.value = p.rawFill;
      mat.uniforms.uRawFill2.value = p.rawFill2;
      mat.uniforms.uVerified.value = p.verified;
      mat.uniforms.uVerified2.value = p.verified2;
      mat.uniforms.uFlash.value = p.flash;
      gateMat.uniforms.uColor.value = p.gate;
      floorMat.uniforms.uRaw.value = p.raw;
      floorMat.uniforms.uVerified.value = p.verified;
      gateMat.blending = light() ? THREE.NormalBlending : THREE.AdditiveBlending;
      gateMat.needsUpdate = true;
      gateAlphaTarget = p.gateAlpha;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // ---- The HUD bar is mounted on the glass: project the panel's top corners for CSS.
    const gateTop = gateY + gateH / 2;
    const v = new THREE.Vector3();
    const inner = section.querySelector<HTMLElement>(".vg__inner");
    const bounds = { innerLeft: 0, innerTop: 0 };
    const measureBounds = () => {
      if (!inner) return;
      const r = inner.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      bounds.innerLeft = r.left - er.left;
      bounds.innerTop = r.top - er.top;
    };
    const gateTL = new THREE.Vector3(-gateW / 2, gateTop, GATE_Z);
    const gateTR = new THREE.Vector3(gateW / 2, gateTop, GATE_Z);
    const placeHud = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!isMobile && !isPage) {
        // The HUD bar is mounted on the glass: expose the panel's projected top corners to CSS,
        // in the coordinate space of the copy container.
        v.copy(gateTL).project(camera);
        const lx = (v.x * 0.5 + 0.5) * w - bounds.innerLeft;
        const ty = (0.5 - v.y * 0.5) * h - bounds.innerTop;
        v.copy(gateTR).project(camera);
        const rx = (v.x * 0.5 + 0.5) * w - bounds.innerLeft;
        section.style.setProperty("--gate-top", `${ty.toFixed(1)}px`);
        section.style.setProperty("--gate-left", `${lx.toFixed(1)}px`);
        section.style.setProperty("--gate-right", `${rx.toFixed(1)}px`);
      }
    };

    // ---- Resize
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      floorMat.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      camHome.z = 17 * THREE.MathUtils.clamp(1.6 / camera.aspect, 1, 2.2) + zExtra;
      measureBounds();
      placeHud();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ---- Pointer
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -LANE);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const cur = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) mat.uniforms.uCursor.value.copy(hit);
      cur.tx = ndc.x;
      cur.ty = ndc.y;
      cur.ton = 1;
    };
    const onLeave = () => {
      cur.ton = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    // ---- No entrance choreography: the scene is fully composed on first paint.
    const state = { build: 1, speed: reduce ? 0.25 : 1.1, scroll: 0 };
    gateMat.uniforms.uAlpha.value = gateAlphaTarget;
    floorMat.uniforms.uAlpha.value = 1;

    let st: ScrollTrigger | null = null;
    if (!reduce) {
      st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          state.scroll = self.progress;
        },
      });
    }

    // ---- Render loop
    const t0 = performance.now();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = (performance.now() - t0) / 1000;
      const p = state.scroll;
      const pe = p * p;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uSpeed.value = state.speed + p * 1.6;
      mat.uniforms.uBuild.value = state.build;
      gateMat.uniforms.uTime.value = t;
      gateMat.uniforms.uAlpha.value = gateAlphaTarget * (1 - p * 0.6);

      cur.x += (cur.tx - cur.x) * 0.05;
      cur.y += (cur.ty - cur.y) * 0.05;
      cur.on += (cur.ton - cur.on) * 0.08;
      mat.uniforms.uCursorOn.value = reduce ? 0 : cur.on;

      // The camera stays locked on centre; the cursor only lifts nearby blocks.
      camera.position.x = 0;
      camera.position.y = camHome.y - pe * 4.2;
      camera.position.z = camHome.z - pe * (camHome.z - GATE_Z + 4);
      camera.lookAt(look.x, look.y - pe * 2.2, look.z - pe * 18);

      placeHud();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      st?.kill();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      geo.dispose();
      box.dispose();
      mat.dispose();
      gate.geometry.dispose();
      gateMat.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [variant, tint, tintLight]);

  return <div ref={host} className={className} aria-hidden="true" />;
}
