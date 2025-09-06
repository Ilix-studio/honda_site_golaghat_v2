import React from "react";
import { Footer } from "../Home/Footer";

import { BookServiceForm } from "./BookServiceForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "../Home/Header/Header";

export const BookService: React.FC = () => {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <div className='container py-10 px-4 flex-grow'>
        <div className='mb-6'>
          <Link to='/'>
            <Button
              variant='ghost'
              className='pl-0 flex items-center text-muted-foreground hover:text-foreground'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Back to Home
            </Button>
          </Link>
        </div>

        <BookServiceForm />
      </div>

      <Footer />
    </main>
  );
};

export default BookService;
