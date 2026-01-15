import "./App.css";
import { Routes, Route } from "react-router-dom";
import Summary from "./components/Summary";
import Settings from "./components/Settings";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Summary />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
