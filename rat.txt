import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Phone,
  MapPin,
  ServerCogIcon,
} from "lucide-react";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";

const carouselImages = [
  "https://firebasestorage.googleapis.com/v0/b/tsangpool-honda-otp.firebasestorage.app/o/pexels-deepak-kp-432261610-27491269.jpg?alt=media&token=0cd21446-2b65-452b-aab9-47eac093f051",
  "https://firebasestorage.googleapis.com/v0/b/tsangpool-honda-otp.firebasestorage.app/o/francesca-pieleanu-eJSprKBwe3o-unsplash.jpg?alt=media&token=ff7b409f-da43-4b78-b9bd-70bda11bbea0",
  "https://firebasestorage.googleapis.com/v0/b/tsangpool-honda-otp.firebasestorage.app/o/Screenshot%202025-09-11%20at%2014.50.42.png?alt=media&token=eae50d3a-ba75-4d0d-9ce5-1b84a2c9756d",
];

const branches = [
  { id: 1, name: "Honda Motorcycles Golaghat" },
  { id: 2, name: "Honda Motorcycles Sarupathar" },
];

export default function NewUI() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
                <div className='text-xs text-red-400 font-medium tracking-wider hidden lg:block'>
                  AUTHORIZED DEALER
                </div>
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

      {/* Hero Section - responsive layout */}
      <section id='home' className='relative h-screen overflow-hidden'>
        {/* Background Images */}
        <div className='absolute inset-0'>
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100"
              }`}
            >
              <img
                src={image}
                alt={`Honda motorcycle ${index + 1}`}
                className='w-full h-full object-cover transition-transform duration-[6000ms] ease-out'
                style={{
                  transform:
                    index === currentSlide ? "scale(1.1)" : "scale(1.05)",
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent'></div>
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30'></div>
            </div>
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Hero Content - responsive typography and spacing */}
        <div className='relative z-10 container mx-auto px-4 lg:px-6 h-full flex items-center'>
          <div className='max-w-4xl'>
            {/* Floating Badge - responsive sizing */}
            <div className='inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-6 lg:mb-8 animate-float'>
              <Sparkles className='h-3 w-3 lg:h-4 lg:w-4 text-red-400' />
              <span className='text-xs lg:text-sm font-medium text-red-400'>
                New 2025 Models Available
              </span>
            </div>

            {/* Main Headline - responsive text sizes */}
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 lg:mb-8 leading-tight'>
              <span className='block text-white animate-fadeInUp'>
                Ride Into
              </span>
              <span className='block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-glow'>
                The Future
              </span>
            </h1>

            {/* Subtitle - responsive text and spacing */}
            <p className='text-lg sm:text-xl lg:text-2xl mb-8 lg:mb-12 text-gray-300 leading-relaxed max-w-2xl animate-fadeInUp animation-delay-300'>
              Experience the next generation of Honda motorcycles and scooters.
              Where cutting-edge innovation meets legendary performance.
            </p>

            {/* CTA Buttons - responsive layout */}
            <div className='flex flex-col sm:flex-row gap-4 lg:gap-6 animate-fadeInUp animation-delay-600'>
              <Link to='/view-all'>
                <Button
                  size='lg'
                  className='w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 lg:px-10 py-4 lg:py-6 text-base lg:text-lg font-semibold shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105'
                >
                  Explore Models
                  <ChevronRight className='ml-2 h-4 w-4 lg:h-5 lg:w-5' />
                </Button>
              </Link>
              <Link to='/customer/book-service'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto border-2 border-white/30 text-black hover:bg-red/10 backdrop-blur-sm px-6 lg:px-10 py-4 lg:py-6 text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105'
                >
                  Book Service
                </Button>
              </Link>
            </div>

            {/* Stats Row - responsive layout and sizing */}
            <div className='flex flex-wrap justify-center sm:justify-start gap-6 lg:gap-8 mt-12 lg:mt-16 animate-fadeInUp animation-delay-900'>
              {[
                { number: "75+", label: "Years Legacy" },
                { number: "200M+", label: "Happy Riders" },
                { number: "120+", label: "Countries" },
              ].map((stat, index) => (
                <div key={index} className='text-center'>
                  <div className='text-2xl lg:text-3xl font-bold text-white mb-1'>
                    {stat.number}
                  </div>
                  <div className='text-xs lg:text-sm text-gray-400 uppercase tracking-wider'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Indicators - responsive positioning */}
        <div className='absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2 lg:space-x-3'>
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className='group relative'
            >
              <div
                className={`w-8 lg:w-12 h-1 lg:h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              >
                {index === currentSlide && (
                  <div className='absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse'></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Scroll Indicator - hide on mobile */}
        <div className='hidden lg:block absolute bottom-8 right-8 z-20 animate-bounce'>
          <div className='flex flex-col items-center gap-2 text-white/70'>
            <span className='text-xs uppercase tracking-wider'>Scroll</span>
            <div className='w-0.5 h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent'></div>
          </div>
        </div>
      </section>
    </div>
  );
}
