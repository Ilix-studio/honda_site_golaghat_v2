// mainComponents/CustomerSystem/Head/CustomerSupport.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";

import ScanfleetSupport from "./ScanfleetSupport";
import AccidentReport from "./AccidentReport";

type Tab = "accident" | "scanfleet";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "accident",
    label: "Accident Report",
    icon: <AlertTriangle className='h-4 w-4' />,
    description: "File an accident claim",
  },
  {
    id: "scanfleet",
    label: "ScanFleet Support",
    icon: <Shield className='h-4 w-4' />,
    description: "Virtual Number package",
  },
];

const CustomerSupport = () => {
  const [activeTab, setActiveTab] = useState<Tab>("accident");

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        {/* Tab Bar */}
        <div className='bg-white border-b border-gray-100 sticky top-0 z-10'>
          <div className='max-w-lg mx-auto px-4'>
            <div className='flex flex-initial'>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex flex-col items-start gap-0.5 py-3.5 text-sm font-medium
                            transition-colors duration-150
                            ${
                              activeTab === tab.id
                                ? "text-red-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                >
                  <span className='flex items-center gap-1.5'>
                    {tab.icon}
                    {tab.label}
                  </span>
                  <span className='text-[11px] font-normal hidden sm:block'>
                    {tab.description}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId='tab-indicator'
                      className='absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full'
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "accident" ? (
              <AccidentReport />
            ) : (
              <ScanfleetSupport />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CustomerSupport;
