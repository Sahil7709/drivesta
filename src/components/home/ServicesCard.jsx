import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import service1 from "../../assets/service1.jpg";
import service2 from "../../assets/service2.jpg";
import { useAuth } from "../../core/contexts/AuthContext";

export default function ServicesCard() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // --- Booking logic ---
  const handleBookPDI = (type) => {
    if (!isLoggedIn || !user) {
      toast.info("Please login to book your PDI.");
      navigate("/login");
    } else {
      const adminRoles = ["admin", "superadmin"];
      if (adminRoles.includes(user.role)) {
        navigate(`/request?isAdm=true&type=${type}`);
      } else if (user.role === "engineer") {
        toast.error("You are not allowed to create a new request.");
      } else {
        navigate(`/request?type=${type}`);
      }
    }
  };

  // --- Checklist Data ---
  const newCarChecklist = [
    "Exterior - Body condition, paint quality, dents/scratches, glass, lights.",
    "Tyres & Wheels - Tread depth, manufacturing date, spare tyre.",
    "Engine - Fluid levels (oil, coolant, brake, windshield), battery.",
    "Interior - Seats, dashboard, infotainment, controls, AC/heater.",
    "Electricals - Headlights, indicators, wipers, horn, power windows.",
    "Odometer & Warning Lights - Reading accuracy, no error codes.",
    "OBD Scanning",
  ];

  const usedCarChecklist = [
    "Exterior - Body condition, paint quality, dents/scratches, glass, lights.",
    "Tyres & Wheels - Tread depth, manufacturing date, spare tyre.",
    "Engine - Fluid levels (oil, coolant, brake, windshield), battery.",
    "Interior - Seats, dashboard, infotainment, controls, AC/heater.",
    "Electricals - Headlights, indicators, wipers, horn, power windows.",
    "Odometer & Warning Lights - Reading accuracy, no error codes.",
    "OBD Scanning",
    "Brakes & Suspension - Smooth braking, no unusual noise.",
    "Test Drive - Steering, clutch, gearshift, acceleration.",
  ];

  // --- Reusable Section Renderer ---
  const renderChecklist = (items, bgImage, title, buttonText, type) => (
    <section
      className="relative bg-fixed bg-cover bg-center py-20 px-4 md:px-16"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          {title}
        </h2>

        <div className="flex flex-col gap-8">
          {items.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col md:flex-row items-center gap-6 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-6 md:w-1/2 shadow-lg hover:bg-white/20 transition duration-300">
                <p className="text-lg font-medium leading-relaxed">{point}</p>
              </div>

              <div className="hidden md:block md:w-1/2 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </motion.div>
          ))}
        </div>

        {/* Book Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => handleBookPDI(type)}
            className="bg-button hover:bg-button/90 text-white px-8 py-3 rounded-md text-lg font-medium transition duration-300"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );

  // --- Main Render ---
  return (
    <div className="bg-primary text-gray-800">
      {/* Main Heading */}
      <div className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-heading-bold">Our Services</h1>
        <p className="mt-4 text-lg text-gray-700">
          Explore our detailed Pre-Delivery Inspection (PDI) checklists for both new and used cars.
        </p>
      </div>

      {/* Sections */}
      {renderChecklist(
        newCarChecklist,
        service1,
        "New Car PDI Checklist",
        "Book Your New Car PDI Now",
        "new"
      )}

      {renderChecklist(
        usedCarChecklist,
        service2,
        "Used Car PDI Checklist",
        "Book Your Used Car PDI Now",
        "used"
      )}
    </div>
  );
}
