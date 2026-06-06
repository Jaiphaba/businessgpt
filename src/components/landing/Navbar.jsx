import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          PlanForge AI
        </h1>

        <div className="hidden md:flex gap-6">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
        </div>

        <Link
          to="/login"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg"
        >
          Sign In
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;