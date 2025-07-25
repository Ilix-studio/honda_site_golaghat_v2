import "./App.css";
import Home from "./Home";
import { Routes, Route, useLocation } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React, { useEffect } from "react";

import BranchesPage from "./mainComponents/Branches/BranchesPage";
import BranchDetailPage from "./mainComponents/Branches/BranchDetailPage";
import { ViewAllBikes } from "./mainComponents/BikeDetails/ViewAllBikes";
import BikeDetailsPage from "./mainComponents/BikeDetails/BikeDetailsPage";
import NotFoundPage from "./mainComponents/NotFoundPage";

import LoginBranchManager from "./mainComponents/Admin/LoginBranchManager";
import LoginSuperAdmin from "./mainComponents/Admin/LoginSuperAdmin";
import AdminDashboard from "./mainComponents/Admin/AdminDashboard";
import AddBikes from "./mainComponents/Admin/Bikes/AddBikes";
import EditBikes from "./mainComponents/Admin/Bikes/EditBikes";

import EditScooty from "./mainComponents/Admin/Scooty/EditScooty";
import Finance from "./mainComponents/Finance";
import Contact from "./mainComponents/Contact";
import SearchResults from "./mainComponents/Search/SearchResults";
import NotificationSystem from "./mainComponents/Admin/NotificationSystem";
import AddScooty from "./mainComponents/Admin/Scooty/AddScooty";
import AddBranch from "./mainComponents/Branches/AddBranch";
import BranchManager from "./mainComponents/Branches/BranchManager";
import CompareBike from "./mainComponents/BikeDetails/CompareBikes/CompareBike";
// import TestBike from "./mainComponents/TestBike";

// Import Notification System

const App: React.FC = () => {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/finance' element={<Finance />} />
        <Route path='/contact' element={<Contact />} />

        <Route path='/book-service' element={<BookServicePage />} />
        <Route path='/search' element={<SearchResults />} />

        {/* Admin Routes */}
        <Route path='/admin/superlogin' element={<LoginSuperAdmin />} />
        <Route path='/admin/managerlogin' element={<LoginBranchManager />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />

        {/* Add && Edit Bikes, scooty  */}
        <Route path='/admin/addbikes' element={<AddBikes />} />
        <Route path='/admin/addbikes/edit/:id' element={<EditBikes />} />
        <Route path='/admin/addScooty' element={<AddScooty />} />
        <Route path='/admin/addScooty/edit/:bikeId' element={<EditScooty />} />

        {/* Branch Management Routes */}
        <Route path='/admin/addbranch' element={<AddBranch />} />
        <Route path='/admin/managers' element={<BranchManager />} />

        {/* Branches  */}
        <Route path='/branches' element={<BranchesPage />} />
        <Route path='/branches/:id' element={<BranchDetailPage />} />

        {/* View Bikes  */}
        <Route path='/view-all' element={<ViewAllBikes />} />
        <Route path='/bikes/:bikeId' element={<BikeDetailsPage />} />

        {/* <Route path='/test' element={<TestBike />} /> */}

        {/* Compare Bike  */}
        <Route path='/compare' element={<CompareBike />} />
        {/* Not Found  */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      {/* Global Notification System */}
      <NotificationSystem />
    </>
  );
};

export default App;
