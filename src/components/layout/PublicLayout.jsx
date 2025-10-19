import React from "react";
import LocationTicker from "../layout/LocationTicker";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { Outlet } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export default function PublicLayout() {
  const whatsappNumber = "917385978109";
  const message = "Hello! I would like to know more about your services.";

  return (
    <>
      <LocationTicker />
      <Navbar />
      <main className="min-h-[calc(100vh-150px)] relative">
        <Outlet />

        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-2 right-2 bg-button text-white p-2 rounded-full shadow-lg hover:bg-green-500 transition-all duration-300 flex items-center justify-center whatsapp-jump"
        >
          <FaWhatsapp size={38} />
        </a>

      </main>
      <Footer />
    </>
  );
}
