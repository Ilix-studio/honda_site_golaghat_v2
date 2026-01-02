import { Mail, MapPin, Phone, Eye, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

import {
  useIncrementVisitorCounterMutation,
  useGetVisitorCountQuery,
  useLazyGetVisitorCountQuery,
} from "@/redux-store/services/visitorApi";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [visitorTracked, setVisitorTracked] = useState(false);
  const [showVisitorAnimation, setShowVisitorAnimation] = useState(false);

  // Visitor tracking hooks
  const [
    incrementVisitorCounter,
    { isLoading: incrementLoading, error: incrementError },
  ] = useIncrementVisitorCounterMutation();

  const [getVisitorCount] = useLazyGetVisitorCountQuery();

  const { data: currentVisitorData, isLoading: visitorCountLoading } =
    useGetVisitorCountQuery();

  // Check if user has visited before
  const isReturningVisitor = (): boolean => {
    return localStorage.getItem("visitor_tracked") === "true";
  };

  // Mark user as having visited
  const markAsVisited = (): void => {
    localStorage.setItem("visitor_tracked", "true");
    setVisitorTracked(true);
  };

  // Track visitor on component mount
  useEffect(() => {
    const trackVisitor = async () => {
      if (visitorTracked) return; // Prevent double tracking

      try {
        const returning = isReturningVisitor();

        if (returning) {
          // Returning visitor - just get current count
          console.log("Returning visitor detected");
          await getVisitorCount().unwrap();
        } else {
          // New visitor - increment count
          console.log("New visitor detected, incrementing counter");
          const result = await incrementVisitorCounter().unwrap();
          markAsVisited();
          setShowVisitorAnimation(true);
          console.log("Visitor count incremented to:", result.count);

          // Hide animation after 3 seconds
          setTimeout(() => setShowVisitorAnimation(false), 3000);
        }
      } catch (error) {
        console.error("Error tracking visitor:", error);
        // Fallback: try to get current count
        try {
          await getVisitorCount().unwrap();
        } catch (fallbackError) {
          console.error("Fallback visitor count failed:", fallbackError);
        }
      }
    };

    // Track visitor after a short delay to ensure proper loading
    const timer = setTimeout(trackVisitor, 1000);
    return () => clearTimeout(timer);
  }, [incrementVisitorCounter, getVisitorCount, visitorTracked]);

  // Fixed variants with proper TypeScript typing
  const visitorVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }, // Cubic bezier for ease-out
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  const newVisitorVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <footer className='bg-muted py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-6'>
                <div className='w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center'>
                  <span className='text-white font-bold text-sm'>T</span>
                </div>
                <span className='text-xl font-bold'>TsangPool Honda</span>
              </div>
              <p className='text-muted-foreground text-pretty'>
                Your trusted Honda dealer for premium motorcycles and scooters.
                Experience the future of mobility with us.
              </p>
              <br />
              <motion.div
                className='flex flex-col sm:flex-row items-center justify-between gap-4'
                initial='hidden'
                animate='visible'
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {/* Main Visitor Counter */}
                <motion.div
                  className='flex items-center gap-3'
                  variants={visitorVariants}
                  animate={showVisitorAnimation ? "pulse" : "visible"}
                >
                  <div className='flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md'>
                    <Eye className='w-4 h-4 text-red-500' />
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {visitorCountLoading || incrementLoading ? (
                        <span className='animate-pulse'>Loading...</span>
                      ) : (
                        <>
                          {currentVisitorData?.count?.toLocaleString() || "0"}{" "}
                          visitors
                        </>
                      )}
                    </span>
                    {showVisitorAnimation && (
                      <TrendingUp className='w-3 h-3 text-green-500 animate-pulse' />
                    )}
                  </div>
                </motion.div>

                {/* Visitor Status and Stats */}
                <motion.div
                  className='flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400'
                  variants={visitorVariants}
                >
                  {/* New visitor animation */}
                  <AnimatePresence>
                    {showVisitorAnimation && (
                      <motion.div
                        className='flex items-center gap-1 text-green-600 font-medium'
                        variants={newVisitorVariants}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                      >
                        <TrendingUp className='w-3 h-3' />
                        <span>+1 New Visitor!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>

            <div>
              <h4 className='text-lg font-bold mb-4'>Quick Links</h4>
              <ul className='space-y-2 text-muted-foreground'>
                <li>
                  <a
                    href='#home'
                    className='hover:text-primary transition-colors'
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href='#models'
                    className='hover:text-primary transition-colors'
                  >
                    Models
                  </a>
                </li>
                <li>
                  <a
                    href='#services'
                    className='hover:text-primary transition-colors'
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href='#finance'
                    className='hover:text-primary transition-colors'
                  >
                    Finance
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-bold mb-4'>Services</h4>
              <ul className='space-y-2 text-muted-foreground'>
                <li>Sales & Purchase</li>
                <li>Maintenance & Repair</li>
                <li>Insurance Services</li>
                <li>Spare Parts</li>
              </ul>
            </div>

            <div>
              <h4 className='text-lg font-bold mb-4'>Contact Info</h4>
              <div className='space-y-3 text-muted-foreground'>
                <div className='flex items-center space-x-2'>
                  <Phone className='w-4 h-4' />
                  <span>+91 98765 43210</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Mail className='w-4 h-4' />
                  <span>info@tsangpoolhonda.com</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <MapPin className='w-4 h-4' />
                  <span>Bengenakhowa GF Rd, Golaghat, Assam 785621</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='border-t border-border mt-12 pt-8 text-center text-muted-foreground'>
          <p>
            &copy; {currentYear} TsangPool Honda. All rights reserved. | Powered
            by Honda Excellence
          </p>
        </div>
        {/* Error handling */}
        {incrementError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Unable to track visitor count
          </motion.div>
        )}
      </footer>
    </>
  );
}
