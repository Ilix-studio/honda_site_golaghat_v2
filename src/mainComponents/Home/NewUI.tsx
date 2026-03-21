import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, MapPin, ServerCogIcon } from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import HeroSection from "./HeroSection";

const branches = [
  { id: 1, name: "Honda Motorcycles Golaghat" },
  { id: 2, name: "Honda Motorcycles Sarupathar" },
];

export default function NewUI() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className='min-h-screen bg-black overflow-hidden'>
      {/* Responsive Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-red-500/20 shadow-2xl shadow-red-500/10"
            : "bg-transparent"
        } ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className='container mx-auto px-4 lg:px-6'>
          <div className='flex items-center justify-between h-16 lg:h-20'>
            {/* Logo - responsive sizing */}
            <div className='flex items-center space-x-2 lg:space-x-3 group'>
              <div className='relative'>
                <div className='w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all duration-300'>
                  <span className='text-white font-bold text-sm lg:text-lg tracking-wider'>
                    T
                  </span>
                </div>
                <div className='absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300'></div>
              </div>
              <div>
                <span className='text-lg lg:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                  Tsangpool Honda
                </span>
              </div>
            </div>

            {/* Desktop Navigation with Overflow Menu */}
            <div className='hidden md:flex items-center space-x-4 lg:space-x-6'>
              {/* Always visible links */}
              <div className='hidden lg:flex items-center space-x-6'>
                {["Home", "Models"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className='relative group text-gray-300 hover:text-white transition-colors duration-300'
                  >
                    <span className='relative z-10 font-medium text-sm'>
                      {item}
                    </span>
                    <div className='absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-red-500 to-red-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></div>
                  </a>
                ))}
              </div>

              {/* Overflow Menu - Three Dots */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className='flex items-center justify-center w-8 h-8  rounded-full hover:bg-red-500/20 transition-colors duration-300 text-gray-300 hover:text-white'>
                    <div className='flex flex-col space-y-1'>
                      <div className='w-1 h-1 bg-current rounded-full'></div>
                      <div className='w-1 h-1 bg-current rounded-full'></div>
                      <div className='w-1 h-1 bg-current rounded-full'></div>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-48 p-0 bg-black/95 backdrop-blur-xl border border-red-500/30'
                  align='end'
                >
                  <div className='rounded-lg shadow-2xl shadow-red-500/20'>
                    <div className='flex flex-col py-2'>
                      {/* Mobile/tablet visible items */}
                      <div className='lg:hidden'>
                        {["Home", "Models"].map((item) => (
                          <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className='px-4 py-3 text-sm hover:bg-red-500/10 transition-colors text-gray-300 hover:text-white'
                          >
                            {item}
                          </a>
                        ))}
                        <div className='border-t border-red-500/20 my-1'></div>
                      </div>

                      {/* Always in overflow menu */}
                      {["Services", "Finance", "Contact"].map((item) => (
                        <a
                          key={item}
                          href={`#${item.toLowerCase()}`}
                          className='px-4 py-3 text-sm hover:bg-red-500/10 transition-colors text-gray-300 hover:text-white'
                        >
                          {item}
                        </a>
                      ))}

                      <div className='border-t border-red-500/20 my-1'></div>

                      {/* Branches */}
                      <div className='px-4 py-2'>
                        <div className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                          Branches
                        </div>
                        <a
                          href='/branches'
                          className='block px-2 py-1 text-sm hover:bg-red-500/10 transition-colors text-gray-300 hover:text-white rounded'
                        >
                          All Branches
                        </a>
                        {branches.map((branch) => (
                          <a
                            key={branch.id}
                            href={`/branches/${branch.id}`}
                            className='block px-2 py-1 text-sm hover:bg-red-500/10 transition-colors text-gray-400 hover:text-white rounded'
                          >
                            {branch.name.split(" ").pop()}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* CTA Buttons - responsive display */}
            <div className='hidden lg:flex items-center space-x-4'>
              <Button
                variant='outline'
                size='sm'
                className='border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 px-4 py-2'
              >
                <Phone className='h-4 w-4 mr-2' />
                <span className='hidden xl:inline'>Call Now</span>
              </Button>
              <Link to='/customer/book-service'>
                <Button
                  size='sm'
                  className='bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 px-4 py-2'
                >
                  <ServerCogIcon className='h-4 w-4 mr-2' />
                  <span className='hidden xl:inline'>Book Service</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button - show on tablet and mobile */}
            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden md:hidden text-white hover:bg-red-500/20'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className='h-5 w-5 lg:h-6 lg:w-6' />
              ) : (
                <Menu className='h-5 w-5 lg:h-6 lg:w-6' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {isMenuOpen && (
          <div className='xl:hidden bg-black/95 backdrop-blur-xl border-t border-red-500/20'>
            <div className='container mx-auto px-4 lg:px-6 py-4 lg:py-6 space-y-3 lg:space-y-4'>
              {["Home", "Models", "Services", "Finance", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className='block text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2 text-base lg:text-lg'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                )
              )}

              {/* Branches in mobile menu */}
              <div className='py-2'>
                <div className='text-gray-300 font-medium mb-2'>Branches</div>
                <div className='pl-4 space-y-2'>
                  <a
                    href='/branches'
                    className='block text-gray-400 hover:text-white transition-colors py-1'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Branches
                  </a>
                  {branches.map((branch) => (
                    <a
                      key={branch.id}
                      href={`/branches/${branch.id}`}
                      className='block text-gray-400 hover:text-white transition-colors py-1'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {branch.name.split(" ").pop()}
                    </a>
                  ))}
                </div>
              </div>

              <div className='pt-4 border-t border-red-500/20 space-y-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full border-red-500/50 text-red-400 hover:bg-red-500/10'
                >
                  <Phone className='h-4 w-4 mr-2' />
                  Call Now
                </Button>
                <Link to='/customer/book-service'>
                  <Button
                    size='sm'
                    className='w-full bg-gradient-to-r from-red-500 to-red-700 text-white'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MapPin className='h-4 w-4 mr-2' />
                    Book Service
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      <HeroSection />
    </div>
  );
}
