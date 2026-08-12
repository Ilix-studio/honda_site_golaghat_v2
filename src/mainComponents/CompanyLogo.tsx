import { motion } from "framer-motion";

const CompanyLogo = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className='mx-auto w-26 h-26 bg-white rounded-full flex items-center justify-center mb-4'
    >
      <img
        src='https://res.cloudinary.com/dk9pul4wv/image/upload/v1784889521/WhatsApp_Image_2026-05-23_at_5.20.48_PM_copy_bobsqv.jpg'
        alt='Honda Motors Logo'
        className='w-45 h-45 object-contain rounded-full'
      />
    </motion.div>
  );
};

export default CompanyLogo;
