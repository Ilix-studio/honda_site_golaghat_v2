import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { MapPin, Home, PhoneCall, Frown, Search } from "lucide-react";
import { Header } from "./Home/Header";
import { Footer } from "./Home/Footer";

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = "Page Not Found | Tsangpool Honda Motorcycles";

    // Animation timing
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // In a real implementation, this would navigate to search results
    console.log("Search query:", searchQuery);
  };

  return (
    <main className='min-h-screen flex flex-col bg-gray-50'>
      <Header />

      <section className='flex-grow flex items-center justify-center py-16 px-4'>
        <div className='max-w-4xl w-full'>
          <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
            <div className='grid md:grid-cols-2'>
              {/* Left content */}
              <div className='p-8 md:p-12 flex flex-col justify-center'>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className='space-y-6'
                >
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600'>
                    <Frown className='h-8 w-8' />
                  </div>

                  <div>
                    <h1 className='text-4xl font-bold mb-2 text-gray-900'>
                      Page Not Found
                    </h1>
                    <p className='text-gray-600 mb-6'>
                      We can't seem to find the page you're looking for. The
                      page might have been removed, renamed, or is temporarily
                      unavailable.
                    </p>
                  </div>

                  <div className='space-y-3'>
                    <Link to='/'>
                      <Button className='w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2'>
                        <Home className='h-4 w-4' />
                        Back to Homepage
                      </Button>
                    </Link>
                  </div>

                  <div className='pt-4'>
                    <form onSubmit={handleSearch} className='relative'>
                      <input
                        type='text'
                        placeholder='Search for motorcycles...'
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        type='submit'
                        className='absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors'
                      >
                        <Search className='h-4 w-4' />
                      </button>
                    </form>
                  </div>
                </motion.div>
              </div>

              {/* Right content - Animated motorcycle */}
              <div className='bg-gradient-to-br from-red-600 to-red-800 p-8 md:p-12 flex items-center justify-center relative overflow-hidden'>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: isAnimationComplete ? [0, -10, 10, -5, 5, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    x: {
                      delay: 1.5,
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 5,
                    },
                  }}
                  className='relative z-10'
                >
                  <svg
                    className='w-64 h-64 text-white'
                    viewBox='0 0 100 100'
                    fill='currentColor'
                  >
                    <path d='M85,65 C87.5,65 90,66 90,70 C90,74 87.5,75 85,75 C82.5,75 80,74 80,70 C80,66 82.5,65 85,65 Z' />
                    <path d='M15,65 C17.5,65 20,66 20,70 C20,74 17.5,75 15,75 C12.5,75 10,74 10,70 C10,66 12.5,65 15,65 Z' />
                    <path d='M30,40 L50,40 L70,55 L60,65 L30,65 L20,55 Z' />
                    <path d='M70,55 L80,55 L85,65 L60,65 Z' />
                    <path d='M30,65 L15,65' />
                    <path d='M60,65 L85,65' />
                    <path d='M40,40 L45,30 L60,30 L70,40' />
                  </svg>
                </motion.div>

                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-red-600/30 to-transparent'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />

                <motion.div
                  className='absolute bottom-8 left-8 text-white space-y-3'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span className='text-sm'>Find a dealership</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <PhoneCall className='h-4 w-4' />
                    <span className='text-sm'>Call us: 883920-2092122</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <motion.div
            className='mt-8 text-center text-gray-600'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              Looking for something specific? Visit our{" "}
              <Link to='/' className='text-red-600 hover:underline'>
                sitemap
              </Link>{" "}
              or{" "}
              <Link to='/' className='text-red-600 hover:underline'>
                contact us
              </Link>{" "}
              for assistance.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default NotFoundPage;
