import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../core/contexts/AuthContext";

import service1 from "../../assets/service1.jpg";
import service2 from "../../assets/service2.jpg";
import service3 from "../../assets/service3.jpg";
import service4 from "../../assets/service4.jpg";
import service5 from "../../assets/service5.jpg";
import service6 from "../../assets/service6.jpg";
import service7 from "../../assets/service7.jpg";
import service8 from "../../assets/service8.jpg";
import service9 from "../../assets/service9.jpg";

export default function ServicesCard() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const handleBookPDI = (type) => {
    if (!isLoggedIn || !user) {
      toast.info("Please login to book your PDI.");
      navigate("/login");
    } else {
      const adminRoles = ["admin", "superadmin"];
      if (adminRoles.includes(user.role)) {
        navigate(`/request?isAdm=true`);
      } else if (user.role === "engineer") {
        toast.error("You are not allowed to create a new request.");
      } else {
        navigate(`/request?type=${type}`);
      }
    }
  };

  // ✅ New Car Checklist
  const newCarChecklist = [
    { title: "Exterior", image: service1, details: ["Body condition", "Paint quality", "Dents / Scratches", "Glass", "Lights"] },
    { title: "Tyres & Wheels", image: service2, details: ["Tread depth", "Manufacturing date", "Spare tyre"] },
    { title: "Engine", image: service3, details: ["Oil level", "Coolant level", "Brake fluid", "Windshield washer fluid", "Battery condition"] },
    { title: "Interior", image: service4, details: ["Seats", "Dashboard", "Infotainment system", "Controls", "AC / Heater"] },
    { title: "Electricals", image: service5, details: ["Headlights", "Indicators", "Wipers", "Horn", "Power windows"] },
    { title: "Odometer & Warning Lights", image: service6, details: ["Reading accuracy", "No error codes"] },
    { title: "OBD Scanning", image: service7, details: ["Ensure system check complete", "Verify no diagnostic error codes"] },
  ];

  // ✅ Used Car Checklist
  const usedCarChecklist = [
    { title: "Exterior", image: service1, details: ["Body condition", "Paint quality", "Dents / Scratches", "Glass", "Lights"] },
    { title: "Tyres & Wheels", image: service2, details: ["Tread depth", "Manufacturing date", "Spare tyre"] },
    { title: "Engine", image: service3, details: ["Oil level", "Coolant level", "Brake fluid", "Windshield fluid", "Battery condition"] },
    { title: "Interior", image: service4, details: ["Seats", "Dashboard", "Infotainment system", "Controls", "AC / Heater"] },
    { title: "Electricals", image: service5, details: ["Headlights", "Indicators", "Wipers", "Horn", "Power windows"] },
    { title: "Odometer & Warning Lights", image: service6, details: ["Reading accuracy", "No error codes"] },
    { title: "OBD Scanning", image: service7, details: ["Check for diagnostic trouble codes"] },
    { title: "Brakes & Suspension", image: service8, details: ["Smooth braking", "No unusual noise"] },
    { title: "Test Drive", image: service9, details: ["Steering", "Clutch", "Gearshift", "Acceleration"] },
  ];

  // ✅ Infinite auto-scroll hook (direction: 1 = right, -1 = left)
  const useInfiniteAutoScroll = (direction = 1, speed = 1.2) => {
    const ref = useRef(null);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
      const container = ref.current;
      if (!container) return;

      // Duplicate items for seamless looping
      const totalWidth = container.scrollWidth / 2;

      const scroll = setInterval(() => {
        if (!paused) {
          container.scrollLeft += direction * speed;

          // Loop when reaching end or start
          if (direction > 0 && container.scrollLeft >= totalWidth) {
            container.scrollLeft = 0;
          } else if (direction < 0 && container.scrollLeft <= 0) {
            container.scrollLeft = totalWidth;
          }
        }
      }, 20);

      return () => clearInterval(scroll);
    }, [direction, paused, speed]);

    const handleMouseEnter = () => setPaused(true);
    const handleMouseLeave = () => setPaused(false);

    return { ref, handleMouseEnter, handleMouseLeave };
  };

  // ✅ Checklist section renderer
  const renderChecklist = (title, checklist, type, scrollDirection) => {
    const { ref, handleMouseEnter, handleMouseLeave } = useInfiniteAutoScroll(scrollDirection, 1.5);

    return (
      <div className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-regal-blue mb-6 text-center">
          {title}
        </h2>

        {/* Scrollable Section */}
        <div
          ref={ref}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex overflow-x-hidden space-x-6 pb-4 scroll-smooth scrollbar-hide"
        >
          {[...checklist, ...checklist].map((item, index) => (
            <div
              key={index}
              className="min-w-[250px] sm:min-w-[280px] md:min-w-[300px] lg:min-w-[320px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-button overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 sm:h-44 md:h-48 object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-button mb-2 text-center sm:text-left">{item.title}</h3>
                <ul className="text-regal-blue text-sm leading-relaxed list-disc pl-5 space-y-1">
                  {item.details.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Book Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => handleBookPDI(type)}
            className="bg-button hover:bg-green-500 text-white px-8 py-3 rounded-full text-sm sm:text-base cursor-pointer font-semibold transition-all duration-300 shadow-md hover:shadow-xl"
          >
            Book {title}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-regal-blue mb-12">
          Our Services
        </h1>

        {/* New Car → scrolls LEFT */}
        {renderChecklist("New Car PDI Checklist", newCarChecklist, "new", -1)}

        {/* Used Car → scrolls RIGHT */}
        {renderChecklist("Used Car PDI Checklist", usedCarChecklist, "used", 1)}
      </div>
    </div>
  );
}
