import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className='flex h-8 overflow-hidden rounded-xl border border-gray-600 text-xs font-semibold' aria-label='Language selector'>
      <Languages className='m-2 h-3.5 w-3.5 shrink-0 text-gray-300' aria-hidden='true' />
      <button type='button' onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`px-2 transition-colors ${language === "en" ? "bg-white text-gray-950" : "text-gray-300 hover:bg-gray-800"}`}>
        EN
      </button>
      <button type='button' onClick={() => setLanguage("as")} aria-pressed={language === "as"} className={`px-2 transition-colors ${language === "as" ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}>
        অসমীয়া
      </button>
    </div>
  );
}
