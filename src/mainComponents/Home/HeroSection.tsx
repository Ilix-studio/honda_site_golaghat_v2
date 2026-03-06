import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const currentYear = new Date().getFullYear();
  return (
    <>
      {/* Hero Section - responsive layout */}
      <section id='home' className='relative h-screen overflow-hidden'>
        {/* Background Images */}
        <div className='absolute inset-0'>
          {/* Background Video */}
          <div className='absolute inset-0'>
            <video
              autoPlay
              muted
              loop
              playsInline
              poster='/Users/ilish_acc/Developer/honda_site copy/client/src/assets/HS.jpeg'
              className='w-full h-full object-cover'
              style={{ filter: "brightness(0.6)" }}
            >
              <source
                src='https://edge.sitecorecloud.io/hondamotorc388f-hmsi8ece-prodb777-e813/media/Project/HONDA2WI/honda2wheelersindia/home/banner/banner-mobile-Motorcycles-Our-Moving-EN.mp4'
                type='video/mp4'
              />
            </video>
            {/* Shadow overlays */}
            <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30' />
            {/* Bottom shadow vignette */}
            <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent' />
          </div>
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
                New {currentYear} Models Available
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

        {/* Scroll Indicator - hide on mobile */}
        <div className='hidden lg:block absolute bottom-8 right-8 z-20 animate-bounce'>
          <div className='flex flex-col items-center gap-2 text-white/70'>
            <span className='text-xs uppercase tracking-wider'>Scroll</span>
            <div className='w-0.5 h-8 bg-gradient-to-b from-transparent via-white/50 to-transparent'></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
