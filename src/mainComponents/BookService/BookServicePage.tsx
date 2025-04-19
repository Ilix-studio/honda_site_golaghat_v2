import React from "react";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { BookServiceForm } from "./BookServiceForm";

const BookServicePage: React.FC = () => {
  return (
    <main className='min-h-screen'>
      <Header />
      <div className='pt-24 pb-20 bg-gray-50'>
        <div className='container px-4 md:px-6'>
          <BookServiceForm />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default BookServicePage;
