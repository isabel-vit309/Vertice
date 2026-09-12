import { BrowserRouter, NavLink } from "react-router-dom";
import { FiBriefcase, FiShield, FiTrendingUp } from "react-icons/fi";
import AppRoutes from "./Routes";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
