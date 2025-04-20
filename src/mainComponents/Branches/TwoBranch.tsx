import { JSX, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star } from "lucide-react";

// Define Types
export interface StaffMember {
  name: string;
  position: string;
}

export interface HoursType {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface InventoryType {
  sport: number;
  adventure: number;
  cruiser: number;
  touring: number;
  naked: number;
}

export interface BranchType {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: HoursType;
  staff: StaffMember[];
  rating: number;
  reviews: number;
  image: string;
  mapUrl: string;
  featured: boolean;
  inventory: InventoryType;
}

interface BranchesProps {
  defaultBranch?: string;
}

// Branch data
export const branches: BranchType[] = [
  {
    id: "golaghat",
    name: "Honda Motorcycles Golaghat",
    address: "Golaghat Town",
    phone: "883920-2092122",
    email: "Tsangpool@hondamotorcycles.example",
    hours: {
      weekdays: "9:00 AM - 7:00 PM",
      saturday: "10:00 AM - 5:00 PM",
      sunday: "Closed",
    },
    staff: [
      { name: "Ilix", position: "Branch Manager" },
      { name: "Jyotish", position: "Sales Manager" },
      { name: "Hazarika", position: "Service Manager" },
    ],
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=400&width=600",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14281.708160586099!2d93.95457205941675!3d26.50638691585567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37468fc4ad54202d%3A0x88e76c0b31c949f!2sTsangpool%20Honda!5e0!3m2!1sen!2sin!4v1745182747233!5m2!1sen!2sin",
    featured: true,
    inventory: {
      sport: 15,
      adventure: 12,
      cruiser: 10,
      touring: 8,
      naked: 9,
    },
  },
  {
    id: "sarupathar",
    name: "Honda Motorcycles Sarupathar",
    address: "Sarupathar",
    phone: "8181881818",
    email: "sarupathar@hondamotorcycles.example",
    hours: {
      weekdays: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 5:00 PM",
      sunday: "11:00 AM - 4:00 PM",
    },
    staff: [
      { name: "Ilix", position: "Branch Manager" },
      { name: "Jyotish", position: "Sales Manager" },
      { name: "Hazarika", position: "Service Manager" },
    ],
    rating: 4.7,
    reviews: 98,
    image: "/placeholder.svg?height=400&width=600",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14281.708160586099!2d93.95457205941675!3d26.50638691585567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37468fc4ad54202d%3A0x88e76c0b31c949f!2sTsangpool%20Honda!5e0!3m2!1sen!2sin!4v1745182747233!5m2!1sen!2sin",
    featured: true,
    inventory: {
      sport: 12,
      adventure: 15,
      cruiser: 8,
      touring: 6,
      naked: 10,
    },
  },
];

export function Branches({ defaultBranch }: BranchesProps): JSX.Element {
  const [selectedBranch, setSelectedBranch] = useState<string>(
    defaultBranch || branches[0].id
  );
  const branch = branches.find((b) => b.id === selectedBranch) || branches[0];

  return (
    <section className='py-16 bg-gray-50'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className='text-3xl font-bold tracking-tight'>Our Branches</h2>
          <p className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'>
            Visit one of our Honda Motorcycle dealerships for expert advice,
            test rides, and exceptional service
          </p>
        </motion.div>

        <div className='w-full'>
          <div className='grid grid-cols-2 md:grid-cols-2 mb-8 border rounded-lg overflow-hidden'>
            {branches.map((branch) => (
              <button
                key={branch.id}
                className={`relative py-3 px-4 font-medium transition-colors ${
                  selectedBranch === branch.id
                    ? "bg-red-600 text-white"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => setSelectedBranch(branch.id)}
              >
                {branch.name.split(" ").pop()}
              </button>
            ))}
          </div>

          {/* Branch details would be displayed here */}
          {/* This is a simplified version, the full component would include all branch information */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>{branch.name}</CardTitle>
                <CardDescription>
                  <div className='flex items-center gap-1 mt-1'>
                    <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
                    <span className='font-medium'>{branch.rating}</span>
                    <span className='text-muted-foreground'>
                      ({branch.reviews} reviews)
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>{/* Branch content goes here */}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
