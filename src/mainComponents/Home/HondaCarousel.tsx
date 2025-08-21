import React, { useState, useEffect } from "react";
import {
  IconBolt,
  IconManualGearboxFilled,
  IconSettings,
} from "@tabler/icons-react";
import motocycle1 from "./../../assets/one.png";
import motocycle2 from "./../../assets/two.png";
import motocycle3 from "./../../assets/three.png";

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
  const [motorcycles] = useState<MotorcycleData[]>([
    {
      id: 1,
      name: "Honda SP160",
      image: motocycle1,
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
      image: motocycle2,
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
      image: motocycle3,
      specs: {
        engine: "123.94 cc",
        power: "8kW @7500rpm",
        transmission: "4 GEARS",
      },
      price: "₹ 90,000",
    },
  ]);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === motorcycles.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [motorcycles.length]);

  return (
    <div className='relative w-full overflow-hidden bg-white pt-16'>
      <div className='relative'>
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
      </div>

      {/* Specs section */}
      <div className='grid grid-cols-3 gap-4 p-4 text-center'>
        <div className='flex flex-col items-center'>
          <IconBolt stroke={2} />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.engine}
          </p>
          <p className='text-gray-500 text-sm'>Engine</p>
        </div>
        <div className='flex flex-col items-center'>
          <IconManualGearboxFilled />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.power}
          </p>
          <p className='text-gray-500 text-sm'>Power</p>
        </div>
        <div className='flex flex-col items-center'>
          <IconSettings stroke={2} />
          <p className='font-bold text-l'>
            {motorcycles[activeSlide].specs.transmission}
          </p>
          <p className='text-gray-500 text-sm'>Transmission</p>
        </div>
      </div>
    </div>
  );
};

export default HondaCarousel;
