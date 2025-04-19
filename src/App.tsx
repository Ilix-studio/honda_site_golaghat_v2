import "./App.css";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React from "react";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path="/view-all" element={<ViewAll />} /> */}
        <Route path='/book-service' element={<BookServicePage />} />

        <Route path='*' element={<div>Page not found</div>} />
      </Routes>
    </>
  );
};

export default App;
