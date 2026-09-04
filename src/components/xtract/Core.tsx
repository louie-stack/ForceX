"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mountStage } from "@/components/fx/stage";

/** The Litecoin mark, lifted from the site's own LtcMark icon. y down, 24 box. */
const GLYPH: [number, number][] = [
  [9.6, 5.5],
  [12.2, 5.5],
  [10.65, 12.55],
  [12.3, 12.0],
  [11.95, 13.45],
  [10.3, 14.0],
  [9.85, 16.0],
  [16.25, 16.0],
  [15.8, 18.2],
  [7.3, 18.2],
  [8.2, 13.9],
  [6.65, 14.45],
  [7.0, 12.95],
  [8.55, 12.45],
];

const CARD_W = 1.42;
const CARD_H = 0.95;
/** Sheets with square-cut edges. A bevel here reads as moulded plastic. */
const CARD_D = 0.02;
const PAD = 0.12;
/** Seconds between one validation sweep and the next. */
const PERIOD = 5.4;

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function glyphShape(): THREE.Shape {
  const s = new THREE.Shape();
  GLYPH.forEach(([px, py], i) => {
    const x = (px - 11.45) * 0.095;
    const y = (11.85 - py) * 0.095;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  });
  s.closePath();
  return s;
}

/** Extruded flat, with the face and the edge on separate materials so the
 *  side of the sheet can carry a hairline border the way the UI does. */
function sheet(shape: THREE.Shape, depth: number) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 14 });
}

/**
 * Three panels of Litecoin data, fanned in depth: the records, the series
 * drawn from them, and the response. Each is a bordered surface with a
 * header, a divider and rows, lit flat so it reads as interface rather than
 * as an object. Every few seconds a validation sweep runs from the back
 * panel to the front and the validated chip lands on the response, where it
 * stays until the next request. Drag to turn the stack.
 */
