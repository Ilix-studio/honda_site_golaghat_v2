import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Footer } from "../Home/Footer";
import { Header } from "../Home/Header/Header";

export function Contact() {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container pt-28 pb-10 px-4 flex-grow'>
        {/* Hero Section */}
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl font-bold mb-4'>Contact Us</h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Have questions about our motorcycles or services? Our team is here
            to help. Get in touch with us through any of the channels below.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <Phone className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Call Us</h3>
            <p className='text-muted-foreground mb-2'>
              For immediate assistance
            </p>
            <a
              href='tel:+918754123698'
              className='text-red-600 font-medium hover:underline'
            >
              +91 875 412 3698
            </a>
          </motion.div>

          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <Mail className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Email Us</h3>
            <p className='text-muted-foreground mb-2'>
              For inquiries and support
            </p>
            <a
              href='mailto:info@hondamotors.com'
              className='text-red-600 font-medium hover:underline'
            >
              info@hondamotors.com
            </a>
          </motion.div>

          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <MapPin className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Visit Us</h3>
            <p className='text-muted-foreground mb-2'>Our flagship showroom</p>
            <address className='not-italic text-sm'>
              123 Bike Boulevard, <br />
              AT Road, Jorhat, <br />
              Assam 785001
            </address>
          </motion.div>

          <motion.div
            className='p-6 border rounded-lg shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <Clock className='h-6 w-6 text-red-600' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Working Hours</h3>
            <ul className='text-sm space-y-1'>
              <li className='flex justify-between'>
                <span className='text-muted-foreground'>Monday-Friday:</span>
                <span>9:00 AM - 7:00 PM</span>
              </li>
              <li className='flex justify-between'>
                <span className='text-muted-foreground'>Saturday:</span>
                <span>10:00 AM - 6:00 PM</span>
              </li>
              <li className='flex justify-between'>
                <span className='text-muted-foreground'>Sunday:</span>
                <span>Closed</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Map and Contact Form */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16'>
          {/* Map */}
          <motion.div
            className='rounded-lg overflow-hidden border h-[400px] lg:h-auto bg-gray-100'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* This is a placeholder for an actual map */}
            <form className='h-full flex flex-col items-center justify-center p-6 text-center'>
              <MapPin className='h-10 w-10 text-red-600 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                Honda Motorcycles Jorhat
              </h3>
              <p className='text-muted-foreground mb-4'>
                123 Bike Boulevard, AT Road, <br />
                Jorhat, Assam 785001
              </p>
              <Button
                variant='outline'
                className='flex items-center gap-2'
                onClick={() => window.open("https://maps.google.com", "_blank")}
              >
                <MapPin className='h-4 w-4' /> Get Directions
              </Button>

              <p className='text-xs text-center mt-4 text-muted-foreground'>
                By submitting this form, you agree to our Privacy Policy and
                consent to being contacted regarding your inquiry.
              </p>
            </form>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className='text-2xl font-bold mb-6'>
            Frequently Asked Questions
          </h2>

          <div className='space-y-6'>
            <div className='border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-2'>
                How do I book a test ride?
              </h3>
              <p className='text-muted-foreground'>
                You can book a test ride by using our online form, calling our
                showroom directly, or visiting us in person. Make sure to bring
                your valid driving license when you come for the test ride.
              </p>
            </div>

            <div className='border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-2'>
                What is the warranty period for new motorcycles?
              </h3>
              <p className='text-muted-foreground'>
                All new Honda motorcycles come with a standard 2-year warranty.
                Extended warranty options are available for purchase at the time
                of buying your motorcycle.
              </p>
            </div>

            <div className='border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-2'>
                How do I schedule a service appointment?
              </h3>
              <p className='text-muted-foreground'>
                You can schedule a service appointment through our website, by
                calling our service center, or using the Honda Service app. We
                recommend booking at least 3-5 days in advance.
              </p>
            </div>

            <div className='border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-2'>
                Do you offer home delivery for new bikes?
              </h3>
              <p className='text-muted-foreground'>
                Yes, we offer home delivery for new motorcycles within a 50km
                radius of our showroom. Additional charges may apply based on
                the delivery distance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Contact;
