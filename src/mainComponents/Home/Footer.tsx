import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className='bg-muted py-16'>
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

        <div className='border-t border-border mt-12 pt-8 text-center text-muted-foreground'>
          <p>
            &copy; 2025 TsangPool Honda. All rights reserved. | Powered by Honda
            Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
