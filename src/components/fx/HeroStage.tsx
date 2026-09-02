"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import type { NetworkSummary } from "@/lib/api";
import { fmtInt, fmtSignedPct } from "@/lib/format";
import { useLiveSummary } from "@/components/home/useLiveSummary";

/**
 * The hero stage. One cloud of ~24k points cycles through the word
 * VERIFIED (sampled from the page font), a cube lattice, and a sphere. A
 * caption completes the sentence per phase, and each shape carries its own
 * live readouts, positioned from the shape's projected silhouette so the
 * leader lines land on the edge of the form.
 */
type Phase = "text" | "cube" | "sphere";

const PHASES: { phase: Phase; hold: number; caption: string }[] = [
  { phase: "text", hold: 5.4, caption: "before it is displayed." },
  { phase: "cube", hold: 4.2, caption: "Every block, reconciled." },
  { phase: "sphere", hold: 4.2, caption: "Cross-checked against the node." },
];
const TRANSITION = 1.5;
const WORD = "VERIFIED";
const FOV = 38;

const VERT = /* glsl */ `
uniform float uTime;
uniform vec4 uW;
uniform float uBurst;
uniform float uScan;
uniform float uPixelRatio;
uniform float uSize;
uniform float uJitter;
attribute vec3 aCloud;
attribute vec3 aText;
attribute vec3 aSphere;
attribute float aSeed;
varying float vState;
varying float vBand;
varying float vDepth;
varying float vSeed;

void main() {
  vec3 p = aCloud * uW.x + position * uW.y + aText * uW.z + aSphere * uW.w;
  p += normalize(p + 0.001) * uBurst * (0.6 + aSeed * 1.4);
  p += uJitter * vec3(
    sin(uTime * 0.9 + aSeed * 31.0),
    cos(uTime * 0.7 + aSeed * 17.0),
    sin(uTime * 1.1 + aSeed * 23.0)
  );
  float d = uScan - p.y;
  vBand = 1.0 - smoothstep(0.0, 1.0, abs(d));
  vState = smoothstep(0.0, 1.5, d);
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp((-mv.z - 8.0) / 20.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = uSize * (0.85 + vBand * 1.6 + vState * 0.25);
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
  float tw = 0.85 + 0.15 * sin(vSeed * 50.0);
  float a = soft * (0.45 + vState * 0.5 + vBand * 0.9) * tw * (1.0 - vDepth * 0.5) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

function sampleWord(word: string, family: string, worldWidth: number): { pts: Float32Array; ratio: number } {
  const W = 1600;
  const H = 360;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 250px ${family}`;
  g.fillText(word, W / 2, H / 2 + 8);
  const img = g.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  let minY = H;
  let maxY = 0;
  const step = 4;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (img[(y * W + x) * 4 + 3] > 140) {
        pts.push((x / W - 0.5) * worldWidth, ((0.5 - y / H) * (worldWidth * H)) / W);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { pts: new Float32Array(pts), ratio: (maxY - minY) / W };
}

