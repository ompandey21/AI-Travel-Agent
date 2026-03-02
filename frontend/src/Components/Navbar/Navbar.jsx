import { useNavigate } from "react-router-dom";

const Navbar = () => (
  <div className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-14 py-4 md:py-6 text-white z-50">
    <h1 className="font-semibold tracking-wide text-lg">Iternation</h1>

    <div className="hidden md:flex gap-12 text-sm opacity-80">
      <a href="#">Home</a>
      <a href="#">Explore</a>
      <a href="#">Destinations</a>
      <a href="#">Contact</a>
    </div>

    <div className="w-8 h-8 rounded-full border border-white/40" />
  </div>
);

export default Navbar;