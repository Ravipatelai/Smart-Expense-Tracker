import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/groups", label: "Groups" },
    { to: "/budget-page", label: "Budget" },
    { to: "/profile", label: "Profile" },
  ];

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
      {/* Royal Blue gradient accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-blue-400 to-primary" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
          Smart Expense Tracker
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
                ? "bg-[#47b1e294] text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-warning" />
            ) : (
              <Moon size={18} />
            )}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-warning" />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-scale-in">
          <div className="px-4 py-2 space-y-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
