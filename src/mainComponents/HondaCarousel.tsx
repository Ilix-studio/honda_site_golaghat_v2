import React, { useState, useEffect } from "react";
import { Download, EyeIcon, ShoppingCart } from "lucide-react";
import {
  IconBolt,
  IconManualGearboxFilled,
  IconSettings,
} from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";

import motocycle1 from "./../assets/one.png";
import motocycle2 from "./../assets/two.png";
import motocycle3 from "./../assets/three.png";
import { Button } from "@/components/ui/button";

import SearchComponent from "./Search/SearchComponent";

// Import the SearchComponent directly

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

  const navigate = useNavigate();

  const [motorcycles] = useState<MotorcycleData[]>([
    {
      id: 1,
      name: "Honda SP160",
      image: motocycle1, // Replace with actual image path
      specs: {
        engine: "162.71 cc",
        power: "9.9kW @7500rpm",
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
        power: "12.7kW @8500rpm",
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
        power: "8kW @7500rpm",
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

  const handleSearch = (query: string) => {
    navigate(`/view-all?search=${encodeURIComponent(query)}`);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [activeSlide, motorcycles.length]);

  return (
    // Add pt-16 class to add padding top equal to the header height
    <div className='relative w-full overflow-hidden bg-white pt-16'>
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
          <IconBolt stroke={2} />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.engine}
          </p>
          <p className='text-gray-500 text-sm'>ENGINE</p>
        </div>
        <div className='flex flex-col items-center'>
          <IconManualGearboxFilled />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.power}
          </p>
          <p className='text-gray-500 text-sm'>POWER</p>
        </div>
        <div className='flex flex-col items-center'>
          <IconSettings stroke={2} />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.transmission}
          </p>
          <p className='text-gray-500 text-sm'>TRANSMISSION</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className='grid grid-cols-3 gap-1 bg-red-600 text-white'>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors gap-1'>
          <EyeIcon className='h-4 w-4' /> VIEW DETAILS
        </button>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors gap-1'>
          <ShoppingCart className='h-4 w-4' />
          EMI CALCULATOR
        </button>
        <button className='flex items-center justify-center p-4 hover:bg-red-700 transition-colors gap-1'>
          <Download className='h-4 w-4' />
          E-BROCHURE
        </button>
      </div>

      {/* Dot indicators */}
      <div className='flex justify-center py-4'>
        {motorcycles.map((_, index) => (
          <Button
            key={index}
            onClick={() => goToSlide(index)}
            className={`mx-1 h-2 w-2 rounded-full transition-colors ${
              index === activeSlide ? "bg-red-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Action section with flex and justify-center */}
      <div className='flex justify-center items-center w-full py-6 px-4 bg-white-600'>
        <div className='max-w-xl md:max-w-3xl space-y-6 w-full'>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link to='/view-all'>
              <Button className='w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded-md font-medium'>
                Explore Models
              </Button>
            </Link>

            <SearchComponent
              darkMode={false}
              placeholder='Search motorcycles'
              onSearch={handleSearch}
              className='w-full sm:w-auto'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HondaCarousel;
