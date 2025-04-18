import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer id='contact' className='bg-gray-900 text-gray-300'>
      <div className='container px-4 md:px-6 py-12 md:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white'>
              Tsangpool Honda Motorcycles
            </h3>
            <p className='text-sm'>
              Honda Motor Co., Ltd. is a Japanese public multinational
              conglomerate manufacturer of automobiles, motorcycles, and power
              equipment.
            </p>
            <div className='flex space-x-4'>
              <Link to='#' className='hover:text-white transition-colors'>
                <Facebook className='h-5 w-5' />
                <span className='sr-only'>Facebook</span>
              </Link>
              <Link to='#' className='hover:text-white transition-colors'>
                <Twitter className='h-5 w-5' />
                <span className='sr-only'>Twitter</span>
              </Link>
              <Link to='#' className='hover:text-white transition-colors'>
                <Instagram className='h-5 w-5' />
                <span className='sr-only'>Instagram</span>
              </Link>
              <Link to='#' className='hover:text-white transition-colors'>
                <Youtube className='h-5 w-5' />
                <span className='sr-only'>YouTube</span>
              </Link>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='/view-all'
                  className='text-sm hover:text-white transition-colors'
                >
                  Models
                </Link>
              </li>
              <li>
                <Link
                  to='/test-ride'
                  className='text-sm hover:text-white transition-colors'
                >
                  Test Ride
                </Link>
              </li>
              <li>
                <Link
                  to='/book-service'
                  className='text-sm hover:text-white transition-colors'
                >
                  Book Service
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Find a Dealer
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Financing
                </Link>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white'>Support</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Owner&apos;s Manual
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Warranty Information
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Service &amp; Maintenance
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Safety Information
                </Link>
              </li>
              <li>
                <Link
                  to='#'
                  className='text-sm hover:text-white transition-colors'
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white'>Newsletter</h3>
            <p className='text-sm'>
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className='space-y-2'>
              <Input
                type='email'
                placeholder='Your email address'
                className='bg-gray-800 border-gray-700 text-white'
              />
              <Button className='w-full bg-red-600 hover:bg-red-700 text-white'>
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <motion.div
          className='border-t border-gray-800 mt-12 pt-8 text-sm text-center'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p>
            &copy; {new Date().getFullYear()} Honda Motor Co., Ltd. All Rights
            Reserved.
          </p>
          <div className='flex justify-center space-x-4 mt-4'>
            <Link to='#' className='hover:text-white transition-colors'>
              Privacy Policy
            </Link>
            <Link to='#' className='hover:text-white transition-colors'>
              Terms of Use
            </Link>
            <Link to='#' className='hover:text-white transition-colors'>
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
