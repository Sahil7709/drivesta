import mcar from "../../assets/car_fr2.jpg";
import {
  FaBullseye,
  FaEye,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkedAlt,
} from "react-icons/fa";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {} from "react-icons/fa";
import aboutcar from "../../assets/aboutcar.png";
import car from "../../assets/Acar.png";
import { motion } from "framer-motion";
import aboutData from "../../components/constants/publicData/AboutData";
import about1 from "../../assets/about1.jpg";
import about2 from "../../assets/about2.jpg";
import about3 from "../../assets/about3.jpg";
import about4 from "../../assets/about4.jpg";
import about5 from "../../assets/about5.jpg";
import about6 from "../../assets/about6.jpg";

const About = () => {
  const issues = [
    {
      img: about1,
      title: "Scratches from transport",
      desc: "Caused during logistics or storage.",
    },
    {
      img: about2,
      title: "Faulty electrical components",
      desc: "Wiring and sensors often have faults.",
    },
    {
      img: about3,
      title: "Missing accessories",
      desc: "Spare tires or manuals may be absent.",
    },
    {
      img: about4,
      title: "Panel mismatches or repaints",
      desc: "May indicate prior damage.",
    },
    {
      img: about5,
      title: "Software bugs",
      desc: "New cars can still glitch digitally.",
    },
    {
      img: about6,
      title: "Pre-registration usage",
      desc: "Demo/test-drive history may be hidden.",
    },
  ];

  const [hovered, setHovered] = useState(false);

  return (
    <div className="bg-primary text-gray-800">
      {/* Header */}
      <div className="text-center bg-black text-button py-12">
        <h1 className="text-4xl font-bold tracking-wider">ABOUT US</h1>
      </div>

      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-4xl font-bold text-button leading-tight">
            WE'RE REVOLUTIONIZING VEHICLE INSPECTION & SERVICES
          </h2>
          <p className="text-lg font-body leading-relaxed">
            Carnomia transforms the way vehicle owners access inspections &
            services. With certified technicians and on-demand tech, we simplify
            inspections from pre-delivery to periodic maintenance.
          </p>
          <div className="flex gap-6">
            <div className="text-center p-4 shadow border rounded-xl bg-white">
              <p className="text-3xl font-bold text-button">30+</p>
              <p className="text-sm mt-1">Vehicle Services</p>
            </div>
            <div className="text-center p-4 shadow border rounded-xl bg-white">
              <p className="text-3xl font-bold text-button">300+</p>
              <p className="text-sm mt-1">Certified Technicians</p>
            </div>
            <div className="text-center p-4 shadow border rounded-xl bg-white">
              <p className="text-3xl font-bold text-button">40+</p>
              <p className="text-sm mt-1">Cities Covered</p>
            </div>
          </div>
          <Link to="/">
            <button className="mt-4 px-6 py-3 bg-button text-white rounded-lg hover:bg-green-600 font-bold">
              Check Our Services
            </button>
          </Link>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <img
            src={aboutcar}
            alt="Carnomia"
            className="rounded-xl max-w-md w-full"
          />
        </div>
      </section>
      {/* 🚗 What We Do Section */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-primary">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6">
          What We Do
        </h2>

        <div className="max-w-7xl mx-auto relative flex justify-center items-center min-h-[400px] sm:min-h-[500px] md:min-h-[550px] px-4">
          {/* 🖼️ Static Car Image in Center */}
          <img
            src={car}
            alt="Car"
            className="z-10 w-[180px] sm:w-[250px] md:w-[300px] lg:w-[400px]"
          />

          {/* 🔧 Feature Labels (keep existing logic) */}
          {aboutData.map((item, index) => (
            <div
              key={index}
              className={`absolute ${item.position} w-[150px] sm:w-[180px] md:w-[200px] lg:w-[220px] text-center`}
            >
              <div className="bg-white p-2 sm:p-3 rounded-full shadow-md inline-block transition duration-300">
                {item.icon}
              </div>
              <p className="font-body text-xs sm:text-sm md:text-base mt-2">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className=" bg-primary max-w-7xl mx-auto px-4 md:px-10 py-16">
        <h2 className="text-3xl font-bold text-center mb-6">
          Why New Cars Need Inspection Too
        </h2>
        <p className="text-center font-heading text-lg max-w-2xl mx-auto mb-10">
          Carnomia helps you catch hidden flaws before you drive off.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((item, i) => (
            <div
              key={i}
              className="relative h-64 bg-cover bg-center rounded-xl shadow group"
              style={{ backgroundImage: `url(${item.img})` }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition duration-300 rounded-xl" />
              <div className="absolute bottom-14 left-4 right-4 text-white text-base font-semibold z-10">
                {item.title}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm opacity-0 group-hover:opacity-100 transition z-10">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className=" py-16 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-1/2">
            <img
              src={mcar}
              alt="Mission"
              className="rounded-xl w-full max-w-md mx-auto"
            />
          </div>
          <div className="lg:w-1/2 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaBullseye className="text-button text-2xl" />
                <h3 className="text-2xl font-bold">Our Mission</h3>
              </div>
              <p className="text-body">
                To deliver reliable and tech-enabled vehicle services that
                redefine transparency and customer trust in the auto industry.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaEye className="text-button text-2xl" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-body">
                To become India's most trusted mobility brand through
                innovation, excellence, and a customer-first approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
        <h2 className="text-3xl font-bold font-bold flex items-center justify-center gap-2 mb-8">
          <FaMapMarkedAlt className="text-button" /> Our Availability
        </h2>
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-1/2 space-y-4">
            <h4 className="text-xl font-bold text-button">Currently Serving</h4>
            <p className="text-lg font-semibold">
              Pune, Maharashtra —{" "}
              <span className="text-button">Expanding Fast</span>
            </p>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 text-lg">
                <FaPhoneAlt className="text-button" /> +91 7385978109
              </div>
              <div className="flex items-center gap-3 text-lg">
                <FaEnvelope className="text-button" /> support@carnomia.in
              </div>
              <div className="flex items-center gap-3 text-lg">
                <FaMapMarkerAlt className="text-button" /> Pune, Maharashtra
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 w-full rounded-xl overflow-hidden shadow-md">
            <iframe
              title="Pune Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.747054265725!2d73.84708281489363!3d18.547731287393835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c08f198bbce3%3A0x6b3b2edc4e49a8f3!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1655551482721!5m2!1sen!2sin"
              width="100%"
              height="300"
              loading="lazy"
              className="w-full"
              style={{ border: 0 }}
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
