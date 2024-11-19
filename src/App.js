import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import TruckDetails from "./TruckDetails";
import "./App.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/truck/:id" element={<TruckDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
