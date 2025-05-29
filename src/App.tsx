import "./App.css";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React from "react";

import BranchesPage from "./mainComponents/Branches/BranchesPage";
import BranchDetailPage from "./mainComponents/Branches/BranchDetailPage";
import { ViewAllBikes } from "./mainComponents/BikeDetails/ViewAllBikes";
import BikeDetailsPage from "./mainComponents/BikeDetails/BikeDetailsPage";
import NotFoundPage from "./mainComponents/NotFoundPage";
import CompareBike from "./mainComponents/BikeDetails/CompareBikes/CompareBike";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/book-service' element={<BookServicePage />} />

        {/* Admin Routes */}
        {/* <Route path='/admin/login' element={<LoginUser />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/blog/new' element={<AddBlogPost />} />
        <Route path='/admin/blog/edit/:id' element={<AddBlogPost />} /> */}

        {/* Branches  */}
        <Route path='/branches' element={<BranchesPage />} />
        <Route path='/branches/:id' element={<BranchDetailPage />} />

        {/* View Bikes  */}
        <Route path='/view-all' element={<ViewAllBikes />} />
        <Route path='/bikes/:bikeId' element={<BikeDetailsPage />} />

        {/* Compare Bike  */}
        <Route path='/compare' element={<CompareBike />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
