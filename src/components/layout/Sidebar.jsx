import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FiLogOut, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../core/contexts/AuthContext";

const Sidebar = ({ role, links, mobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile view */}
      {mobileOpen && (
        <div
          className="inset-0  bg-opacity-40 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 lg:static top-0 left-0 h-full transition-all duration-300 bg-gray-800 text-white flex flex-col justify-between",
          collapsed ? "w-20" : "w-55",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="mt-14 p-4">

          {/* Collapse Button */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="px-2 py-2 mr-2 bg-button rounded-4xl text-white hover:text-white"
            >
              {collapsed ? <FiArrowRight size={20} /> : <FiArrowLeft size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-2">
            {links.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={onCloseMobile} // Close on mobile link click
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-400 transition-all",
                    location.pathname === to
                      ? "bg-green-100 font-body text-green-700"
                      : "text-white",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-4"> 
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center px-3 py-2 text-red-500 rounded-lg hover:bg-red-100 transition-all",
              collapsed && "justify-center"
            )}
          >
            <FiLogOut size={20} className={collapsed ? "" : "mr-2"} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;