export function Core({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = { gx: 0, gy: 0, vx: 0, vy: 0, tx: 0, ty: 0, ox: 0, oy: 0, drag: false, lx: 0, ly: 0 };

    const teardown = mountStage({
      host: el,
      tint: "#a78bfa",
      tintLight: "#7c3aed",
      fov: 30,
      build: ({ scene, camera, theme }) => {
        camera.position.set(0, 0, 4.95);
        camera.lookAt(0, 0, 0);

        // Flat, even light. The depth comes from the arrangement, not from
        // a glossy highlight rolling across the surfaces.
        const ambient = new THREE.AmbientLight(0xffffff, 2.35);
        const key = new THREE.DirectionalLight(0xffffff, 0.85);
        key.position.set(1.4, 2.6, 4.0);
        const fill = new THREE.DirectionalLight(0xffffff, 0.45);
        fill.position.set(-2.6, 0.6, 3.0);
        scene.add(ambient, key, fill);

        const geos: THREE.BufferGeometry[] = [];
        const mats: THREE.Material[] = [];
        const track = <T extends THREE.BufferGeometry>(g: T) => {
          geos.push(g);
          return g;
        };
        const keep = <T extends THREE.Material>(m: T) => {
          mats.push(m);
          return m;
        };
        const flat = (extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
          keep(new THREE.MeshStandardMaterial({ metalness: 0, roughness: 1, ...extra }));

        const rig = new THREE.Group();
        scene.add(rig);

        const cardGeo = track(sheet(roundedRect(CARD_W, CARD_H, 0.05), CARD_D));
        const frameGeo = track(sheet(roundedRect(CARD_W + 0.018, CARD_H + 0.018, 0.058), 0.004));
        const inkMat = flat();
        const faintMat = flat();
        const tintMat = flat();
        const edgeMat = flat();
        const chipFace = flat();
        const chipEdge = flat();
        const chipInk = flat();

        const cards: { group: THREE.Group; mat: THREE.MeshStandardMaterial; base: THREE.Vector3; phase: number }[] = [];
        const OFFSETS: [number, number, number][] = [
          [-0.68, 0.54, -0.52],
          [0, 0, 0],
          [0.68, -0.54, 0.52],
        ];
        OFFSETS.forEach((o, i) => {
          const mat = flat({ roughness: 0.95 });
          const g = new THREE.Group();
          g.position.set(o[0], o[1], o[2]);
          // Face and edge are separate groups, so the rim is the border.
          const frame = new THREE.Mesh(frameGeo, edgeMat);
          frame.position.z = -CARD_D / 2 - 0.004;
          g.add(frame);
          const mesh = new THREE.Mesh(cardGeo, [mat, edgeMat]);
          mesh.position.z = -CARD_D / 2;
          g.add(mesh);
          rig.add(g);
          cards.push({ group: g, mat, base: new THREE.Vector3(o[0], o[1], o[2]), phase: i * 1.3 });
        });

        const FACE = CARD_D / 2 + 0.004;
        const L = -CARD_W / 2 + PAD;
        const RGT = CARD_W / 2 - PAD;
        const INNER = CARD_W - PAD * 2;

        /** A flat element printed on a panel, positioned by its left edge. */
        const bar = (card: number, x: number, y: number, w: number, h: number, m: THREE.Material) => {
          const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, 0.004)), m);
          mesh.position.set(x + w / 2, y, FACE);
          cards[card].group.add(mesh);
        };

        // Every panel opens with a small mark, a title and a divider.
        const head = (card: number, mark: THREE.Mesh) => {
          mark.position.set(L + 0.03, 0.345, FACE);
          cards[card].group.add(mark);
          bar(card, L + 0.085, 0.345, 0.26, 0.022, inkMat);
          bar(card, L, 0.275, INNER, 0.003, faintMat);
        };
        const square = () => new THREE.Mesh(track(sheet(roundedRect(0.052, 0.052, 0.014), 0.006)), tintMat);

        // Panel one: the records. Seven fine rows, one of them current.
        head(0, square());
        const VALS = [0.26, 0.17, 0.31, 0.2, 0.26, 0.15, 0.23];
        VALS.forEach((vw, i) => {
          const y = 0.185 - i * 0.073;
          bar(0, L, y, 0.24, 0.015, faintMat);
          bar(0, RGT - vw, y, vw, 0.015, i === 3 ? tintMat : inkMat);
        });

        // Panel two: the series those records produce.
        head(1, square());
        [0.14, 0.05, -0.04, -0.13].forEach((y) => bar(1, L, y, INNER, 0.0025, faintMat));
        const pts = [-0.15, -0.08, -0.11, 0.0, -0.02, 0.07, 0.045, 0.14].map(
          (y, i, a) => new THREE.Vector3(L + (i / (a.length - 1)) * INNER, y, FACE + 0.004),
        );
        cards[1].group.add(new THREE.Mesh(track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 110, 0.0085, 8, false)), tintMat));
        const dot = new THREE.Mesh(track(new THREE.SphereGeometry(0.019, 16, 12)), tintMat);
        dot.position.copy(pts[pts.length - 1]);
        cards[1].group.add(dot);
        bar(1, L, -0.235, INNER, 0.0025, faintMat);
        [0, 1, 2, 3, 4].forEach((i) => bar(1, L + i * (INNER / 5), -0.3, 0.1, 0.013, faintMat));

        // Panel three: the response, headed by the Litecoin mark.
        const glyph = new THREE.Mesh(track(sheet(glyphShape(), 0.008)), tintMat);
        glyph.scale.setScalar(0.09);
        head(2, glyph);
        [0.28, 0.19, 0.24, 0.16].forEach((vw, i) => {
          const y = 0.185 - i * 0.073;
          bar(2, L, y, 0.22, 0.015, faintMat);
          bar(2, RGT - vw, y, vw, 0.015, inkMat);
        });

        // The validated chip: a bordered pill, the way the site draws one.
        const chip = new THREE.Group();
        chip.position.set(RGT - 0.17, -0.27, FACE);
        chip.scale.setScalar(0);
        cards[2].group.add(chip);
        const chipGeo = track(sheet(roundedRect(0.34, 0.105, 0.0525), 0.006));
        chip.add(new THREE.Mesh(chipGeo, [chipFace, chipEdge]));
        const arm = (len: number, angle: number, x: number, y: number) => {
          const m = new THREE.Mesh(track(new THREE.BoxGeometry(len, 0.016, 0.004)), chipInk);
          m.position.set(x, y, 0.009);
          m.rotation.z = angle;
          chip.add(m);
        };
        arm(0.038, -0.64, -0.108, -0.003);
        arm(0.066, 0.72, -0.076, 0.009);
        const label = new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.016, 0.004)), chipInk);
        label.position.set(0.035, 0.001, 0.009);
        chip.add(label);

        let cur = theme();
        // The sweep brightens a panel rather than tinting it, so a lit card
        // still reads as the same surface.
        const cardBase = new THREE.Color();
        const cardHi = new THREE.Color();
        const paint = (t: ReturnType<typeof theme>) => {
          cardBase.set(t.light ? "#ffffff" : "#1e2637");
          cardHi.copy(cardBase).lerp(t.light ? t.tint : new THREE.Color("#ffffff"), t.light ? 0.05 : 0.15);
          // Panels sit above the page, not below it.
          cards.forEach((c) => {
            c.mat.color.copy(cardBase);
            c.mat.emissive.set("#000000");
            c.mat.emissiveIntensity = 0;
          });
          edgeMat.color.set(t.light ? "#e0e5ee" : "#465066");
          inkMat.color.set(t.light ? "#8e98aa" : "#8d97ab");
          faintMat.color.set(t.light ? "#dee3eb" : "#3b4457");
          tintMat.color.copy(t.tint);
          tintMat.emissive.copy(t.tint);
          tintMat.emissiveIntensity = t.light ? 0.04 : 0.16;
          chipFace.color.set(t.light ? "#eaf7ef" : "#1d3529");
          chipEdge.color.set(t.light ? "#8ecfa8" : "#3f9c62");
          chipInk.color.set(t.light ? "#15803d" : "#5fd48b");
          chipInk.emissive.set(t.light ? "#000000" : "#5fd48b");
          chipInk.emissiveIntensity = t.light ? 0 : 0.2;
          ambient.intensity = t.light ? 2.6 : 2.35;
          key.intensity = t.light ? 0.8 : 0.85;
          fill.intensity = t.light ? 0.42 : 0.45;
        };
        paint(cur);

        let clock = PERIOD - 1.8;
        let sweep = 2;

        return {
          update: (t, dt) => {
            if (!reduce) {
              if (!p.drag) {
                p.gy += p.vy * dt;
                p.gx += p.vx * dt;
                const damp = Math.pow(0.94, dt * 60);
                p.vx *= damp;
                p.vy *= damp;
                // Ease back toward the composed view when let go.
                const settle = Math.pow(0.994, dt * 60);
                p.gy *= settle;
                p.gx *= settle;
              }
              p.gx = Math.max(-0.6, Math.min(0.6, p.gx));
              p.ox += (p.tx - p.ox) * Math.min(1, dt * 3);
              p.oy += (p.ty - p.oy) * Math.min(1, dt * 3);
              clock += dt;
              if (clock >= PERIOD) {
                clock = 0;
                sweep = 0;
              }
              if (sweep < 2) sweep += dt * 0.85;
            }

            // The stack sways rather than spinning, so it always reads.
            rig.rotation.y = -0.38 + Math.sin(t * 0.24) * 0.1 + p.gy + p.ox;
            rig.rotation.x = -0.12 + Math.sin(t * 0.19) * 0.045 + p.gx + p.oy;

            cards.forEach((c, i) => {
              const d = Math.abs(sweep - i / 2);
              const lit = d < 0.42 ? Math.pow(1 - d / 0.42, 2) : 0;
              c.group.position.y = c.base.y + Math.sin(t * 0.6 + c.phase) * 0.016;
              c.group.position.z = c.base.z + lit * 0.04;
              c.mat.color.copy(cardBase).lerp(cardHi, lit);
            });

            // Once it lands the chip stays, until the next request resets it.
            const done = Math.min(1, Math.max(0, (sweep - 0.92) / 0.34));
            chip.scale.setScalar(1 - Math.pow(1 - done, 3));
          },
          onTheme: (th) => {
            cur = th;
            paint(th);
          },
          dispose: () => {
            geos.forEach((g) => g.dispose());
            mats.forEach((m) => m.dispose());
          },
        };
      },
    });

    const down = (e: PointerEvent) => {
      p.drag = true;
      p.lx = e.clientX;
      p.ly = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (p.drag) {
        const dx = e.clientX - p.lx;
        const dy = e.clientY - p.ly;
        p.lx = e.clientX;
        p.ly = e.clientY;
        p.gy += dx * 0.006;
        p.gx = Math.max(-0.6, Math.min(0.6, p.gx + dy * 0.004));
        p.vy = dx * 0.12;
        p.vx = dy * 0.08;
        return;
      }
      const r = el.getBoundingClientRect();
      p.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.3;
      p.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.2;
    };
    const up = (e: PointerEvent) => {
      p.drag = false;
      el.style.cursor = "grab";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const leave = () => {
      p.tx = 0;
      p.ty = 0;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);

    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
      teardown();
    };
  }, []);

  return <div className={className} ref={host} aria-hidden="true" />;
}
