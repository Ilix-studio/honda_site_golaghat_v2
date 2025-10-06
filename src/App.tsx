import "./App.css";
import { Toaster } from "react-hot-toast";
import Home from "./Home";
import { Routes, Route, useLocation } from "react-router-dom";
import BookServicePage from "./mainComponents/BookService/BookServicePage";
import React, { useEffect } from "react";

import BranchesPage from "./mainComponents/NavMenu/Branches/BranchesPage";
import BranchDetailPage from "./mainComponents/NavMenu/Branches/BranchDetailPage";
import { ViewAllBikes } from "./mainComponents/BikeDetails/ViewAllBikes";
import BikeDetailsPage from "./mainComponents/BikeDetails/BikeDetailsPage";
import NotFoundPage from "./mainComponents/NotFoundPage";

import LoginBranchManager from "./mainComponents/Admin/LoginBranchManager";
import LoginSuperAdmin from "./mainComponents/Admin/LoginSuperAdmin";
import AdminDashboard from "./mainComponents/Admin/AdminDash/AdminDashboard";
import AddBikes from "./mainComponents/Admin/Bikes/AddBikes";
import EditBikes from "./mainComponents/Admin/Bikes/EditBikes";

import Finance from "./mainComponents/NavMenu/Finance";
import Contact from "./mainComponents/NavMenu/Contact";
import SearchResults from "./mainComponents/Search/SearchResults";
import NotificationSystem from "./mainComponents/Admin/NotificationSystem";

import AddBranch from "./mainComponents/NavMenu/Branches/AddBranch";
import BranchManager from "./mainComponents/Admin/BranchM/BranchManager";
import CompareBike from "./mainComponents/BikeDetails/CompareBikes/CompareBike";
// import CustomerLogin from "./mainComponents/CustomerSystem/CustomerLogin";
import CustomerSignUp from "./mainComponents/CustomerSystem/CustomerSignUp";
import CustomerDash from "./mainComponents/CustomerSystem/Dashboards/CustomerMainDash";
import CustomerCreateProfile from "./mainComponents/CustomerSystem/CustomerCreateProfile";
// import CustomerVehicleInfo from "./mainComponents/CustomerSystem/MotorInfo/CustomerVehicleInfo";
import InitialDashboard from "./mainComponents/CustomerSystem/Dashboards/InitialDashboard";

import AddBikeImage from "./mainComponents/Admin/Bikes/AddBikeImage";
import EditBikeImage from "./mainComponents/Admin/Bikes/EditBikeImage";
import { ViewBikeImage } from "./mainComponents/Admin/Bikes/ViewBikeImage";
import ScooterDetailPage from "./mainComponents/BikeDetails/ScooterDetailPage";
import VASForm from "./mainComponents/BikeSystem2/VASForm";
import ServiceAddonsForm from "./mainComponents/BikeSystem2/ServiceAddonsForm";
import CustomerVehicleInfo from "./mainComponents/BikeSystem2/CustomerVehicleInfo";
import StockConceptForm from "./mainComponents/BikeSystem2/StockConceptForm";
import SafetyFeature from "./mainComponents/SafetyFeature/SaftetyFeature";
// import DynamicLogin from "./mainComponents/DynamicLoginSystem/DynamicLogin";

// import TestBike from "./mainComponents/TestBike";

// Import Notification System

const App: React.FC = () => {
  const location = useLocation();
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
        <Route path='/admin/dashboard' element={<AdminDashboard />} />

        {/* Branch Manager Routes */}
        <Route path='/admin/managerlogin' element={<LoginBranchManager />} />
        <Route path='/admin/addbranch' element={<AddBranch />} />
        <Route path='/admin/managers' element={<BranchManager />} />

        {/* Add && Edit Bikes, scooty  */}
        <Route path='/admin/addbikes' element={<AddBikes />} />
        <Route
          path='/admin/addbikes/:bikeId/images'
          element={<AddBikeImage />}
        />
        <Route path='/admin/addbikes/edit/:id' element={<EditBikes />} />
        <Route
          path='/admin/bikes/:bikeId/images/edit'
          element={<EditBikeImage />}
        />
        <Route path='/admin/bikeimages/:id' element={<ViewBikeImage />} />

        {/* Compare Bike  */}
        <Route path='/compare' element={<CompareBike />} />

        {/* Branches  */}
        <Route path='/branches' element={<BranchesPage />} />
        <Route path='/branches/:id' element={<BranchDetailPage />} />

        {/* View Bikes  */}
        <Route path='/view-all' element={<ViewAllBikes />} />
        <Route path='/bikes/:bikeId' element={<BikeDetailsPage />} />
        <Route path='/scooters/:bikeId' element={<ScooterDetailPage />} />

        {/* Customer Login  */}
        <Route path='/admin/customer-sign-up' element={<CustomerSignUp />} />
        <Route path='/customer-initialize' element={<InitialDashboard />} />
        <Route path='/customer-profile' element={<CustomerCreateProfile />} />
        <Route path='/customer-dash' element={<CustomerDash />} />
        <Route
          path='/customer-vehicle-info'
          element={<CustomerVehicleInfo />}
        />

        {/* <Route path='/dynamic-login' element={<DynamicLogin />} /> */}
        <Route path='/admin/VAS-form' element={<VASForm />} />
        <Route path='/admin/service-Addons' element={<ServiceAddonsForm />} />
        <Route path='/admin/stock-concept' element={<StockConceptForm />} />
        <Route path='/admin/safety-feature' element={<SafetyFeature />} />

        {/* Not Found  */}
        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      {/* Global Notification System */}
      <NotificationSystem />
      <Toaster />
    </>
  );
};

export default App;
