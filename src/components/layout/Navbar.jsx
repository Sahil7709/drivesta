import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FiMapPin, FiEdit2, FiGrid, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import drivesta from "../../assets/logos/drivesta.png";
import { useAuth } from "../../context/AuthContext";

const locations = [
  "Aundh",
  "Baner",
  "Balewadi",
  "Bavdhan",
  "Bibwewadi",
  "Boat Club Road",
  "Camp",
  "Chinchwad",
  "Dhanori",
  "Dhankawadi",
  "Erandwane",
  "Fatima Nagar",
  "Hadapsar",
  "Hinjewadi",
  "Kalyani Nagar",
  "Karve Nagar",
  "Kharadi",
  "Kondhwa",
  "Koregaon Park",
  "Kothrud",
  "Lohegaon",
  "Magarpatta",
  "Moshi",
  "Mundhwa",
  "NIBM Road",
  "Nigdi",
  "Pashan",
  "Paud Road",
  "Pimple Gurav",
  "Pimple Nilakh",
  "Pimple Saudagar",
  "Sadashiv Peth",
  "Salunke Vihar",
  "Satara Road",
  "Shivajinagar",
  "Sinhagad Road",
  "Sus Road",
  "Swargate",
  "Tingre Nagar",
  "Viman Nagar",
  "Wadgaon Sheri",
  "Wakad",
  "Warje",
  "Yerawada",
];

