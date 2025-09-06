import { Footer } from "../../Home/Footer";
import { CustomerBikeInfo } from "../CustomerBikeInfo";
import { CustomerDashHeader } from "../../Home/Header/CustomerDashHeader";

export default function CustomerMainDash() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <CustomerDashHeader />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Owner Dashboard
          </h1>
          <p className='text-gray-600'>
            Welcome back! Here's your motorcycle information and service
            details.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-1 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2'>
            <CustomerBikeInfo />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
