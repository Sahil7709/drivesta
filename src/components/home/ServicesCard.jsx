import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import service1 from "../../assets/service1.jpg";
import service2 from "../../assets/service2.jpg";
import { useAuth } from "../../core/contexts/AuthContext";

export default function ServicesCard() {
    
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

    const handleBookPDI = () => {
    if (!isLoggedIn || !user) {
      toast.info("Please login to book your PDI.");
      navigate("/login");
    } else {
      const adminRoles = ["admin", "superadmin"];
      if (adminRoles.includes(user.role)) {
        navigate("/request?isAdm=true");
    } else if (user.role === "engineer") {
    // Engineer restricted
    toast.error("You are not allowed to create a new request.");
    } else {
        navigate("/request");
      }
    }
  };

  const services = [
    {
      title: "New Car PDI",
      path: {handleBookPDI},
      image: service1,
    },
    {
      title: "Used Car PDI",
      path: {handleBookPDI},
      image: service2,
    },
  ];

  return (
    <div className="bg-primary py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-heading-bold text-center mb-10 text-gray-800">
          Our Services
        </h2>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 h-80 bg-cover bg-center"
              style={{ backgroundImage: `url(${service.image})` }}
            >
              <div className="absolute inset-0 bg-black/50 p-8 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-body mb-4">{service.title}</h3>
                <button
                  onClick={handleBookPDI}
                  className="bg-button cursor-pointer text-white px-6 py-2 rounded-md w-fit text-sm font-body transition"
                  aria-label={`Book ${service.title}`}
                >
                  Book Your PDI Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
