import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { allBikes, Bike } from "../../mockdata/data";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { formatCurrency } from "@/lib/formatters";
import { EmiCalculator } from "../EmiCalculator";

const BikeDetailsPage = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the bike from the data
    const foundBike = allBikes.find((b) => b.id === bikeId);

    // Simulate API loading
    setTimeout(() => {
      setBike(foundBike || null);
      setLoading(false);
    }, 500);
  }, [bikeId]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-4 border-red-600 rounded-full border-t-transparent'></div>
      </div>
    );
  }

  if (!bike) {
    return (
      <main className='min-h-screen flex flex-col'>
        <Header />
        <div className='container py-20 px-4 flex-grow'>
          <div className='mb-6'>
            <Link to='/view-all'>
              <Button
                variant='ghost'
                className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
              >
                <ChevronLeft className='h-4 w-4 mr-1' />
                Back to All Bikes
              </Button>
            </Link>
          </div>

          <div className='text-center'>
            <h1 className='text-3xl font-bold mb-4'>Motorcycle Not Found</h1>
            <p className='text-muted-foreground mb-6'>
              The motorcycle you're looking for doesn't exist or has been
              removed.
            </p>
            <Link to='/view-all'>
              <Button className='bg-red-600 hover:bg-red-700'>
                Browse All Motorcycles
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container py-10 px-4 flex-grow'>
        <div className='mb-6'>
          <Link to='/view-all'>
            <Button
              variant='ghost'
              className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Back to All Bikes
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          {/* Bike Image */}
          <div className='relative'>
            {bike.isNew && (
              <div className='absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md z-10'>
                New
              </div>
            )}
            <img
              src={bike.image}
              alt={bike.name}
              className='w-full h-auto rounded-lg shadow-md'
            />
          </div>

          {/* Bike Details */}
          <div>
            <h1 className='text-3xl font-bold mb-2'>{bike.name}</h1>
            <div className='text-2xl text-red-600 font-semibold mb-4'>
              {formatCurrency(bike.price)}
            </div>
            <p className='text-lg capitalize mb-6'>
              {bike.category} Motorcycle
            </p>

            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='text-sm text-muted-foreground'>Engine Size</div>
                <div className='text-xl font-semibold'>
                  {bike.engineSize} cc
                </div>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='text-sm text-muted-foreground'>Power</div>
                <div className='text-xl font-semibold'>{bike.power} HP</div>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='text-sm text-muted-foreground'>Weight</div>
                <div className='text-xl font-semibold'>{bike.weight} kg</div>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <div className='text-sm text-muted-foreground'>Year</div>
                <div className='text-xl font-semibold'>{bike.year}</div>
              </div>
            </div>

            <div className='mb-6'>
              <h3 className='text-lg font-semibold mb-2'>Key Features</h3>
              <ul className='list-disc pl-5 space-y-1'>
                {bike.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className='flex flex-col sm:flex-row gap-4'>
              <Button className='bg-red-600 hover:bg-red-700'>
                Book a Test Ride
              </Button>
              <Button variant='outline'>Download Brochure</Button>
            </div>
          </div>
        </div>

        {/* EMI Calculator */}
        <EmiCalculator selectedBikePrice={bike.price} />
      </div>

      <Footer />
    </main>
  );
};

export default BikeDetailsPage;
