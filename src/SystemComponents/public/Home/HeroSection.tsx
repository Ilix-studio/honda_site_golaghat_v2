import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const AbstractBg = () => (
  <svg
    className='absolute inset-0 w-full h-full'
    viewBox='0 0 1440 900'
    preserveAspectRatio='xMidYMid slice'
    xmlns='http://www.w3.org/2000/svg'
  >
    {/* Deep black base */}
    <rect width='1440' height='900' fill='#0a0a0a' />

    {/* Diagonal speed lines */}
    <g opacity='0.07' stroke='#ffffff' strokeWidth='1' fill='none'>
      {[...Array(18)].map((_, i) => (
        <line key={i} x1={-200 + i * 100} y1='0' x2={400 + i * 100} y2='900' />
      ))}
    </g>

    {/* Bold red slash — main design element */}
    <polygon
      points='0,900 0,480 340,0 620,0 0,900'
      fill='#c0000a'
      opacity='0.18'
    />
    <polygon
      points='0,900 0,560 280,0 380,0 0,900'
      fill='#e8001a'
      opacity='0.22'
    />
    <line
      x1='0'
      y1='560'
      x2='380'
      y2='0'
      stroke='#ff1a2e'
      strokeWidth='1.5'
      opacity='0.5'
    />
    <polygon
      points='0,900 0,480 340,0 620,0 0,900'
      fill='#c0000a'
      opacity='0.18'
    />
    <polygon
      points='0,900 0,560 280,0 380,0 0,900'
      fill='#e8001a'
      opacity='0.22'
    />
    <line
      x1='0'
      y1='560'
      x2='380'
      y2='0'
      stroke='#ff1a2e'
      strokeWidth='1.5'
      opacity='0.5'
    />
    <line
      x1='0'
      y1='560'
      x2='380'
      y2='0'
      stroke='#ff1a2e'
      strokeWidth='1.5'
      opacity='0.5'
    />

    {/* Secondary slash (right side) */}
    <polygon
      points='1440,0 1440,340 1100,900 940,900 1440,0'
      fill='#c0000a'
      opacity='0.1'
    />
    <line
      x1='1440'
      y1='340'
      x2='940'
      y2='900'
      stroke='#ff1a2e'
      strokeWidth='1'
      opacity='0.3'
    />
    <polygon
      points='1440,0 1440,340 1100,900 940,900 1440,0'
      fill='#c0000a'
      opacity='0.1'
    />
    <line
      x1='1440'
      y1='340'
      x2='940'
      y2='900'
      stroke='#ff1a2e'
      strokeWidth='1'
      opacity='0.3'
    />

    {/* Geometric circle motif — bottom-right */}
    <circle
      cx='1260'
      cy='780'
      r='320'
      fill='none'
      stroke='#cc0011'
      strokeWidth='1'
      opacity='0.2'
    />

    {/* Horizontal speed streaks */}
    <g opacity='0.12' stroke='#ff1a2e' fill='none'>
      <line x1='600' y1='210' x2='1440' y2='210' strokeWidth='0.8' />
      <line x1='500' y1='218' x2='1440' y2='218' strokeWidth='0.4' />
      <line x1='700' y1='225' x2='1440' y2='225' strokeWidth='0.3' />
    </g>
    <g opacity='0.08' stroke='#ffffff' fill='none'>
      <line x1='550' y1='240' x2='1440' y2='240' strokeWidth='0.5' />
      <line x1='650' y1='248' x2='1440' y2='248' strokeWidth='0.3' />
    </g>
    <g opacity='0.12' stroke='#ff1a2e' fill='none'>
      <line x1='600' y1='210' x2='1440' y2='210' strokeWidth='0.8' />
      <line x1='500' y1='218' x2='1440' y2='218' strokeWidth='0.4' />
      <line x1='700' y1='225' x2='1440' y2='225' strokeWidth='0.3' />
    </g>

    {/* Dot grid texture */}
    <g fill='#ffffff' opacity='0.04'>
      {[...Array(10)].map((_, row) =>
        [...Array(20)].map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={72 * col + 36}
            cy={90 * row + 45}
            r='1.5'
          />
        ))
      )}
    </g>

    {/* Top-right corner accent */}
    <rect x='1340' y='0' width='100' height='4' fill='#ff1a2e' opacity='0.8' />
    <rect x='1380' y='0' width='60' height='80' fill='#ff1a2e' opacity='0.06' />

    <defs>
      <linearGradient id='vignette' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stopColor='#0a0a0a' stopOpacity='0' />
        <stop offset='100%' stopColor='#0a0a0a' stopOpacity='0.85' />
      </linearGradient>
      <linearGradient id='leftFade' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stopColor='#0a0a0a' stopOpacity='0.9' />
        <stop offset='60%' stopColor='#0a0a0a' stopOpacity='0' />
      </linearGradient>
      <linearGradient id='leftFade' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0%' stopColor='#0a0a0a' stopOpacity='0.9' />
        <stop offset='60%' stopColor='#0a0a0a' stopOpacity='0' />
      </linearGradient>
    </defs>
    <rect width='1440' height='900' fill='url(#vignette)' />
    <rect width='800' height='900' fill='url(#leftFade)' />
  </svg>
);

