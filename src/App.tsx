import "./App.css";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React from "react";

import TestRidePage from "./mainComponents/TestRideService/TestRidePage";
import BranchesPage from "./mainComponents/Branches/BranchesPage";
import BranchDetailPage from "./mainComponents/Branches/BranchDetailPage";
import { ViewAllBikes } from "./mainComponents/BikeDetails/ViewAllBikes";
import BikeDetailsPage from "./mainComponents/BikeDetails/BikeDetailsPage";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/book-service' element={<BookServicePage />} />
        <Route path='/test-drive' element={<TestRidePage />} />
        {/* Branches  */}
        <Route path='/branches' element={<BranchesPage />} />
        <Route path='/branches/:id' element={<BranchDetailPage />} />
        {/* View Bikes  */}
        <Route path='/view-all' element={<ViewAllBikes />} />
        <Route path='/bikes/:bikeId' element={<BikeDetailsPage />} />
        <Route path='*' element={<div>Page not found</div>} />
      </Routes>
    </>
  );
};

export default App;
