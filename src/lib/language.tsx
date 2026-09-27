import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "as";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
};

const assamese: Record<string, string> = {
  "Admin Dashboard": "এডমিন ডেশ্বব'ৰ্ড",
  "Branch Manager Dashboard": "শাখা পৰিচালক ডেশ্বব'ৰ্ড",
  "Service Admin Dashboard": "সেৱা এডমিন ডেশ্বব'ৰ্ড",
  "Parts Admin Dashboard": "যন্ত্ৰাংশ এডমিন ডেশ্বব'ৰ্ড",
  "Staff Dashboard": "কৰ্মচাৰী ডেশ্বব'ৰ্ড",
  Dashboard: "ডেশ্বব'ৰ্ড",
  "Customer Portal": "গ্ৰাহক পৰ্টেল",
  Services: "সেৱাসমূহ",
  Support: "সহায়",
  "Book Service": "সেৱা বুক কৰক",
  Profile: "প্ৰ'ফাইল",
  "Quick Actions": "দ্ৰুত কাৰ্যসমূহ",
  Logout: "লগ আউট",
  "Logging out...": "লগ আউট কৰা হৈছে...",
  "Honda Dealership Management": "হোণ্ডা ডীলাৰশ্বিপ ব্যৱস্থাপনা",
  "Service Management": "সেৱা ব্যৱস্থাপনা",
  "Parts Inventory Management": "যন্ত্ৰাংশ ভঁৰাল ব্যৱস্থাপনা",
  "Service Bookings": "সেৱা বুকিংসমূহ",
  "Manage service appointments": "সেৱা এপইণ্টমেণ্টসমূহ পৰিচালনা কৰক",
  "Job Card Catalog": "জব কাৰ্ড তালিকা",
  "Manage job card catalog": "জব কাৰ্ড তালিকা পৰিচালনা কৰক",
  "Customer Invoices": "গ্ৰাহক চালানসমূহ",
  "Manage customer invoices": "গ্ৰাহক চালানসমূহ পৰিচালনা কৰক",
  "Service Invoices": "সেৱা চালানসমূহ",
  "Imported service invoices and their parts":
    "আমদানি কৰা সেৱা চালান আৰু সিহঁতৰ যন্ত্ৰাংশ",
  "Import Service Invoice": "সেৱা চালান আমদানি কৰক",
  "Upload a service invoice PDF": "এটা সেৱা চালান PDF আপল'ড কৰক",
  "Job Card": "জব কাৰ্ড",
  "Manage job cards": "জব কাৰ্ডসমূহ পৰিচালনা কৰক",
  "Parts Stock Upload": "যন্ত্ৰাংশ ষ্টক আমদানি",
  "Parts Stock Folder": "যন্ত্ৰাংশ ষ্টক ফ'ল্ডাৰ",
  "Import XLSX / CSV": "XLSX / CSV আমদানি কৰক",
  "CPOTC Orders": "CPOTC অৰ্ডাৰসমূহ",
  "Staff Access": "কৰ্মচাৰী প্ৰৱেশ",
  "Quotation Maker": "কোটেচন তৈয়াৰক",
  "Finance Enquiry": "বিত্তীয় অনুসন্ধান",
  "Finance applications for your branch": "আপোনাৰ শাখাৰ বিত্তীয় আবেদনসমূহ",
  "Messages by Users": "ব্যৱহাৰকাৰীৰ বাৰ্তাসমূহ",
  "Accident Reports": "দুৰ্ঘটনা প্ৰতিবেদনসমূহ",
  "Reports filed at your branch": "আপোনাৰ শাখাত দাখিল কৰা প্ৰতিবেদনসমূহ",
  "Counter Sales Reports": "কাউণ্টাৰ বিক্ৰী প্ৰতিবেদনসমূহ",
  "Branch Admin": "শাখা এডমিন",
  "Service Admin": "সেৱা এডমিন",
  "Parts Admin": "যন্ত্ৰাংশ এডমিন",
  "Admin Panel": "এডমিন পেনেল",
  Tsangpool: "ছাংপুল",
  Manager: "পৰিচালক",
  Service: "সেৱা",
  Parts: "যন্ত্ৰাংশ",
  Staff: "কৰ্মচাৰী",
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    localStorage.getItem("app-language") === "as" ? "as" : "en",
  );

  useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language === "as" ? "as" : "en";
  }, [language]);

  const t = (text: string) =>
    language === "as" ? (assamese[text] ?? text) : text;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
