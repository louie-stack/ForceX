"use client";

import * as THREE from "three";

/**
 * Shared scaffolding for the page-hero scenes: renderer, resize, theme
 * palette, visibility gating and teardown. Each scene supplies its own
 * build and per-frame update.
 */
export interface StageTheme {
  light: boolean;
  bg: THREE.Color;
  tint: THREE.Color;
  tintDeep: THREE.Color;
  tintPale: THREE.Color;
  raw: THREE.Color;
}

export interface StageOptions {
  host: HTMLElement;
  tint: string;
  tintLight: string;
  fov?: number;
  /** Shift the scene right on wide hosts so it sits behind left-aligned copy. */
  shiftRight?: number;
  build: (ctx: { scene: THREE.Scene; camera: THREE.PerspectiveCamera; theme: () => StageTheme; renderer: THREE.WebGLRenderer }) => {
    update: (t: number, dt: number) => void;
    onTheme?: (theme: StageTheme) => void;
    onResize?: (w: number, h: number) => void;
    dispose: () => void;
  };
}

const WHITE = new THREE.Color("#ffffff");
const BLACK = new THREE.Color("#000000");

export function mountStage(o: StageOptions): () => void {
  const { host } = o;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 32, 1, 0.1, 200);
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  const theme = (): StageTheme => {
    const light = isLight();
    const tint = new THREE.Color(light ? o.tintLight : o.tint);
    return {
      light,
      bg: new THREE.Color(light ? "#f5f6f9" : "#04060b"),
      tint,
      tintDeep: tint.clone().lerp(BLACK, light ? 0.25 : 0.55),
      tintPale: tint.clone().lerp(WHITE, light ? 0.55 : 0.8),
      raw: new THREE.Color(light ? "#aeb8cc" : "#3a4762"),
    };
  };

  const shift = o.shiftRight ?? 0;
  const group = new THREE.Group();
  scene.add(group);
  const part = o.build({ scene: group as unknown as THREE.Scene, camera, theme, renderer });

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.x = w > 900 ? shift : 0;
    part.onResize?.(w, h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const mo = new MutationObserver(() => part.onTheme?.(theme()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(host);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let last = t0;
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    const now = performance.now();
    const t = reduce ? 0 : (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    part.update(t, dt);
    renderer.render(scene, camera);
  };
  loop();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    mo.disconnect();
    io.disconnect();
    part.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
  };
}
