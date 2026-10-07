You're working in a Vite + three.js project: a scroll-driven 3D story for Tsangpool Honda (a motorcycle dealer in Assam). One continuous scene follows the SAME motorcycle from bare frame → robotic assembly → final inspection → truck transport → arrival at the dealership → showroom. Read README.md first; it maps every file and the stage timeline.

The code was written and executed in a browser against a stand-in for three.js, so the JavaScript runs without errors and the HTML overlay (headlines, progress rail, checklists, labels) is verified. The 3D itself has NEVER been rendered. Your job is to get it rendering correctly and looking good.

## Step 1 — make it run
1. `npm install`, then `npx playwright install chromium`.
2. `npm run check`. It builds, serves dist/, scrolls to each of the 8 stage pause points at 1440×900 and 390×844, fails on any error or empty render, and writes screenshots to smoke-screenshots/.
3. Fix whatever fails. Re-run until it passes.

## Step 2 — look at every screenshot and fix what's wrong
Open all 16 screenshots and judge each one against this list. Fix in code, re-run `npm run check`, look again. Repeat until every item holds.

- **Continuity (most important):** the red/white motorcycle is the same object in every stage, and nothing replaces it. It is never hidden at a pause point, never clipped by a wall, the camera or the truck, and never floating above or sinking into the floor, deck or ramp.
- **Proportions:** the bike reads as a real motorcycle (wheelbase 1.28 m, wheel radius 0.31 m). Check the frame tubes, fork angle, tank, seat and exhaust in `src/bike.js`. Parts must line up when installed: no gaps between the fork and the front axle, and the swingarm reaches the rear axle.
- **Assembly (stage 03):** scrub p from 0.18 to 0.42 in small steps (add a temporary `?p=` URL param if useful). Each part sits on a rack, a robot's gripper meets it, it travels in an arc and lands exactly in place. Robots must not pass through the bike, the fence or each other, and arms must stay within reach (`solveRobot` clamps; if an arm is visibly overstretched, move the tray or the robot base).
- **Camera:** in `src/choreography.js` the camera is a keyframed orbit (radius, azimuth, elevation) around a target. At every stage the subject is clear of the text panel: subject on the right on desktop, above the bottom panel on phones. No frame should be filled by a wall, a column or the roof. Smooth any abrupt swings between keyframes.
- **Truck (06):** the doors swing outward, the ramp meets the ground, the bike rolls up and is strapped in, the side panel cut-away shows it, and the doors close before the truck leaves. At the dealer, the same steps happen in reverse.
- **Dealer (07–08):** the "TSANGPOOL HONDA" fascia is legible in the arrival shot. The bike enters through the glass-door gap, stops on the turntable and turns slowly. Showroom lighting is warmer than the factory.
- **Lighting and materials:** a natural, clean factory light: warm off-white, charcoal, metallic grey, blue-grey. Red is used only on the bike body and small accents. No neon, no heavy bloom, no washed-out or crushed shadows. Shadows should follow the action (the sun follows the camera target).
- **Phone:** the bike is fully in frame and readable above the bottom panel at every stage.

## Step 3 — performance
Target 60 fps on a mid-range laptop and smooth scrolling on a recent phone. Log `renderer.info` at each stage. If needed: share geometries and materials, merge static factory and scenery meshes, turn off `castShadow` on distant scenery, and cap pixel ratio at 1.5 on phones. Don't drop the 3D in favour of 2D.

## Constraints — don't break these
- Present this as an illustrative visualization. Don't add claims about real Honda factory procedures, and keep the disclaimer in the closing section.
- Use no Honda wing logo or any other official mark. Signage stays plain text, and the hero bike stays a generic design, not a real Honda model.
- Keep the copy as written (headlines, "BUILT. CHECKED. DELIVERED.", CTAs). Keep the placeholders [SHOWROOM ADDRESS], [PHONE], [EMAIL], [OPENING HOURS].
- Keep `prefers-reduced-motion` support: snap to stage pause points, with no continuous camera motion.
- Keep the stage boundaries and pause points in sync in three places: `choreography.js` (BOUNDS/HOLDS), `ui.js` and `scripts/smoke-test.mjs`.
- No new runtime dependencies unless clearly worth it. If you add GSAP or postprocessing, explain why in the README.

## Done when
`npm run check` passes, and you've looked at the final screenshots and can state, per stage, that the checklist above holds. Finish by summarising what you changed and anything you're unsure about.