export default function Navbar() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with local storage only on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      login(JSON.parse(storedUser)); // Only login if user is not set
    }
  }, []); // Empty dependency array to run only on mount

  // Update editableUser when user changes, but only initially
  useEffect(() => {
    if (user && !editableUser) {
      setEditableUser({ ...user }); // Set only if editableUser is null
    }
  }, [user]); // Depend only on user

  const [selectedCity, setSelectedCity] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = locations.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  // Animation variants (unchanged)
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 500, mass: 0.5 },
    },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
  };

  const cityItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.03, type: "spring", stiffness: 300, damping: 10 },
    }),
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    },
    tap: { scale: 0.98 },
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500 } },
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setIsEditing(false);
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (editableUser && JSON.stringify(editableUser) !== JSON.stringify(user)) {
      localStorage.setItem("user", JSON.stringify(editableUser));
      window.dispatchEvent(new Event("userChanged"));
      login(editableUser); // Update context only if changed
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoToDashboard = () => {
    if (!user) return;
    const currentPath = location.pathname;

    if (user.role === "admin" && currentPath.startsWith("/admin")) return;
    if (user.role === "superadmin" && currentPath.startsWith("/superadmin")) return;
    if (user.role === "engineer" && currentPath.startsWith("/engineer")) return;
    if (!user.role && currentPath === "/dashboard") return;

    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "superadmin") navigate("/superadmin/dashboard");
    else if (user.role === "engineer") navigate("/engineer/dashboard");
    else navigate("/customer/dashboard");

    setShowProfile(false);
  };

  const shouldShowDashboardButton = () => {
    if (!user) return false;
    const currentPath = location.pathname;
    return !(
      (user.role === "admin" && currentPath.startsWith("/admin")) ||
      (user.role === "superadmin" && currentPath.startsWith("/superadmin")) ||
      (user.role === "engineer" && currentPath.startsWith("/engineer")) ||
      (!user.role && currentPath === "/dashboard")
    );
  };

  return (
    <header className="w-full z-50 bg-[#F1FFE0] py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center sm:justify-start">
          <img
            src={drivesta}
            alt="Drivesta Logo"
            className="h-10 sm:h-16 md:h-12 object-contain max-h-[80px]"
          />
        </Link>

        {/* Welcome message for dashboards only */}
        {user && location.pathname.includes("dashboard") && (
          <div className="text-green-700 font-semibold text-base sm:text-lg">
            Welcome, {user.name?.split(" ")[0] || "User"} 👋
          </div>
        )}

        <div className="flex items-center flex-wrap justify-center sm:justify-end gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-white hover:text-green-700 border border-green-600 rounded-xl transition"
          >
            {selectedCity || "Choose Your City"}
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="ml-1 transition-transform">
              ▼
            </motion.span>
            {selectedCity && (
              <motion.span
                className="absolute inset-0 bg-green-600 opacity-0 hover:opacity-20 transition-opacity"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
              />
            )}
          </motion.button>
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-white hover:text-green-700 border border-green-600 rounded-xl transition"
            >
              <FiUser className="text-lg" />
              <span>Login / Signup</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="w-10 h-10 rounded-full bg-green-600 text-white font-bold flex items-center justify-center hover:bg-green-500 transition"
                aria-label="User Profile"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-4 w-64 bg-white border border-[#D9E8C5] rounded-lg shadow-lg p-4 z-50">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[#5A7F3A] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editableUser?.name || ""}
                          onChange={handleInputChange}
                          name="name"
                          className="w-full px-3 py-2 border border-[#D9E8C5] rounded-md text-sm focus:ring-1 focus:ring-[#5A7F3A] focus:border-[#5A7F3A] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A7F3A] mb-1">Email</label>
                        <input
                          type="email"
                          value={editableUser?.email || ""}
                          disabled
                          className="w-full px-3 py-2 border border-[#D9E8C5] rounded-md text-sm bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 text-sm bg-[#E0F0D1] text-[#3A4A2D] hover:bg-[#D0E0C1] rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-3 py-1.5 text-sm bg-[#5A7F3A] hover:bg-[#4A6F2A] text-white rounded-md transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center mb-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#5A7F3A] text-white flex items-center justify-center text-2xl mb-2">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-[#3A4A2D]">{user?.name}</div>
                        <div className="text-sm text-[#5A7F3A]">{user?.email}</div>
                      </div>
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#3A4A2D] hover:bg-[#F1FFE0] rounded-md transition-colors"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        Edit Profile
                      </button>
                      {shouldShowDashboardButton() && (
                        <Link to={`/${user.role || "customer"}/dashboard`}>
                          <button
                            onClick={handleGoToDashboard}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#3A4A2D] hover:bg-[#F1FFE0] rounded-md transition-colors"
                          >
                            <FiGrid className="h-4 w-4" />
                            Go to Dashboard
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <FiLogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-green-100/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                ref={dropdownRef}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-[#f7fce8] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-green-300 relative"
              >
                <motion.div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-green-200/30" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
                <motion.div className="absolute -bottom-5 -right-5 w-16 h-16 rounded-full bg-green-300/20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />

                <div className="overflow-y-auto max-h-[78vh] p-5 relative z-10 scrollbar-hide">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h2 className="text-2xl font-bold mb-3 text-green-800 flex items-center">
                      <FiMapPin className="mr-2" />
                      Select Your Location
                    </h2>
                    <p className="text-sm text-green-600 mb-4">Choose your city to find services near you</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Search your city..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full p-3 pl-10 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90 shadow-sm"
                    />
                    <motion.div
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500"
                      animate={{ x: search ? [-2, 2, -2] : [0] }}
                      transition={{ repeat: search ? Infinity : 0, duration: 0.5 }}
                    >
                      <FiMapPin />
                    </motion.div>
                  </motion.div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {filteredLocations.map((city, index) => (
                        <motion.div
                          key={city}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.8 }}
                          variants={cityItemVariants}
                          whileHover="hover"
                          whileTap="tap"
                          role="button"
                          tabIndex={0}
                          onClick={() => { setSelectedCity(city); setOpen(false); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelectedCity(city); setOpen(false); } }}
                          className={`relative flex flex-col items-center border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                            selectedCity === city ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg" : "hover:shadow-md bg-white border-green-200"
                          }`}
                        >
                          <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${selectedCity === city ? "bg-white/20" : "bg-green-100"}`}>
                            <FiMapPin className={`w-5 h-5 transition-colors ${selectedCity === city ? "text-white" : "text-green-600"}`} />
                          </motion.div>
                          <span className={`text-sm font-medium text-center transition-colors ${selectedCity === city ? "text-white font-semibold" : "text-gray-800"}`}>{city}</span>
                          {selectedCity === city && (
                            <motion.div className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm" variants={checkmarkVariants}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredLocations.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 text-gray-500">
                      <div className="text-4xl mb-3">🏙️</div>
                      No cities found matching "{search}"
                      <motion.button onClick={() => setSearch("")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        Clear Search
                      </motion.button>
                    </motion.div>
                  )}
                </div>

                <motion.div className="border-t border-green-200 p-3 bg-white/80 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <motion.button onClick={() => setOpen(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    Close
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}