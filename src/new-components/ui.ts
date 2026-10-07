import * as THREE from 'three';
import { BOUNDS, STAGES, COMP, QC_NAMES } from './choreography';
import { seg } from './util';
import type { FrameOut } from './types';

const STEP_LISTS: Record<'transport' | 'dealer', Array<[string, number, number]>> = {
  transport: [['TRUCK AT LOADING BAY', 0.56, 0.60], ['MOTORCYCLE LOADED', 0.60, 0.645], ['SECURED', 0.645, 0.658], ['DOORS CLOSED', 0.658, 0.672], ['ON THE ROAD', 0.68, 0.80]],
  dealer: [['ARRIVED', 0.80, 0.82], ['DOORS OPEN', 0.82, 0.835], ['UNLOADED', 0.84, 0.865], ['RECEIVED', 0.865, 0.89]]
};

function makeList(el: HTMLElement, names: string[]) {
  return names.map((n) => {
    const li = document.createElement('div');
    li.className = 'li';
    li.innerHTML = '<span class="bx"></span><span></span>';
    (li.lastChild as HTMLElement).textContent = n;
    el.appendChild(li);
    return li;
  });
}
function setState(li: HTMLElement, state: string) {
  if (li.dataset.s !== state) { li.dataset.s = state; li.className = 'li ' + state; }
}

export function createUI({ onJump }: { onJump: (stage: number) => void }) {
  const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const rail = byId('rail');
  const railBtns = STAGES.map((name, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ri';
    b.setAttribute('aria-label', `Go to stage ${i + 1}: ${name}`);
    b.innerHTML = `<span class="rl"></span><span class="rbar"></span><span class="rn">${String(i + 1).padStart(2, '0')}</span>`;
    (b.querySelector('.rl') as HTMLElement).textContent = name;
    b.addEventListener('click', () => onJump(i));
    rail.appendChild(b);
    return b;
  });

  const asm = makeList(byId('list-asm'), ['01 FRAME POSITIONED', ...COMP.map((c, i) => String(i + 2).padStart(2, '0') + ' ' + c.n)]);
  const qc = makeList(byId('list-qc'), QC_NAMES);
  const tr = makeList(byId('list-tr'), STEP_LISTS.transport.map((s) => s[0]));
  const dl = makeList(byId('list-dl'), STEP_LISTS.dealer.map((s) => s[0]));

  const blocks = [...document.querySelectorAll<HTMLElement>('.hblock')];
  const overlay = byId('overlay');
  const tintCool = byId('tint-cool');
  const tintWarm = byId('tint-warm');
  const hint = byId('hint');

  const pool = (cls: string, html: string) => {
    const items: HTMLDivElement[] = [];
    return (n: number) => {
      while (items.length < n) {
        const d = document.createElement('div');
        d.className = cls;
        d.innerHTML = html;
        overlay.appendChild(d);
        items.push(d);
      }
      items.forEach((d, i) => { d.style.display = i < n ? '' : 'none'; });
      return items;
    };
  };
  const labelPool = pool('lbl', '<span class="dot"></span><span class="ln"></span><span class="tx"></span>');
  const chipPool = pool('chip', '<span class="cdot"></span><span class="ct"></span>');
  const qcPool = pool('qcm', '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 12.5l4 4 8-9" fill="none" stroke="#F4F2EE" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');

  const v = new THREE.Vector3();
  let lastStage = -1;

  return function render(p: number, raw: number, out: FrameOut, camera: THREE.Camera, W: number, H: number, showLabels: boolean) {
    const proj = (pos: THREE.Vector3) => {
      v.copy(pos).project(camera);
      return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, ok: v.z < 1 && v.z > -1 };
    };

    // headline blocks
    blocks.forEach((b, i) => {
      const a = BOUNDS[i];
      const e = i < 7 ? BOUNDS[i + 1] : 2;
      const inO = i === 0 ? 1 : seg(p, a - 0.004, a + 0.012);
      const outO = i === 7 ? 1 : 1 - seg(p, e - 0.006, e + 0.004);
      const o = Math.min(inO, outO);
      const dir = p < a + 0.02 ? 1 : -1;
      b.style.opacity = o.toFixed(3);
      b.style.transform = `translateY(${((1 - o) * 16 * dir).toFixed(1)}px)`;
      b.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      b.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });

    // rail
    if (out.stage !== lastStage) {
      railBtns.forEach((b, i) => {
        b.classList.toggle('on', i === out.stage);
        b.classList.toggle('done', i < out.stage);
        if (i === out.stage) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      lastStage = out.stage;
    }

    // checklists
    const q = out.q;
    setState(asm[0], q > 0 ? 'done' : (p >= 0.17 ? 'active' : ''));
    COMP.forEach((c, i) => setState(asm[i + 1], q >= c.b ? 'done' : (q >= c.a && q > 0 ? 'active' : '')));
    qc.forEach((li, i) => setState(li, p >= 0.544 + i * 0.0085 ? 'done' : (p >= 0.536 + i * 0.0085 ? 'active' : '')));
    STEP_LISTS.transport.forEach((s, i) => setState(tr[i], p >= s[2] ? 'done' : (p >= s[1] ? 'active' : '')));
    STEP_LISTS.dealer.forEach((s, i) => setState(dl[i], p >= s[2] ? 'done' : (p >= s[1] ? 'active' : '')));

    // projected labels
    const labels = showLabels ? out.labels : [];
    const ls = labelPool(labels.length);
    labels.forEach((l, i) => {
      const s = proj(l.pos);
      const d = ls[i];
      d.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) translate(-5px,-5px)`;
      d.style.opacity = s.ok ? l.o.toFixed(2) : '0';
      (d.lastChild as HTMLElement).textContent = l.text;
    });
    const cs = chipPool(out.chips.length);
    out.chips.forEach((c, i) => {
      const s = proj(c.pos);
      const d = cs[i];
      d.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) translate(-50%,-100%)`;
      d.style.opacity = s.ok ? c.o.toFixed(2) : '0';
      d.classList.toggle('light', !c.dark);
      (d.lastChild as HTMLElement).textContent = c.text;
    });
    const qs = qcPool(out.qc.length);
    out.qc.forEach((m, i) => {
      const s = proj(m.pos);
      qs[i].style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) translate(-50%,-50%) scale(${(0.6 + 0.4 * m.o).toFixed(2)})`;
      qs[i].style.opacity = s.ok ? m.o.toFixed(2) : '0';
    });

    tintCool.style.opacity = out.tintCool.toFixed(3);
    tintWarm.style.opacity = out.tintWarm.toFixed(3);
    hint.style.opacity = (1 - seg(raw, 0.004, 0.02)).toFixed(2);
  };
}
