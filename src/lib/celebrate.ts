const EVENT = "app:celebrate";

/** Fire confetti from anywhere (render a single <ConfettiHost /> at the app root). Call after an upload succeeds. */
export function celebrate(): void {
  window.dispatchEvent(new Event(EVENT));
}

export const CELEBRATE_EVENT = EVENT;
