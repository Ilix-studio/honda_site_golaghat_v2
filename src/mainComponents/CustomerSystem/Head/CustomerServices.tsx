import ServiceStatsDisplay from "../BookingService/ServiceStatsDisplay";

import ViewAccidentReport from "./CustomerSupport/ViewAccidentReport";
const CustomerServices = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <ServiceStatsDisplay />

        <ViewAccidentReport />
      </main>
    </div>
  );
};

export default CustomerServices;
