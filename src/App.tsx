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

import LoginBranchManager from "./mainComponents/Admin/LoginUser";
import LoginSuperAdmin from "./mainComponents/Admin/LoginSuperAdmin";
import AdminDashboard from "./mainComponents/Admin/AdminDashboard";
import AddBikes from "./mainComponents/Admin/Bikes/AddBikes";
import EditBikes from "./mainComponents/Admin/Bikes/EditBikes";
import AddScooty from "./mainComponents/Admin/Scooty/AddScooty";
import EditScooty from "./mainComponents/Admin/Scooty/EditScooty";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/book-service' element={<BookServicePage />} />

        {/* Admin Routes */}
        <Route path='/admin/superlogin' element={<LoginSuperAdmin />} />
        <Route path='/admin/managerlogin' element={<LoginBranchManager />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        {/* Add && Edit Bikes, scooty  */}
        <Route path='/admin/addbikes' element={<AddBikes />} />
        <Route path='/admin/addbikes/edit/:id' element={<EditBikes />} />
        <Route path='/admin/addbikes' element={<AddScooty />} />
        <Route path='/admin/addbikes/edit/:id' element={<EditScooty />} />

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
