// src/SystemComponents/shared/VAS/SelectVas.tsx

import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Database, ArrowRight, Sparkles } from "lucide-react";
import { useRoutePrefix } from "@/hooks/useRoutePrefix";

const SelectVas = () => {
  const navigate = useNavigate();
  const prefix = useRoutePrefix();

  const OPTIONS = [
    {
      id: "add_vas",
      title: "Add VAS",
      description:
        "Register a new Value Added Service and attach it to vehicles in the system.",
      icon: FileSpreadsheet,
      route: `${prefix}/forms/vas`,
      buttonText: "Add VAS",
      gradient: "from-red-500 to-orange-500",
      lightBg: "bg-red-50",
      iconColor: "text-red-600",
      badgeBg: "bg-red-100",
      badgeText: "text-red-600",
      badge: "New entry",
    },
    {
      id: "view_vas",
      title: "View VAS",
      description:
        "Browse, edit, and manage all existing Value Added Services from one place.",
      icon: Database,
      route: `${prefix}/view/vas`,
      buttonText: "View VAS",
      gradient: "from-blue-500 to-violet-500",
      lightBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-600",
      badge: "Manage",
    },
  ];

  return (
    <div className='max-w-3xl mx-auto py-10 px-4 space-y-8'>
      {/* header */}
      <div className='text-center space-y-1.5'>
        <div className='inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 mb-2'>
          <Sparkles className='h-3 w-3' />
          VAS Manager
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Value Added Services
        </h1>
        <p className='text-sm text-gray-500'>
          Add new VAS entries or manage existing ones
        </p>
      </div>

      {/* cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {OPTIONS.map((opt) => (
          <div
            key={opt.id}
            onClick={() => navigate(opt.route)}
            className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
          >
            {/* top gradient bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${opt.gradient}`} />

            <div className='p-6 flex flex-col gap-5'>
              {/* icon + badge */}
              <div className='flex items-start justify-between'>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${opt.lightBg}`}
                >
                  <opt.icon className={`h-5 w-5 ${opt.iconColor}`} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${opt.badgeBg} ${opt.badgeText}`}
                >
                  {opt.badge}
                </span>
              </div>

              {/* text */}
              <div className='space-y-1'>
                <h2 className='text-base font-bold text-gray-900'>
                  {opt.title}
                </h2>
                <p className='text-sm text-gray-500 leading-relaxed'>
                  {opt.description}
                </p>
              </div>

              {/* cta */}
              <button
                className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${opt.gradient} py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90`}
              >
                {opt.buttonText}
                <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectVas;
