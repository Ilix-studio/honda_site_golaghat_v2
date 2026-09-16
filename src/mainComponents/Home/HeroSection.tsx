import { memo, useMemo } from "react";
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
    </defs>
    <rect width='1440' height='900' fill='url(#vignette)' />
    <rect width='800' height='900' fill='url(#leftFade)' />
  </svg>
);

const HeroSection = () => {
  const pulseDots = useMemo(
    () =>
      [...Array(14)].map(() => ({
        left: `${15 + Math.random() * 70}%`,
        top: `${10 + Math.random() * 80}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      })),
    [],
  );

  return (
    <>
      {/*
        min-h-[100svh] rather than h-screen: `svh` is the *small* viewport
        height, so mobile browsers that overlay a collapsing URL bar don't
        crop the stats row. min- (not fixed) lets the hero grow instead of
        clipping when the text wraps on a narrow or short screen.
      */}
      <section
        id='home'
        className='relative flex min-h-[100svh] items-center overflow-hidden bg-black'
      >
        {/* Abstract SVG Background */}
        <AbstractBg />

        {/* Animated pulse dots */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          {pulseDots.map((style, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-red-600/40 rounded-full animate-pulse'
              style={style}
            />
          ))}
        </div>

        {/*
          The site nav is `fixed` (h-16, h-20 from lg up) and overlays this
          section, so the content needs its own top padding to clear it —
          without it the eyebrow label collides with the logo. The bottom
          padding reserves room for the absolutely-positioned scroll
          indicator and dealership tag below.
        */}
        <div className='relative z-10 flex w-full container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28'>
          <div className='w-full max-w-3xl'>
            {/* Eyebrow label */}
            <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5 animate-fadeInUp'>
              <div className='w-5 sm:w-6 lg:w-8 h-0.5 bg-red-600 flex-shrink-0' />
              <span className='text-red-500 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em]'>
                Authorised Honda Dealership
              </span>
            </div>

            {/* Main Headline */}
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-[1.1]'>
              <span className='block text-white animate-fadeInUp'>
                Ride Into
              </span>
              <span className='block bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-glow'>
                The Future
              </span>
            </h1>

            {/* Subtitle */}
            <p className='text-sm sm:text-base lg:text-lg xl:text-xl mb-5 sm:mb-6 lg:mb-8 text-gray-300 leading-relaxed max-w-md sm:max-w-lg lg:max-w-xl animate-fadeInUp animation-delay-300'>
              Experience the next generation of Honda motorcycles and scooters.
              Where cutting-edge innovation meets legendary performance.
            </p>

            {/* CTA Buttons */}
            {/*
              `w-full sm:w-auto` has to sit on the Link as well as the Button:
              the Link is the flex child, so without it the button has no
              full-width parent to fill on mobile. `h-auto` lets the explicit
              py- control the height instead of size='lg''s fixed height.
            */}
            <div className='flex flex-col sm:flex-row gap-2.5 sm:gap-3 lg:gap-4 animate-fadeInUp animation-delay-600'>
              <Link to='/view-all' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  className='w-full sm:w-auto h-auto bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm lg:text-base font-semibold shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105'
                >
                  Explore Models
                  <ChevronRight className='ml-1.5 h-4 w-4' />
                </Button>
              </Link>
              <Link to='/customer/book-service' className='w-full sm:w-auto'>
                <Button
                  size='lg'
                  variant='ghost'
                  className='w-full sm:w-auto h-auto border-2 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-sm px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 text-sm lg:text-base font-semibold transition-all duration-300 hover:scale-105'
                >
                  Book Service
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className='flex flex-wrap justify-start gap-x-6 gap-y-4 sm:gap-x-8 lg:gap-x-10 mt-8 sm:mt-10 lg:mt-12 animate-fadeInUp animation-delay-900'>
              {[
                { number: "75+", label: "Years Legacy" },
                { number: "200M+", label: "Happy Riders" },
                { number: "120+", label: "Countries" },
              ].map((stat, index) => (
                <div key={index} className='text-left'>
                  <div className='w-4 sm:w-5 lg:w-6 h-0.5 bg-red-600 mb-1.5' />
                  <div className='text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5 leading-none'>
                    {stat.number}
                  </div>
                  <div className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*
          Both of these are decoration pinned to the bottom of the section, so
          they only earn their place when the viewport is genuinely tall
          enough — on a short laptop window they used to print straight
          through the stats row. The height condition is what matters here;
          a width breakpoint alone can't detect it.
        */}
        {/* Scroll Indicator */}
        <div className='hidden [@media(min-width:1024px)_and_(min-height:720px)]:block absolute bottom-6 right-6 z-20 animate-bounce'>
          <div className='flex flex-col items-center gap-2 text-white/50'>
            <span className='text-[10px] uppercase tracking-wider'>Scroll</span>
            <div className='w-0.5 h-7 bg-gradient-to-b from-transparent via-white/40 to-transparent' />
          </div>
        </div>

        {/* Bottom dealership tag */}
        <div className='hidden [@media(min-width:1024px)_and_(min-height:720px)]:flex absolute bottom-6 left-6 z-20 items-center gap-2 text-white/30'>
          <div className='w-4 h-0.5 bg-red-700' />
          <span className='text-[10px] uppercase tracking-[0.25em]'>
            Tsangpool Honda Golaghat
          </span>
        </div>
      </section>
    </>
  );
};

export default memo(HeroSection);
