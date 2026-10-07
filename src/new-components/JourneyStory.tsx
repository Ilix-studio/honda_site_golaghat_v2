import { useEffect } from "react";
import { startJourney } from "./main";
import "./journey.css";

interface Step {
  kicker: string;
  headline: [string, string];
  sub?: string;
  list?: { id: string; single?: boolean };
}

// Copy for stages 01–07. Stage 08 (closing CTA) is rendered separately below.
const STEPS: Step[] = [
  {
    kicker: "01 — FRAME",
    headline: ["BUILT FROM", "THE FRAME UP."],
    sub: "Every motorcycle begins with a precisely prepared frame.",
  },
  {
    kicker: "02 — HANDOVER",
    headline: ["FROM FRAME", "TO ASSEMBLY."],
    sub: "The prepared frame travels on its carrier into the robotic assembly cell, where the arms wake one by one.",
  },
  {
    kicker: "03 — ASSEMBLY",
    headline: ["EVERY COMPONENT.", "ONE PRECISE SEQUENCE."],
    sub: "Each part travels from its rack to the frame. Keep scrolling to build it.",
    list: { id: "list-asm" },
  },
  {
    kicker: "04 — READY",
    headline: ["READY", "TO MOVE."],
    sub: "The completed motorcycle rolls out of the cell on its own wheels, headed for one last look.",
  },
  {
    kicker: "05 — QUALITY",
    headline: ["BEFORE IT LEAVES,", "EVERYTHING IS CHECKED."],
    sub: "Assembled. Inspected. Ready for transport.",
    list: { id: "list-qc" },
  },
  {
    kicker: "06 — TRANSPORT",
    headline: ["FROM FACTORY", "TO DEALER."],
    sub: "Loaded, secured and on the road through green hills and villages. The route shown is illustrative.",
    list: { id: "list-tr", single: true },
  },
  {
    kicker: "07 — DEALER",
    headline: ["ARRIVING AT", "TSANGPOOL HONDA."],
    sub: "The same motorcycle, received and unloaded by the dealership team.",
    list: { id: "list-dl", single: true },
  },
];

function Ctas() {
  return (
    <div className='ctas'>
      <a className='btn pri' href='#journey'>
        EXPLORE THE JOURNEY
      </a>
    </div>
  );
}

/**
 * Scroll-driven 3D story: one motorcycle from bare frame to showroom.
 * The DOM below is the overlay (headlines, rail, checklists) that
 * `startJourney()` drives by id/class; the three.js scene renders into #scene.
 */
export default function JourneyStory() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("journey-page");
    const stop = startJourney();
    return () => {
      stop();
      root.classList.remove("journey-page");
    };
  }, []);

  return (
    <div className='jr'>
      <div className='track' id='journey'>
        <div className='stage' id='stage'>
          <canvas
            id='scene'
            role='img'
            aria-label='3D illustration: a motorcycle moves from frame assembly through robotic assembly, inspection and truck transport to the Tsangpool Honda showroom'
          />
          <div className='tint' id='tint-cool' />
          <div className='tint warm' id='tint-warm' />
          <div className='overlay' id='overlay' aria-hidden='true' />

          <nav className='rail' id='rail' aria-label='Journey stages' />

          <div className='panel'>
            {STEPS.map((s, i) => {
              const H = i === 0 ? "h1" : "h2";
              return (
                <div className='hblock' key={s.kicker}>
                  <div className='kick'>
                    <span />
                    {s.kicker}
                  </div>
                  <H className='hl'>
                    {s.headline[0]}
                    <br />
                    {s.headline[1]}
                  </H>
                  {s.sub && <p className='sub'>{s.sub}</p>}
                  {s.list && (
                    <div
                      className={s.list.single ? "list one" : "list"}
                      id={s.list.id}
                    />
                  )}
                </div>
              );
            })}
            <div className='hblock'>
              <div className='kick'>
                <span />
                08 — READY TO RIDE
              </div>
              <h2 className='hl'>
                FROM FACTORY
                <br />
                TO YOUR NEXT RIDE.
              </h2>
              <div className='fin'>
                BUILT.
                <br />
                CHECKED.
                <br />
                DELIVERED.
              </div>
              <Ctas />
            </div>
          </div>

          <div className='hint' id='hint'>
            SCROLL TO FOLLOW THE MOTORCYCLE
            <i />
          </div>
          <p className='fallback' id='fallback' hidden>
            This journey needs WebGL. Scroll on to visit the dealer.
          </p>
        </div>
      </div>
    </div>
  );
}
