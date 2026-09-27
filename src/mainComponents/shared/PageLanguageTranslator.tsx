import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
    initializeAssameseTranslator?: () => void;
  }
}

const SCRIPT_ID = "google-page-translator";

/**
 * Translates route content that has not yet been converted to a local `t()`
 * string.  Loading it only after Assamese is selected keeps the normal English
 * experience free from a third-party script.
 */
export default function PageLanguageTranslator() {
  const { language } = useLanguage();
  const initialized = useRef(false);

  useEffect(() => {
    const selectLanguage = () => {
      const selector = document.querySelector<HTMLSelectElement>(
        ".goog-te-combo",
      );

      if (!selector) {
        window.setTimeout(selectLanguage, 150);
        return;
      }

      selector.value = language;
      selector.dispatchEvent(new Event("change"));
    };

    const initialize = () => {
      if (!window.google?.translate?.TranslateElement || initialized.current) {
        selectLanguage();
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "as",
          autoDisplay: false,
        },
        "page-language-translator",
      );
      initialized.current = true;
      selectLanguage();
    };

    // English is the original page language. If the translator was previously
    // initialized, selecting it restores the original text.
    if (language === "en" && initialized.current) {
      selectLanguage();
      return;
    }

    if (language === "en") return;

    if (window.google?.translate?.TranslateElement) {
      initialize();
      return;
    }

    window.initializeAssameseTranslator = initialize;
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=initializeAssameseTranslator";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.initializeAssameseTranslator;
    };
  }, [language]);

  return <div id='page-language-translator' className='hidden' aria-hidden='true' />;
}
