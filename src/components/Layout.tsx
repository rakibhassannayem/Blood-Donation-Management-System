import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showNav?: boolean;
  navItems?: {
    label: string;
    icon: React.ReactNode;
    to: string;
  }[];
}

export default function Layout({
  children,
  title,
  showNav = true,
  navItems = [],
}: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && (
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <Droplet className="h-8 w-8 text-red-600 mr-2" />
                  <h1 className="text-xl font-bold text-red-600">{title}</h1>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Blood Donation Platform. All rights
              reserved.
            </p>
            <p className="mt-2">
              Connecting donors with those in need, one donation at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
