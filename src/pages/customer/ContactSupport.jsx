import React, { useRef, useState } from 'react';
import { FiPhone, FiMail, FiGlobe } from 'react-icons/fi';
import { BsClockHistory } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import emailjs from 'emailjs-com';
import 'react-toastify/dist/ReactToastify.css';
import ApiService from '../../core/services/api.service';
import ServerUrl from '../../core/constants/serverUrl.constant';

const ContactSupport = () => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Validate Indian mobile number
  const validateMobile = (number) => /^[6-9]\d{9}$/.test(number);

  const sendEmailAndSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);

    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const phone = formData.get("phone")?.trim();
    const message = formData.get("message")?.trim();

    // Check if all fields are filled
    if (!name || !email || !phone || !message) {
      toast.error("Please fill in all the fields.", { autoClose: 3000 });
      return;
    }

    // Mobile validation
    if (!validateMobile(phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.", { autoClose: 3000 });
      return;
    }

    setLoading(true);

    // Backend object
    const backendData = { name, email, phoneNumber: phone, message };

    // EmailJS object
    const emailData = {
      from_name: name,
      from_email: email,
      from_phone: phone,
      message: message,
      recipient_name: 'Admin',
      company_name: 'Carnomia'
    };

    try {
      // Send data to backend
      const response = await new ApiService().apipost(ServerUrl.API_ADD_INQUIRY, backendData);  
      const result = response.data;

      if (!result.success) {
        toast.error(result.message || "Failed to submit inquiry. Please try again.", { autoClose: 3000 });
        return;
      }

      // Send email via EmailJS
      await emailjs.send(
        'service_gz4mlz9',
        'template_6vp9oxl',
        emailData,
        'o2mI_LFMocdw08vI8'
      );

      toast.success(result.message || "Inquiry submitted successfully!", { autoClose: 3000 });
      formRef.current.reset();
      setAnimateForm(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setTimeout(() => setAnimateForm(false), 800);

    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Server error. Please try again.", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary px-4 sm:px-6 lg:px-12 py-12">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick draggable pauseOnHover={false} />

      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-12">

        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="lg:w-1/2 space-y-6 order-1 lg:order-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-button">Let’s Connect</h1>
          <p className="text-base sm:text-lg text-gray-700">
            Have questions before your next car purchase?<br />
            Need a Pre-Delivery Inspection?<br />
            We’re here to help you drive smart with confidence.
          </p>

          <div className="bg-primary shadow-xl rounded-2xl p-5 sm:p-6 border border-gray-200 space-y-6">
            {[
              { icon: <FiPhone className="text-xl sm:text-2xl" />, color: '#16a34a', label: 'Phone/WhatsApp:', value: (<><a href="tel:+917385978109" className="text-blue-600 hover:underline block text-sm">+91 73859 78109</a><a href="tel:+917378554409" className="text-blue-600 hover:underline block text-sm">+91 73785 54409</a></>) },
              { icon: <FiMail className="text-xl sm:text-2xl" />, color: '#dc2626', label: 'Email:', value: <a href="mailto:support@carnomia.com" className="text-blue-600 hover:underline text-sm">carnomiatechnologies@gmail.com</a> },
              { icon: <FiGlobe className="text-xl sm:text-2xl" />, color: '#7c3aed', label: 'Website:', value: <a href="https://carnomia.com/" className="text-blue-600 hover:underline text-sm">https://carnomia.com/</a> },
              { icon: <BsClockHistory className="text-xl sm:text-2xl" />, color: '#facc15', label: 'Customer Support Hours:', value: <span className="text-sm">Mon–Sun: 9:30 AM – 6:30 PM</span> },
            ].map((item, idx) => (
              <div className="flex items-start gap-3 sm:gap-4" key={idx}>
                <motion.div whileHover={{ scale: 1.2, color: item.color }} transition={{ type: 'spring' }}>{item.icon}</motion.div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{item.label}</p>
                  <div className="text-gray-700">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Inquiry Form */}
        <motion.div key={animateForm.toString()} initial={{ scale: 1 }} animate={animateForm ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.6 }} className="w-full lg:w-1/2 bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 sm:p-8 order-2 lg:order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-button mb-6">Inquiry Form</h2>
          <form ref={formRef} onSubmit={sendEmailAndSave} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-sm">Name *</label>
              <input type="text" name="name" required placeholder="Your full name" className="w-full px-4 py-2 rounded-xl border border-gray-300" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Email *</label>
              <input type="email" name="email" required placeholder="you@example.com" className="w-full px-4 py-2 rounded-xl border border-gray-300" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Phone Number *</label>
              <input type="text" name="phone" required placeholder="Your phone number" className="w-full px-4 py-2 rounded-xl border border-gray-300" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Message *</label>
              <textarea name="message" rows="3" placeholder="Write your message..." className="w-full px-4 py-2 rounded-xl border border-gray-300"></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white bg-button hover:bg-green-600">
              {loading ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default ContactSupport;