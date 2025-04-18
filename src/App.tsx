import "./App.css";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        {/* <Route path="/view-all" element={<ViewAll />} /> */}
        {/* <Route path='/book-service' element={<BookService />} /> */}

        <Route path='*' element={<div>Page not found</div>} />
      </Routes>
    </>
  );
};

export default App;
