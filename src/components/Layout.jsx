import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-2xl font-bold">Admin Panel</div>
        <nav className="mt-4">
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700">Dashboard</Link>
          {/* Add other links here later */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
