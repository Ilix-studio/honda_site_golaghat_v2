// mainComponents/Scanfleet/BuyStickers.tsx
// ScanFleet sticker activation isn't live yet — this is the interim placeholder.
// The full activation flow lives in ./BuyStickersForm.tsx, ready to swap back in.
import { useNavigate } from "react-router-dom";
import { Shield, QrCode, Mail, ChevronLeft, Sparkles } from "lucide-react";

const CONTACT_EMAIL = "ilishjyoti17@gmail.com";

export default function BuyStickers() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 px-5 py-4 border-b border-gray-100'>
          <div className='w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0'>
            <Shield className='w-5 h-5 text-red-600' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>Safety Stickers</h1>
            <p className='text-xs text-gray-400 mt-0.5'>ScanFleet QR stickers</p>
          </div>
          <span className='ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-semibold text-amber-700'>
            <Sparkles className='w-3 h-3' />
            Coming Soon
          </span>
        </div>

        {/* Body */}
        <div className='flex flex-col items-center text-center px-6 py-8 space-y-5'>
          <div className='w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center'>
            <QrCode className='w-8 h-8 text-gray-400' />
          </div>

          <div className='space-y-2'>
            <h2 className='text-base font-bold text-gray-900'>
              This feature is on its way
            </h2>
            <p className='text-sm text-gray-500 leading-relaxed'>
              ScanFleet safety stickers aren't available to activate just yet.
              Scan the QR on a vehicle, reach the owner's emergency contacts
              through a masked virtual number — all of it is coming shortly.
            </p>
          </div>

          <div className='w-full p-4 rounded-xl bg-blue-50 border border-blue-100 text-left'>
            <div className='flex items-start gap-2.5'>
              <Mail className='w-4 h-4 text-blue-600 shrink-0 mt-0.5' />
              <div className='min-w-0'>
                <p className='text-xs font-semibold text-blue-800'>
                  Interested? Get in touch
                </p>
                <p className='text-xs text-blue-700 leading-relaxed mt-1'>
                  Mail us and we'll let you know the moment it goes live.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Interested%20in%20ScanFleet%20Safety%20Stickers`}
                  className='inline-block mt-2 text-xs font-bold text-blue-700 underline underline-offset-2 break-all hover:text-blue-900 transition-colors'
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className='w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-700 transition-colors'
          >
            <ChevronLeft className='w-4 h-4' />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
