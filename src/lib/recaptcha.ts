import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "./firebase";

const verifierStore = new Map<string, RecaptchaVerifier>();

export const createRecaptchaVerifier = (
  containerId: string,
  containerElement: HTMLElement | null,
) => {
  if (!containerElement) {
    return null;
  }

  const existing = verifierStore.get(containerId);
  if (existing) {
    return existing;
  }

  try {
    const verifier = new RecaptchaVerifier(auth, containerElement, {
      size: "invisible",
      callback: () => undefined,
      "expired-callback": () => undefined,
    });

    verifierStore.set(containerId, verifier);
    return verifier;
  } catch (error) {
    console.error("Recaptcha initialization failed:", error);
    return null;
  }
};

export const clearRecaptchaVerifier = (containerId: string) => {
  const verifier = verifierStore.get(containerId);

  if (verifier) {
    try {
      verifier.clear();
    } catch (error) {
      console.warn("Failed to clear reCAPTCHA verifier:", error);
    }

    verifierStore.delete(containerId);
  }
};

/**
 * An invisible RecaptchaVerifier's challenge token is single-use — reusing the
 * same instance for a second `signInWithPhoneNumber` call (resend, or retry
 * after a failed attempt) sends a stale token and Firebase's phone-auth
 * backend responds with `auth/too-many-requests` (or the widget silently
 * fails to re-render), even though nothing was actually rate-limited. Call
 * this instead of reusing the ref before every retry/resend.
 */
export const recreateRecaptchaVerifier = (containerId: string) => {
  clearRecaptchaVerifier(containerId);
  const containerElement = document.getElementById(containerId);
  return createRecaptchaVerifier(containerId, containerElement);
};
