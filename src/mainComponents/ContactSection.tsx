import { useState } from "react";
import { motion } from "framer-motion";

import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  updateContactFormData,
  setContactFormSubmitting,
  setContactFormSubmitted,
  resetContactForm,
  selectContactFormData,
  selectContactFormSubmitting,
  selectContactFormSubmitted,
} from "../redux-store/slices/formSlice";

export function ContactSection({ branch }: any) {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectContactFormData);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateContactFormData({ [field]: value }));
  };

  const handleSubmit = ({ e }: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    dispatch(resetContactForm());
  };

  // Default contact details if no branch is provided
  const contactDetails = {
    address: branch?.address || "Bengenakhowa GF Rd, Golaghat, Assam 785702",
    phone: branch?.phone || "910202020",
    email: branch?.email || "golaghat@hondamotorcycles.example",
    hours: branch?.hours || {
      weekdays: "9:00 AM - 7:00 PM",
      saturday: "10:00 AM - 5:00 PM",
      sunday: "Closed",
    },
    mapUrl:
      branch?.mapUrl ||
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14281.708160586099!2d93.95457205941675!3d26.50638691585567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37468fc4ad54202d%3A0x88e76c0b31c949f!2sTsangpool%20Honda!5e0!3m2!1sen!2sin!4v1745182504481!5m2!1sen!2sin",
  };

  // Title and description based on whether a specific branch is selected
  const title = branch ? `Contact ${branch.name}` : "Contact Us";
  const description = branch
    ? `Get in touch with our ${branch.name
        .split(" ")
        .pop()} branch for personalized assistance`
    : "Visit our dealership or get in touch with our team for any inquiries about Honda motorcycles";

  return (
    <section className='py-16 bg-gray-50'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
          <p className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'>
            {description}
          </p>
        </motion.div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Map Embed */}
          <motion.div
            className='lg:w-1/2'
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className='aspect-[4/3] w-full h-full min-h-[300px] bg-gray-200 rounded-lg overflow-hidden'>
              <iframe
                src={contactDetails.mapUrl}
                width='100%'
                height='100%'
                style={{ border: 0 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='Honda Motorcycles Dealership Location'
                className='w-full h-full'
              ></iframe>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className='lg:w-1/2'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className='h-full'>
              <CardHeader>
                <CardTitle>Get In Touch</CardTitle>
                <CardDescription>
                  We're here to help with any questions about our motorcycles,
                  service, or parts
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Contact Details */}
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <MapPin className='h-5 w-5 text-red-600 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Address</h3>
                      <p className='text-muted-foreground'>
                        {contactDetails.address}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Phone className='h-5 w-5 text-red-600 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Phone</h3>
                      <p className='text-muted-foreground'>
                        {contactDetails.phone}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Mail className='h-5 w-5 text-red-600 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Email</h3>
                      <p className='text-muted-foreground'>
                        {contactDetails.email}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Clock className='h-5 w-5 text-red-600 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Hours</h3>
                      <p className='text-muted-foreground'>
                        Monday - Friday: {contactDetails.hours.weekdays}
                      </p>
                      <p className='text-muted-foreground'>
                        Saturday: {contactDetails.hours.saturday}
                      </p>
                      <p className='text-muted-foreground'>
                        Sunday: {contactDetails.hours.sunday}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact Form */}
                {!formSubmitted ? (
                  <form onSubmit={handleSubmit} className='space-y-4 pt-4'>
                    <h3 className='font-medium'>Send us a message</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Input placeholder='Name' required />
                      </div>
                      <div className='space-y-2'>
                        <Input type='email' placeholder='Email' required />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Input placeholder='Subject' required />
                    </div>
                    <div className='space-y-2'>
                      <Textarea placeholder='Your message' rows={4} required />
                    </div>
                    <Button
                      type='submit'
                      className='bg-red-600 hover:bg-red-700 w-full'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className='flex items-center gap-2'>
                          <svg
                            className='animate-spin h-4 w-4 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <Send className='h-4 w-4' />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className='bg-green-50 p-4 rounded-lg text-center'>
                    <CheckCircle className='h-8 w-8 text-green-500 mx-auto mb-2' />
                    <h3 className='font-medium text-green-800'>
                      Message Sent!
                    </h3>
                    <p className='text-green-600 text-sm'>
                      Thank you for contacting us. We'll get back to you
                      shortly.
                    </p>
                    <Button
                      variant='outline'
                      className='mt-4'
                      onClick={() => setFormSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
