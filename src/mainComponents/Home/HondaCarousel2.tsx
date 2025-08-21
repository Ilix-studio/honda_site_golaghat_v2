import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";

interface BikeData {
  id: number;
  name: string;
  image?: string;
  category: string;
  price: string;
  isNew?: boolean;
}

const BikeCard = ({
  bike,
  isNew = false,
}: {
  bike?: BikeData;
  isNew?: boolean;
}) => (
  <Card className='group border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden bg-white w-full'>
    <CardContent className='p-0'>
      {/* Image section */}
      <div className='relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden'>
        {isNew && (
          <Badge className='absolute top-3 left-3 z-10 bg-red-600 hover:bg-red-700 text-white border-0 text-xs font-medium px-2 py-1'>
            New
          </Badge>
        )}
        {bike?.image ? (
          <img
            src={bike.image}
            alt={bike.name}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <div className='text-center text-gray-400'>
              <div className='text-4xl mb-2'>🏍️</div>
              <p className='text-sm'>Bike Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className='p-6 space-y-3'>
        <h3 className='text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors'>
          {bike?.name || "Bike Name"}
        </h3>
        <p className='text-sm text-gray-600 font-medium'>
          {bike?.category || "Category"}
        </p>
        <p className='text-xl font-bold text-gray-900'>
          {bike?.price || "Price"}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default function HondaCarousel2() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample data - replace with actual data
  const latestBikes: BikeData[] = [
    {
      id: 1,
      name: "Honda SP160",
      category: "Sport",
      price: "₹ 1,21,226",
      isNew: true,
    },
    {
      id: 2,
      name: "Honda CB200X",
      category: "Adventure",
      price: "₹ 1,50,900",
      isNew: true,
    },
    {
      id: 3,
      name: "Honda SP125",
      category: "Sport",
      price: "₹ 90,000",
      isNew: true,
    },
    {
      id: 4,
      name: "Honda Activa 6G",
      category: "Scooter",
      price: "₹ 75,000",
      isNew: true,
    },
    {
      id: 5,
      name: "Honda Dio",
      category: "Scooter",
      price: "₹ 68,000",
      isNew: false,
    },
  ];

  const comingSoonBikes: BikeData[] = [
    { id: 4, name: "Honda CBR300R", category: "Sport", price: "₹ 2,50,000" },
    {
      id: 5,
      name: "Honda Africa Twin",
      category: "Adventure",
      price: "₹ 15,00,000",
    },
    {
      id: 6,
      name: "Honda Rebel 300",
      category: "Cruiser",
      price: "₹ 3,50,000",
    },
    {
      id: 7,
      name: "Honda Gold Wing",
      category: "Touring",
      price: "₹ 35,00,000",
    },
    {
      id: 8,
      name: "Honda CBR650R",
      category: "Sport",
      price: "₹ 8,50,000",
    },
  ];

  const renderBikeSection = (bikes: BikeData[], showSlider = false) => (
    <>
      <div className='space-y-6'>
        {/* Horizontal scroll container - Fixed width, no responsive behavior */}
        <div className='overflow-hidden'>
          <div
            className='flex transition-transform duration-300 ease-in-out gap-6'
            style={{
              transform: `translateX(-${currentSlide * (300 + 24)}px)`,
              width: `${bikes.length * (300 + 24)}px`,
            }}
          >
            {bikes.map((bike) => (
              <div key={bike.id} className='w-[300px] flex-shrink-0'>
                <BikeCard bike={bike} isNew={bike.isNew} />
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Slider Control */}
        {showSlider && (
          <div className='flex justify-center mt-8'>
            <div
              className='relative w-64 h-2 bg-gray-200 rounded-full cursor-pointer'
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newSlide = Math.round(percentage * (bikes.length - 1));
                setCurrentSlide(
                  Math.max(0, Math.min(newSlide, bikes.length - 1))
                );
              }}
            >
              {/* Slider track */}
              <div className='absolute inset-0 bg-gray-200 rounded-full' />

              {/* Slider fill */}
              <div
                className='absolute left-0 top-0 h-full bg-red-600 rounded-full transition-all duration-300'
                style={{
                  width: `${
                    (currentSlide / Math.max(bikes.length - 1, 1)) * 100
                  }%`,
                }}
              />

              {/* Slider handle */}
              <div
                className='absolute top-1/2 w-6 h-6 bg-red-600 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform'
                style={{
                  left: `${
                    (currentSlide / Math.max(bikes.length - 1, 1)) * 100
                  }%`,
                }}
              />

              {/* Slider markers */}
              {bikes.map((_, index) => (
                <div
                  key={index}
                  className='absolute top-1/2 w-1 h-1 bg-gray-400 rounded-full transform -translate-y-1/2 -translate-x-1/2'
                  style={{
                    left: `${(index / Math.max(bikes.length - 1, 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
        <Link to='/view-all'>
          <Button
            size='lg'
            className='w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl'
          >
            Explore All Models
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <section className='py-10 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Tabs component */}
          <Tabs defaultValue='latest' className='w-full'>
            <div className='flex items-start mb-8'>
              <TabsList className='grid w-full max-w-md grid-cols-2 h-12 p-1 bg-gray-100 rounded-xl'>
                <TabsTrigger
                  value='latest'
                  className='text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all'
                  onClick={() => setCurrentSlide(0)}
                >
                  Latest Models
                </TabsTrigger>
                <TabsTrigger
                  value='coming-soon'
                  className='text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm transition-all'
                  onClick={() => setCurrentSlide(0)}
                >
                  Coming Soon
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Latest Models Tab Content */}
            <TabsContent value='latest' className='space-y-6'>
              {renderBikeSection(latestBikes, true)}
            </TabsContent>

            {/* Coming Soon Tab Content */}
            <TabsContent value='coming-soon' className='space-y-6'>
              {renderBikeSection(comingSoonBikes, true)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
