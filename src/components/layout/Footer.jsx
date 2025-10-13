import React from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaTwitter,
  FaRegClock,
  FaCalendarAlt,
  FaCopyright,
} from "react-icons/fa";
import logo from "../../assets/logos/Logob.png";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-black text-white font-sans pt-0">
      {/* Logo Section */}
      <div className="bg-black py-4">
        <motion.img
          src={logo}
          alt="Carnomia Logo"
          className="h-12 mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-20 py-10 text-sm">
        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="font-bold mb-4 text-lg">Social Media</h3>
          <ul className="space-y-2">
            {[
              {
                label: "Instagram",
                icon: <FaInstagram />,
                url: " https://www.instagram.com/carnomiatechnologies/?next=https%3A%2F%2Fwww.instagram.com%2F%3Fhl%3Den%26__coig_ufac%3D1",
              },
              {
                label: "LinkedIn",
                icon: <FaLinkedin />,
                url: "https://www.linkedin.com/company/108622309/admin/dashboard/ ",
              },
              {
                label: "Facebook",
                icon: <FaFacebook />,
                url: "https://www.facebook.com/profile.php?id=61579184318790",
              },
              {
                label: "YouTube",
                icon: <FaYoutube />,
                url: "https://www.youtube.com/@CarnomiaTechnologies",
              },
              {
                label: "Twitter",
                icon: <FaTwitter />,
                url: "https://x.com/carnomia",
              },
            ].map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-button transition"
                >
                  {item.icon} {item.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Company Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-bold mb-4 text-lg">Company</h3>
          <ul className="space-y-2">
            {[
              { label: "About Us", to: "/about-us" },
              { label: "Careers", to: "/careers" },
              { label: "Blog", to: "/blogs" },
              { label: "Contact Us", to: "/contact-us" },
            ].map((item, i) => (
              <li key={i}>
                <Link to={item.to} className="hover:text-button transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-bold mb-4 text-lg">Support</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-button transition"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-button transition">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-button transition">
                FAQs
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-bold mb-4 text-lg cursor-pointer">Contact</h3>
          <p className="my-2 hover:text-button transition">+91 7385978109</p>
          <p className="my-2 hover:text-button transition">+91 7378554409</p>
        </motion.div>
      </div>

      {/* Working Hours */}
      <motion.div
        className="text-center text-sm mb-6 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center gap-4 mb-1 items-center flex-wrap text-gray-300">
          <FaCalendarAlt />
          <span>Working Days:</span>
          <span className="font-medium text-white">Monday - Sunday</span>
          <FaRegClock />
          <span>Working Hours:</span>
          <span className="font-medium text-white">09:30am - 06:30pm</span>
        </div>
      </motion.div>

      {/* Copyright */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs py-3 border-t border-gray-800 text-gray-400 text-center">
        <div className="flex items-center gap-1">
          <FaCopyright />
          <span>2025 Carnomia. All Rights Reserved.</span>
        </div>
        <div className="text-gray-400">
          Developed and Maintained by{" "}
          <a
            href="https://smartsoftwareservice.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium hover:text-button transition-colors duration-200"
          >
            Smart Software Services Pvt. Ltd.
          </a>
        </div>
      </div>
    </footer>
  );
}
