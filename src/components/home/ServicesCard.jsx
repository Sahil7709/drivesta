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

  // ✅ Checklists
  const newCarChecklist = [
    { title: "Exterior", image: service1, details: ["Body condition", "Paint quality", "Dents / Scratches", "Glass", "Lights"] },
    { title: "Tyres & Wheels", image: service2, details: ["Tread depth", "Manufacturing date", "Spare tyre"] },
    { title: "Engine", image: service3, details: ["Oil level", "Coolant level", "Brake fluid", "Washer fluid", "Battery condition"] },
    { title: "Interior", image: service4, details: ["Seats", "Dashboard", "Infotainment system", "Controls", "AC / Heater"] },
    { title: "Electricals", image: service5, details: ["Headlights", "Indicators", "Wipers", "Horn", "Power windows"] },
    { title: "Odometer & Warning Lights", image: service6, details: ["Reading accuracy", "No error codes"] },
    { title: "OBD Scanning", image: service7, details: ["Ensure system check complete", "Verify no diagnostic error codes"] },
  ];

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

  /**
   * ✅ Infinite Auto Scroll Hook
   * Supports mobile & desktop, drag, and infinite loop.
   */
  const useInfiniteAutoScroll = (direction = 1, speed = 0.8) => {
    const ref = useRef(null);
    const [paused, setPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragState = useRef({ active: false, startX: 0, startScroll: 0 });

    // Auto-scroll loop
    useEffect(() => {
      const container = ref.current;
      if (!container) return;

      let rafId;
      const halfScroll = Math.floor(container.scrollWidth / 2);

      const loop = () => {
        if (!paused && !isDragging && container.scrollWidth > container.clientWidth) {
          container.scrollLeft += direction * speed;

          // ✅ wrap-around logic with tolerance
          if (direction > 0 && container.scrollLeft >= halfScroll - 1) {
            container.scrollLeft = 0;
          } else if (direction < 0 && container.scrollLeft <= 1) {
            container.scrollLeft = halfScroll;
          }
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafId);
    }, [direction, paused, isDragging, speed]);

    // Manual drag
    useEffect(() => {
      const container = ref.current;
      if (!container) return;

      const start = (e) => {
        dragState.current.active = true;
        dragState.current.startX = e.clientX || e.touches?.[0]?.clientX;
        dragState.current.startScroll = container.scrollLeft;
        setIsDragging(true);
        setPaused(true);
      };

      const move = (e) => {
        if (!dragState.current.active) return;
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const dx = clientX - dragState.current.startX;
        container.scrollLeft = dragState.current.startScroll - dx;
      };

      const end = () => {
        dragState.current.active = false;
        setIsDragging(false);
        setTimeout(() => setPaused(false), 200);
      };

      // Mouse + touch
      container.addEventListener("pointerdown", start);
      container.addEventListener("pointermove", move);
      container.addEventListener("pointerup", end);
      container.addEventListener("pointercancel", end);
      container.addEventListener("pointerleave", end);

      return () => {
        container.removeEventListener("pointerdown", start);
        container.removeEventListener("pointermove", move);
        container.removeEventListener("pointerup", end);
        container.removeEventListener("pointercancel", end);
        container.removeEventListener("pointerleave", end);
      };
    }, []);

    return { ref, setPaused };
  };

  // ✅ Renderer
  const renderChecklist = (title, checklist, type, scrollDirection) => {
    const { ref, setPaused } = useInfiniteAutoScroll(scrollDirection, 0.9);

    const duplicated = [...checklist, ...checklist];

    return (
      <div className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-regal-blue mb-6 text-center">
          {title}
        </h2>

        <div
          ref={ref}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "none",
            touchAction: "pan-y pinch-zoom",
          }}
        >
          {duplicated.map((item, idx) => (
            <div
              key={idx}
              className="min-w-[250px] sm:min-w-[280px] md:min-w-[300px] lg:min-w-[320px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-button overflow-hidden group"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 sm:h-44 md:h-48 object-cover transform group-hover:scale-105 transition duration-500"
              />
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-button mb-2 text-center sm:text-left">
                  {item.title}
                </h3>
                <ul className="text-regal-blue text-sm leading-relaxed list-disc pl-5 space-y-1">
                  {item.details.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => handleBookPDI(type)}
            className="bg-button hover:bg-green-500 text-white px-10 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 shadow-md hover:shadow-xl"
          >
            {type === "new" ? "Book New Car PDI" : "Book Used Car PDI"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-primary py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-regal-blue mb-12">
          Our Services
        </h1>

        {/* New Car → scrolls RIGHT */}
        {renderChecklist("New Car PDI Checklist", newCarChecklist, "new", 1)}

        {/* Used Car → scrolls LEFT */}
        {renderChecklist("Used Car PDI Checklist", usedCarChecklist, "used", -1)}
      </div>
    </div>
  );
}
