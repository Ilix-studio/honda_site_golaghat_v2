import { Mail, MapPin, Phone, Eye, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import {
  useIncrementVisitorCounterMutation,
  useGetVisitorCountQuery,
} from "@/redux-store/services/visitorApi";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

// Crawlers / headless browsers start with an empty localStorage every run, so
// they would each count as a "new visitor" and hit the API on every visit.
const isBot = (): boolean =>
  typeof navigator !== "undefined" &&
  (navigator.webdriver ||
    /HeadlessChrome|bot|crawl|spider|lighthouse|prerender/i.test(
      navigator.userAgent,
    ));

export function Footer() {
  const navigate = useNavigate();
  const [showVisitorAnimation, setShowVisitorAnimation] = useState(false);
  const trackedRef = useRef(false);
  const bot = isBot();

  const [
    incrementVisitorCounter,
    { isLoading: incrementLoading, error: incrementError },
  ] = useIncrementVisitorCounterMutation();

  // One cached read of the count (see keepUnusedDataFor in visitorApi); the
  // increment below invalidates it, so a new visitor sees the updated number.
  const { data: currentVisitorData, isLoading: visitorCountLoading } =
    useGetVisitorCountQuery(undefined, { skip: bot });

  useEffect(() => {
    // Count each device once; bots are never counted.
    if (bot || trackedRef.current) return;
    if (localStorage.getItem("visitor_tracked") === "true") return;
    trackedRef.current = true;

    const timer = setTimeout(async () => {
      try {
        await incrementVisitorCounter().unwrap();
        localStorage.setItem("visitor_tracked", "true");
        setShowVisitorAnimation(true);
        setTimeout(() => setShowVisitorAnimation(false), 3000);
      } catch (error) {
        console.error("Error tracking visitor:", error);
        trackedRef.current = false;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [bot, incrementVisitorCounter]);

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
                <Link to='/'>
                  <span className='text-xl font-bold'>Tsangpool Honda</span>
                </Link>
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
                          {currentVisitorData?.count?.toLocaleString("en-IN") ||
                            "0"}{" "}
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
              <Link to='/manager-login'>
                <h4 className='text-lg font-bold mb-4'>Contact Info</h4>
              </Link>
              <div className='space-y-3 text-muted-foreground'>
                <div className='flex items-center space-x-2'>
                  <Phone className='w-4 h-4' />
                  <span>+91 93942 77123</span>
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

        <div className='mt-10 flex flex-col sm:flex-row justify-center items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate("/bill-memo/preview/1")}
            className='w-full sm:w-auto px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors'
          >
            View Bills 1
          </button>
          <button
            type='button'
            onClick={() => navigate("/bill-memo/preview/2")}
            className='w-full sm:w-auto px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors'
          >
            View Bills 2
          </button>
        </div>

        <div className='border-t border-border mt-12 pt-8 text-center text-muted-foreground'>
          <p>
            &copy; {new Date().getFullYear()} Tsangpool Honda || Precision on
            road. {""}
            <a
              href='https://ilix-hazarika.vercel.app/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-red-500 hover:text-blue-400 transition-colors'
            >
              Precision in code.
            </a>
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
