// HondaCarousel.tsx
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import motocycle1 from "./../assets/one.png";
import motocycle2 from "./../assets/two.png";
import motocycle3 from "./../assets/three.png";

interface MotorcycleData {
  id: number;
  name: string;
  image: string;
  specs: {
    engine: string;
    power: string;
    transmission: string;
  };
  price: string;
}

const HondaCarousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [motorcycles] = useState<MotorcycleData[]>([
    {
      id: 1,
      name: "Honda SP160",
      image: motocycle1, // Replace with actual image path
      specs: {
        engine: "162.71 cc",
        power: "9.9kW @ 7500 rpm",
        transmission: "5 GEARS",
      },
      price: "₹ 1,21, 226",
    },
    {
      id: 2,
      name: "Honda CB200X",
      image: motocycle2, // Replace with actual image path
      specs: {
        engine: "184.4 cc",
        power: "12.7kW @ 8500 rpm",
        transmission: "5 GEARS",
      },
      price: "₹ 1,50,900",
    },
    {
      id: 3,
      name: "Honda SP125",
      image: motocycle3, // Replace with actual image path
      specs: {
        engine: "123.94 cc",
        power: "8kW @ 7500 rpm",
        transmission: "4 GEARS",
      },
      price: "₹ 90,000",
    },
    // Add more motorcycles as needed
  ]);

  // Function to move to the next slide
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === motorcycles.length - 1 ? 0 : prev + 1));
  };

  // Function to move to the previous slide
  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? motorcycles.length - 1 : prev - 1));
  };

  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page with the query
      navigate(`/view-all?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlide, motorcycles.length]);

  return (
    <div className='relative w-full overflow-hidden bg-white'>
      {/* Header with Honda logo and menu button */}

      {/* Carousel content */}
      <div className='relative'>
        {/* Slides */}
        <div className='relative h-64 md:h-96'>
          {motorcycles.map((motorcycle, index) => (
            <div
              key={motorcycle.id}
              className={`absolute top-0 left-0 h-full w-full transition-opacity duration-500 ease-in-out ${
                index === activeSlide
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={motorcycle.image}
                alt={motorcycle.name}
                className='h-full w-full object-cover'
              />
              <div className='absolute bottom-5 right-5 bg-opacity-80 bg-black p-2 text-white rounded'>
                <p className='text-xl font-bold'>{motorcycle.name}</p>
                <p className='text-sm'>{motorcycle.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button onClick={prevSlide}></button>
        <button onClick={nextSlide}></button>
      </div>

      {/* Specs section */}
      <div className='grid grid-cols-3 gap-4 p-4 text-center'>
        <div className='flex flex-col items-center'>
          <div className='mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='h-8 w-8 mx-auto'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          </div>
          <p className='font-bold text-xl'>
            {motorcycles[activeSlide].specs.engine}
          </p>
          <p className='text-gray-500 text-sm'>ENGINE</p>
        </div>
        <div className='flex flex-col items-center'>
          <div className='mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='h-8 w-8 mx-auto'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 14l-7 7m0 0l-7-7m7 7V3'
              />
            </svg>
          </div>
          <p className='font-bold text-xl'>
            {motorcycles[activeSlide].specs.power}
          </p>
          <p className='text-gray-500 text-sm'>POWER</p>
        </div>
        <div className='flex flex-col items-center'>
          <div className='mb-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='h-8 w-8 mx-auto'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
          <p className='font-bold text-xl'>
            {motorcycles[activeSlide].specs.transmission}
          </p>
          <p className='text-gray-500 text-sm'>TRANSMISSION</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className='grid grid-cols-3 gap-1 bg-red-600 text-white'>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='h-5 w-5 mr-2'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
            />
          </svg>
          VIEW DETAILS
        </button>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='h-5 w-5 mr-2'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
            />
          </svg>
          EMI CALCULATOR
        </button>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            className='h-5 w-5 mr-2'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10'
            />
          </svg>
          E-BROCHURE
        </button>
      </div>

      {/* Dot indicators */}
      <div className='flex justify-center py-4'>
        {motorcycles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`mx-1 h-3 w-3 rounded-full transition-colors ${
              index === activeSlide ? "bg-red-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {/* Action section with flex and justify-center */}
      <div className='flex justify-center items-center w-full py-6 px-4 bg-red-600'>
        <div className='max-w-xl md:max-w-3xl space-y-6 w-full'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <button className='w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded-md font-medium'>
              Explore Models
            </button>

            {/* Search Component */}
            <form onSubmit={handleSearch} className='flex w-full sm:w-auto'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  placeholder='Search bikes or scooters...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-4 pr-10 py-2 border-2 border-white bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-l-md h-11'
                />
                <button
                  type='submit'
                  className='absolute right-0 top-0 h-full bg-white text-black hover:bg-gray-200 rounded-none rounded-r-md px-3'
                >
                  <Search className='h-5 w-5' />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HondaCarousel;
