import "./App.css";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React from "react";

import TestRidePage from "./mainComponents/TestRideService/TestRidePage";
import BranchesPage from "./mainComponents/Branches/BranchesPage";
import BranchDetailPage from "./mainComponents/Branches/BranchDetailPage";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path="/view-all" element={<ViewAll />} /> */}
        <Route path='/book-service' element={<BookServicePage />} />
        <Route path='/test-drive' element={<TestRidePage />} />
        <Route path='/branches' element={<BranchesPage />} />
        <Route path='/branches/:id' element={<BranchDetailPage />} />
        <Route path='*' element={<div>Page not found</div>} />
      </Routes>
    </>
  );
};

export default App;
