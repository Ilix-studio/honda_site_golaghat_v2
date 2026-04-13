import React from "react";
import { Wrench, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const ServiceDetails: React.FC = () => {
  const serviceFeatures = [
    {
      icon: <User className='w-8 h-8 text-red-600' />,
      title: "Customer Bike Profile",
      description:
        "Complete digital profile of your Honda vehicle with maintenance history, warranty details, and personalized service recommendations.",
    },
    {
      icon: <Wrench className='w-8 h-8 text-red-600' />,
      title: "Service Assistance",
      description:
        "24/7 digital service booking, real-time updates, and expert guidance for all your Honda motorcycle and scooter needs.",
    },
    {
      icon: <Shield className='w-8 h-8 text-red-600' />,
      title: "Accident Support",
      description:
        "Immediate roadside assistance, insurance claim support, and emergency towing services available round the clock.",
    },
  ];

  const valueAddedServices = [
    "Extended Warranty Programs",
    "Genuine Parts Guarantee",
    "Pick-up & Drop Service",
    "Express Service Packages",
    "Annual Maintenance Contracts",
    "Insurance Assistance",
  ];

  return (
    <section
      id='services'
      className='bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4'
    >
      <div className='max-w-7xl mx-auto'>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className='text-center mb-12'
                >
                  <div className='flex items-center justify-center gap-2 mb-4'>
                    <div className='h-1 w-12 bg-red-500 rounded-full' />
                    <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
                    Our Dealership Services
                    </span>
                    <div className='h-1 w-12 bg-red-500 rounded-full' />
                  </div>
                  <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
                 Discover what makes Honda motorcycles stand out 
                     <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
         from the crowd
            </span>
                  </h2>
                
                </motion.div>

        {/* Service Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20'>
          {serviceFeatures.map((feature, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-600'
            >
              <div className='flex items-center mb-4'>
                {feature.icon}
                <h3 className='text-xl font-semibold text-gray-800 ml-3'>
                  {feature.title}
                </h3>
              </div>
              <p className='text-gray-600 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      
      
      
      {/* Value Added Services Section */}
      <div className='bg rounded-2xl  p-8 mb-7'>
        <div className='flex items-center justify-center mb-6'>
   
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className='text-center mb-12'
                >
                  <div className='flex items-center justify-center gap-2 mb-4'>
                    <div className='h-1 w-12 bg-red-500 rounded-full' />
                    <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
                     Our Value-Added Services
                    </span>
                    <div className='h-1 w-12 bg-red-500 rounded-full' />
                  </div>
                  <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
                 Discover what makes Honda motorcycles stand out 
                     <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
         from the crowd
            </span>
                  </h2>
                
                </motion.div>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 '>
          {valueAddedServices.map((service, index) => (
            <div
              key={index}
              className='bg-gray-50 rounded-lg p-4 border-l-5 text-center hover:bg-red-50 transition-colors duration-200'
            >
              <span className='text-gray-700 font-medium'>{service}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceDetails;