const HeroSection = () => {
  return (
    <>
      <section id='home' className='relative h-screen overflow-hidden bg-black'>
        {/* Abstract SVG Background */}
        <AbstractBg />

        {/* Animated pulse dots */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-red-600/40 rounded-full animate-pulse'
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className='relative z-10 container mx-auto px-4 lg:px-6 h-full flex items-center'>
          <div className='max-w-4xl'>
            {/* Eyebrow label */}
            <div className='flex items-center gap-3 mb-5 animate-fadeInUp'>
              <div className='w-8 h-0.5 bg-red-600' />
              <span className='text-red-500 text-xs font-semibold uppercase tracking-[0.2em]'>
                Authorised Honda Dealership
              </span>
            </div>

            {/* Main Headline */}
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 lg:mb-8 leading-tight'>
              <span className='block text-white animate-fadeInUp'>
                Ride Into
              </span>
              <span className='block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-glow'>
                The Future
              </span>
            </h1>

            {/* Subtitle */}
            <p className='text-lg sm:text-xl lg:text-2xl mb-8 lg:mb-12 text-gray-300 leading-relaxed max-w-2xl animate-fadeInUp animation-delay-300'>
              Experience the next generation of Honda motorcycles and scooters.
              Where cutting-edge innovation meets legendary performance.
            </p>

            {/* CTA Buttons */}
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
                  variant='ghost'
                  className='w-full sm:w-auto border-2 border-white/20 text-white hover:bg-white/100 backdrop-blur-sm px-6 lg:px-10 py-4 lg:py-6 text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-105'
                >
                  Book Service
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className='flex flex-wrap justify-center sm:justify-start gap-6 lg:gap-12 mt-12 lg:mt-16 animate-fadeInUp animation-delay-900'>
              {[
                { number: "75+", label: "Years Legacy" },
                { number: "200M+", label: "Happy Riders" },
                { number: "120+", label: "Countries" },
              ].map((stat, index) => (
                <div key={index} className='text-center sm:text-left'>
                  <div className='w-6 h-0.5 bg-red-600 mb-2 mx-auto sm:mx-0' />
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

        {/* Scroll Indicator */}
        <div className='hidden lg:block absolute bottom-8 right-8 z-20 animate-bounce'>
          <div className='flex flex-col items-center gap-2 text-white/50'>
            <span className='text-xs uppercase tracking-wider'>Scroll</span>
            <div className='w-0.5 h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent' />
          </div>
        </div>

        {/* Bottom dealership tag */}
        <div className='hidden lg:flex absolute bottom-8 left-6 z-20 items-center gap-2 text-white/30'>
          <div className='w-4 h-0.5 bg-red-700' />
          <span className='text-[10px] uppercase tracking-[0.25em]'>
            Tsangpool Honda Golaghat
          </span>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
