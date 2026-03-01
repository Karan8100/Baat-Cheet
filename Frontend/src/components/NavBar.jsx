import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { Image } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 shadow-sm"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          
          {/* LEFT: LOGO SECTION */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 transition-all active:scale-95 group">
              <img 
                src="/logo.png" 
                alt="Baat-Cheet Logo" 
                className="h-15 w-auto group-hover:drop-shadow-md transition-all"
              />
            </Link>
          </div>

          {/* RIGHT: ACTIONS SECTION */}
          <div className="flex items-center gap-2">
            
            {/* Settings Button */}
            <Link
              to={"/settings"}
              className={`
                btn btn-ghost btn-sm gap-2 font-semibold
                ${isActive("/settings") ? "bg-primary/10 text-primary" : "text-base-content/70"}
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                {/* Profile Button */}
                <Link 
                  to={"/profile"} 
                  className={`
                    btn btn-ghost btn-sm gap-2 font-semibold
                    ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-base-content/70"}
                  `}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-base-300 mx-1 hidden sm:block" />

                {/* Logout Button */}
                <button 
                  className="btn btn-sm btn-ghost text-error hover:bg-error/10 gap-2 font-bold" 
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;