export function HeroStage({ initial }: { initial: NetworkSummary }) {
  const d = useLiveSummary(initial);
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLSpanElement>(null);
  const q = d.quality;
  const ok = q?.state === "validated";

  useEffect(() => {
    const el = host.current;
    const stageEl = stage.current;
    const capEl = cap.current;
    if (!el || !stageEl || !capEl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 760;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 17.5);

    const n = isMobile ? 24 : 29;
    const count = n * n * n;
    const half = isMobile ? 1.9 : 3.0;
    const R = isMobile ? 2.3 : 3.8;
    const cube = new Float32Array(count * 3);
    const sphere = new Float32Array(count * 3);
    const cloud = new Float32Array(count * 3);
    const text = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    let i = 0;
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
          const cr = 6 + Math.random() * 8;
          const ct = Math.random() * Math.PI * 2;
          const cp = Math.acos(2 * Math.random() - 1);
          cloud[i * 3] = cr * Math.sin(cp) * Math.cos(ct);
          cloud[i * 3 + 1] = cr * Math.sin(cp) * Math.sin(ct) * 0.6;
          cloud[i * 3 + 2] = cr * Math.cos(cp) * 0.6;
          seed[i] = Math.random();
          i++;
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(cube, 3));
    geo.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
    geo.setAttribute("aCloud", new THREE.BufferAttribute(cloud, 3));
    geo.setAttribute("aText", new THREE.BufferAttribute(text, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const light = () => document.documentElement.getAttribute("data-theme") === "light";
    const palette = () => ({
      raw: new THREE.Color(light() ? "#9aa3b8" : "#3b4357"),
      verified: new THREE.Color(light() ? "#2563eb" : "#3b82f6"),
      band: new THREE.Color(light() ? "#1d4ed8" : "#dbeafe"),
      opacity: light() ? 0.95 : 1,
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
        uW: { value: new THREE.Vector4(1, 0, 0, 0) },
        uBurst: { value: 0 },
        uScan: { value: -6 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uSize: { value: isMobile ? 3.2 : 2.1 },
        uJitter: { value: 0.035 },
        uRaw: { value: pal.raw },
        uVerified: { value: pal.verified },
        uBand: { value: pal.band },
        uOpacity: { value: pal.opacity },
      },
    });
    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.add(points);
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

    // ---- Geometry in pixels, for the readouts.
    let textHalfW = 7;
    let textHalfH = 1.6;
    const radiusFor = (ph: Phase): [number, number] =>
      ph === "text" ? [textHalfW, textHalfH] : ph === "cube" ? [half * 1.35, half * 1.35] : [R, R];
    const chips = Array.from(stageEl.querySelectorAll<HTMLElement>(".ann"));
    const layout = () => {
      const cw = el.clientWidth || 1;
      const ch = el.clientHeight || 1;
      const f = ch / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const ppu = f / camera.position.z;
      const canvasRect = el.getBoundingClientRect();
      const stageRect = stageEl.getBoundingClientRect();
      const cx = cw / 2 - (stageRect.left - canvasRect.left);
      const cy = ch / 2 - group.position.y * ppu - (stageRect.top - canvasRect.top);
      const gap = isMobile ? 14 : 26;
      chips.forEach((c) => {
        const ph = c.dataset.phase as Phase;
        const side = c.dataset.side;
        const [rxU, ryU] = radiusFor(ph);
        const rx = rxU * ppu;
        const ry = ryU * ppu;
        const w = c.offsetWidth;
        const h = c.offsetHeight;
        c.style.setProperty("--gap", `${gap}px`);
        if (side === "stamp") {
          c.style.left = `${cx - w / 2}px`;
          c.style.top = `${cy + ry + gap}px`;
        } else if (isMobile) {
          c.style.left = `${cx - w / 2}px`;
          c.style.top = side === "l" ? `${cy - ry - gap - h}px` : `${cy + ry + gap}px`;
        } else if (side === "l") {
          c.style.left = `${cx - rx - gap - w}px`;
          c.style.top = `${cy - h * 0.5 - 34}px`;
        } else {
          c.style.left = `${cx + rx + gap}px`;
          c.style.top = `${cy - h * 0.5 + 34}px`;
        }
      });
    };

    const fillText = async () => {
      const family = getComputedStyle(document.body).fontFamily.split(",")[0].replace(/["']/g, "").trim() || "sans-serif";
      try {
        await document.fonts.load(`700 250px "${family}"`);
      } catch {}
      const visW = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * camera.aspect;
      const worldW = Math.min(17, visW * (isMobile ? 0.92 : 0.84));
      const { pts, ratio } = sampleWord(WORD, `"${family}", sans-serif`, worldW);
      textHalfW = worldW * 0.47;
      textHalfH = (worldW * ratio) / 2;
      const m = pts.length / 2;
      const attr = geo.getAttribute("aText") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let k = 0; k < count; k++) {
        const j = (k * 7919) % m;
        arr[k * 3] = pts[j * 2] + (Math.random() - 0.5) * 0.07;
        arr[k * 3 + 1] = pts[j * 2 + 1] + (Math.random() - 0.5) * 0.07;
        arr[k * 3 + 2] = (Math.random() - 0.5) * 0.45;
      }
      attr.needsUpdate = true;
      layout();
    };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const fit = Math.min(1, w / h / 1.55);
      camera.position.z = 17.5 / Math.max(0.78, fit);
      group.position.y = w < 760 ? 0.9 : 0.5;
      layout();
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

    // ---- Caption
    const setCaption = (txt: string, immediate = false) => {
      const chars = Array.from(capEl.querySelectorAll<HTMLElement>(".cap__c"));
      const build = () => {
        capEl.style.opacity = "1";
        capEl.innerHTML = "";
        txt.split(" ").forEach((word, wi, words) => {
          const w = document.createElement("span");
          w.className = "cap__w";
          for (const ch of word) {
            const s = document.createElement("span");
            s.className = "cap__c";
            s.textContent = ch;
            w.appendChild(s);
          }
          capEl.appendChild(w);
          if (wi < words.length - 1) capEl.appendChild(document.createTextNode(" "));
        });
        return Array.from(capEl.querySelectorAll<HTMLElement>(".cap__c"));
      };
      if (immediate || reduce || chars.length === 0) {
        gsap.fromTo(build(), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.018 });
        return;
      }
      gsap.to(chars, {
        yPercent: -110,
        opacity: 0,
        duration: 0.4,
        ease: "power3.in",
        stagger: 0.012,
        onComplete: () => {
          gsap.fromTo(build(), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power4.out", stagger: 0.016 });
        },
      });
    };

    // ---- Readouts per phase
    const showChips = (ph: Phase) => {
      layout();
      const mine = chips.filter((c) => c.dataset.phase === ph);
      const others = chips.filter((c) => c.dataset.phase !== ph);
      gsap.to(others, { autoAlpha: 0, duration: 0.3, overwrite: true });
      mine.forEach((c, k) => {
        const dir = c.dataset.side === "l" ? 18 : c.dataset.side === "r" ? -18 : 0;
        const dy = c.dataset.side === "stamp" ? -10 : 0;
        gsap.fromTo(c, { autoAlpha: 0, x: dir, y: dy }, { autoAlpha: 1, x: 0, y: 0, duration: 0.7, ease: "power3.out", delay: 0.55 + k * 0.12, overwrite: true });
      });
    };
    const hideChips = () => gsap.to(chips, { autoAlpha: 0, duration: 0.35, overwrite: true });

    // ---- Phase machine
    const ease = (t: number) => t * t * (3 - 2 * t);
    const weights = (ph: Phase | "cloud") => {
      const v = new THREE.Vector4(0, 0, 0, 0);
      if (ph === "cloud") v.x = 1;
      if (ph === "cube") v.y = 1;
      if (ph === "text") v.z = 1;
      if (ph === "sphere") v.w = 1;
      return v;
    };
    let from = weights("cloud");
    let to = weights("cloud");
    let idx = -1;
    let phaseStart = 0;
    let transitioning = false;
    let started = false;
    let elapsedAtStart = 0;
    const cur = new THREE.Vector4();
    const rot = { y: 0, x: 0, ty: 0, tx: 0 };
    const sizeFor = (ph: Phase) => (ph === "text" ? (isMobile ? 3.4 : 1.85) : isMobile ? 3.2 : 2.4);
    let sizeTarget = mat.uniforms.uSize.value as number;
    let jitterTarget = 0.035;
    let chipTimer: gsap.core.Tween | null = null;

    const advance = (t: number) => {
      idx = (idx + 1) % PHASES.length;
      const next = PHASES[idx];
      from = cur.clone();
      to = weights(next.phase);
      phaseStart = t;
      transitioning = true;
      sizeTarget = sizeFor(next.phase);
      jitterTarget = next.phase === "text" ? 0.02 : 0.05;
      rot.ty = next.phase === "text" ? 0 : 0.55;
      rot.tx = next.phase === "text" ? 0 : 0.45;
      setCaption(next.caption, idx === 0 && !started);
      hideChips();
      chipTimer?.kill();
      chipTimer = gsap.delayedCall(TRANSITION * 0.55, () => showChips(next.phase));
      started = true;
    };

    const begin = () => {
      elapsedAtStart = clock.getElapsedTime();
      advance(elapsedAtStart);
    };
    fillText().then(() => {
      if (document.documentElement.hasAttribute("data-loaded") || window.__fxLoaded) begin();
      else window.addEventListener("fx:loaded", begin, { once: true });
    });

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;

      if (started) {
        const k = t - phaseStart;
        if (transitioning) {
          const p = Math.min(1, k / TRANSITION);
          const e = ease(p);
          cur.copy(from).lerp(to, e);
          mat.uniforms.uBurst.value = reduce ? 0 : 4 * p * (1 - p) * 1.1;
          if (p >= 1) transitioning = false;
        } else {
          cur.copy(to);
          mat.uniforms.uBurst.value = 0;
          if (!reduce && k > PHASES[idx].hold + TRANSITION) advance(t);
        }
        mat.uniforms.uW.value.copy(cur);
      } else {
        mat.uniforms.uW.value.copy(weights("cloud"));
      }
      mat.uniforms.uSize.value += (sizeTarget - (mat.uniforms.uSize.value as number)) * 0.05;
      mat.uniforms.uJitter.value += (jitterTarget - (mat.uniforms.uJitter.value as number)) * 0.05;

      const sp = (t % 4.6) / 4.6;
      mat.uniforms.uScan.value = reduce ? 6 : -6 + sp * 12;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      rot.y += (rot.ty - rot.y) * 0.03;
      rot.x += (rot.tx - rot.x) * 0.03;
      const spin = PHASES[idx]?.phase === "text" || !started ? 0 : (t - elapsedAtStart) * 0.1;
      group.rotation.y = rot.y * Math.sin(spin) + mouse.x * (0.1 + rot.y * 0.3);
      group.rotation.x = rot.x * 0.6 + mouse.y * (0.06 + rot.x * 0.25);
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("fx:loaded", begin);
      chipTimer?.kill();
      gsap.killTweensOf(chips);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tone = (v: number | null) => (v == null ? "" : v >= 0 ? "tone-good" : "tone-bad");

  return (
    <>
      <div ref={host} className="hero3__gl" aria-hidden="true" />
      <div ref={stage} className="hero3__stage">
        <Link href="/xplorer/litecoin" className="ann ann--stamp" data-phase="text" data-side="stamp">
          <span className={ok ? "pulse" : "chip__dot"} />
          <span className="ann__line">
            {ok ? "Validated at tip" : "Validation pending"} · block <b>{fmtInt(d.asOf.height)}</b>
          </span>
        </Link>

        <Link href="/xplorer/litecoin" className="ann" data-phase="cube" data-side="l">
          <span className="ann__label">Transactions, 24h</span>
          <span className="ann__value">{fmtInt(d.tx.count)}</span>
          <span className={`ann__meta ${tone(d.tx.changePct)}`}>{fmtSignedPct(d.tx.changePct)} vs prior</span>
          <i className="ann__lead" />
        </Link>
        <Link href="/xplorer/litecoin" className="ann" data-phase="cube" data-side="r">
          <span className="ann__label">Active addresses, 24h</span>
          <span className="ann__value">{fmtInt(d.addresses.active)}</span>
          <span className={`ann__meta ${tone(d.addresses.changePct)}`}>{fmtSignedPct(d.addresses.changePct)} vs prior</span>
          <i className="ann__lead" />
        </Link>

        <Link href="/data-quality" className="ann" data-phase="sphere" data-side="l">
          <span className="ann__label">Live controls</span>
          <span className="ann__value">{q ? `${q.controls.passing} / ${q.controls.total}` : "—"}</span>
          <span className="ann__meta">{ok ? "all passing" : (q?.state ?? "pending")}</span>
          <i className="ann__lead" />
        </Link>
        <Link href="/data-quality#reporting" className="ann" data-phase="sphere" data-side="r">
          <span className="ann__label">Node cross-check</span>
          <span className="ann__value" style={{ textTransform: "capitalize" }}>
            {q ? q.node_cross_check.status : "—"}
          </span>
          <span className="ann__meta">{q ? `at block ${fmtInt(q.node_cross_check.last_confirmed_block)}` : ""}</span>
          <i className="ann__lead" />
        </Link>
      </div>

      <h1 className="display hero3__cap">
        <span className="sr-only">{WORD.toLowerCase()} </span>
        <span ref={cap} className="cap" aria-hidden="true">
          {PHASES[0].caption}
        </span>
      </h1>
    </>
  );
}
