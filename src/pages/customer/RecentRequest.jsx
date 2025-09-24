import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import QRCode from "../../assets/Car.png";
import airbagImg from "../../assets/airbag.png";
import {
  FaCar,
  FaWhatsapp,
  FaPhoneAlt,
  FaCarSide,
  FaGasPump,
  FaShieldAlt,
} from "react-icons/fa";
import { GiCarWheel, GiGearStick } from "react-icons/gi";
import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import {
  BsPencil,
  BsDownload,
  BsCheck,
  BsX,
  BsCurrencyRupee,
} from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { APPLICATION_CONSTANTS } from "../../core/constants/app.constant";
import generateInspectionPDF from "../admin/InspectionReportPdf";
import generateInvoicePdf from "../admin/InvoiceGeneratePdf";

const Recent = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestPDIRequest = async () => {
      try {
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_RECENT_REQUEST_BY_CUSTOMER
        );
        if (response?.data?.data && isMounted) {
          const latestRequest = response.data.data;
          console.log("Latest PDI Request:", latestRequest);
          setState((prev) => ({
            userName: latestRequest.customerName || "User",
            ...latestRequest,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch latest PDI request:", error);
        if (isMounted) {
          setState(null);
        }
      }
    };
    fetchLatestPDIRequest();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (state) {
      setKeyMetrics([
        {
          icon: <FaCarSide className="text-2xl text-button" />,
          value: `${state.BHPs || "525"} BHP`,
          label: "Power",
        },
        {
          icon: (
            <img
              src={airbagImg}
              alt="Airbags"
              className="w-8 h-9 object-contain"
            />
          ),
          value: `${state.Airbags || "4"} Airbags`,
          label: "Safety",
        },
        {
          icon: <FaGasPump className="text-2xl text-button" />,
          value: `${state.Mileage || "25.4"} kmpl`,
          label: "Mileage",
        },
        {
          icon: <GiCarWheel className="text-2xl text-button" />,
          value: `${state.NCAP || "5 Star"}`,
          label: "NCAP Rating",
        },
        {
          icon: <GiGearStick className="text-2xl text-button" />,
          value: state.transmissionType || "Automatic",
          label: "Transmission",
        },
        {
          icon: <HiOutlineCalendar className="text-2xl text-button" />,
          value: state.date
            ? new Date(state.date).toLocaleDateString()
            : "Not set",
          label: "PDI Date",
        },
      ]);
    }
  }, [state]);

  const handleUpdateInspection = async () => {
    try {
      setIsSaving(true);

      const payload = {
        brand: state.brand,
        model: state.model,
        variant: state.variant,
        transmissionType: state.transmissionType,
        fuelType: state.fuelType,
        address: state.address,
        date: state.date,
        notes: state.notes,
      };

      const response = await new ApiService().apiput(
        `${ServerUrl.API_GET_INSPECTION_UPDATE}/${state._id}`,
        payload
      );

      if (response?.data?.success) {
        setState((prev) => ({ ...prev, ...payload })); // update state
        setShowEditModal(false); // close modal immediately
        setShowToast(true); // show toast
        setTimeout(() => setShowToast(false), 3000);
      } else {
        toast.error("Failed to update inspection"); // optional
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssistanceClick = (i) => {
    if (i === 0) navigate("/customer/dashboard/contact-support");
    else if (i === 2) handleState("showEditModal", true);
  };

  // console.log("form data ", state);

  const renderModal = (show, title, content, actions) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-primary p-5 text-white text-center">
              <h3 className="text-xl font-heading flex items-center justify-center">
                {title.icon && <title.icon className="mr-2" />} {title.text}
              </h3>
            </div>
            <div className="p-6">{content}</div>
            {actions && (
              <div className="flex justify-end space-x-3 p-4 bg-gray-50 border-t border-gray-200">
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleCloseModal = () => {
    if (isSaving) return; // prevent closing while saving
    setShowEditModal(false);
  };

  const downloadReport = async (order) => {
    try {
      toast.info("Your Inspection Report is being generated, please wait...");
      await generateInspectionPDF(order);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate report.");
    }
  };

  const downloadInvoice = async (order) => {
    try {
      toast.info("Your Invoice is being generated, please wait...");
      await generateInvoicePdf(order);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error("Failed to generate invoice.");
    }
  };

  const isCompleted =
    state &&
    state.status === APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value &&
    state.paymentStatus === APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value;

  return (
    <div className="min-h-screen bg-primary px-4 sm:px-6 md:px-8 py-6 font-sans">
      {state ? (
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4"
          >
            {/* Left Side - Booking Info */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-900">
                Booking ID:{" "}
                <span className="text-button">{state.bookingId}</span>
              </h1>

              {state == null ? (
                <p className="text-gray-600 mt-1 sm:mt-2">
                  You don't have any recent requests yet.
                </p>
              ) : null}

              {state && state != null ? (
                <p className="text-gray-600 mt-1 sm:mt-2 flex items-center text-sm sm:text-base">
                  Your vehicle booking details
                  <span className="ml-2 w-2 h-2 bg-button rounded-full animate-pulse"></span>
                </p>
              ) : null}
            </div>

            {/* Right Side - Status Badge */}
            <div className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm flex items-center gap-1 sm:gap-2 border border-gray-200 min-w-fit">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-button rounded-full"></span>
              <span className="truncate">
                {APPLICATION_CONSTANTS.REQUEST_STATUS[state?.status]?.label}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Vehicle Image - Full width on mobile, 2/3 on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-primary rounded-xl shadow-xl overflow-hidden border border-gray-100 relative"
            >
              {/* Vehicle Image */}
              <div className="relative w-full flex justify-center bg-white items-center">
                <img
                  src={
                    `${ServerUrl.IMAGE_URL}${state.imageUrl}` ||
                    "https://via.placeholder.com/800x400?text=No+Image"
                  }
                  alt="Vehicle"
                  className="w-full max-h-80 sm:max-h-96 md:max-h-[28rem] object-contain"
                />
              </div>

              {/* Gradient Overlay with Vehicle Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent p-3 sm:p-4 md:p-5">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-heading font-bold text-gray-900 truncate">
                  {state.brand} {state.model}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 font-semibold">
                  {state.variant}
                </p>
              </div>
            </motion.div>

            {/* Key Metrics - Grid layout responsive */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-4"
            >
              {keyMetrics.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  className="flex flex-col items-start sm:items-center bg-gradient-to-br from-white to-green-50 rounded-xl p-3 sm:p-4 shadow-xl border border-gray-100 hover:shadow-md"
                >
                  {/* Icon wrapper ensures consistent sizing */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-heading text-gray-900 mt-1 sm:mt-2 text-left sm:text-center">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 text-left sm:text-center">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Booking & Vehicle Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 lg:col-span-2 w-full"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-base sm:text-lg font-body text-[#003C00] flex items-center mb-2 sm:mb-0">
                  <FaCar className="mr-2 text-button" /> Booking & Vehicle
                  Details
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditModal(true)}
                  disabled={
                    state.status !==
                    APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value
                  } // ✅ Only enable if NEW
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm text-xs sm:text-sm font-medium flex items-center ${
                    state.status ===
                    APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value
                      ? "bg-button text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <BsPencil className="mr-1 sm:mr-2" /> Edit Details
                </motion.button>
              </div>

              <div className="space-y-3">
                {[
                  ["Booking ID", state.bookingId],
                  ["Brand", state.brand],
                  ["Model", state.model],
                  ["Variant", state.variant],
                  ["Fuel Type", state.fuelType],
                  ["Transmission", state.transmissionType],
                  [
                    "PDI Date",
                    state.date
                      ? new Date(state.date).toLocaleDateString()
                      : "Not specified",
                  ],
                  [
                    "Location",
                    <span className="text-button flex items-center text-sm sm:text-base">
                      <HiOutlineLocationMarker className="mr-1" />{" "}
                      {state.address}
                    </span>,
                  ],
                ].map(([label, value], i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b border-gray-200 pb-2 text-sm sm:text-base"
                  >
                    <span className="text-gray-700 font-medium">{label}:</span>
                    <span className="text-gray-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Booking Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg p-4 sm:p-6 text-black flex flex-col justify-between w-full"
            >
              <div>
                <h3 className="text-base sm:text-lg font-heading mb-4">
                  Booking Status
                </h3>
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-button text-sm sm:text-base">
                      Booking Fee
                    </span>
                    <span className="font-heading text-sm sm:text-base">
                      ₹2,500
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-button text-sm sm:text-base">
                      Payment Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-heading ${
                        state.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {
                        APPLICATION_CONSTANTS.PAYMENT_STATUS[
                          state["paymentStatus"]
                            ? state["paymentStatus"]
                            : APPLICATION_CONSTANTS.PAYMENT_STATUS.PENDING.value
                        ]?.label
                      }
                    </span>
                  </div>
                </div>

                {state["paymentStatus"] !== APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value ? (
                  <span>Payment not done yet</span>
                ) : (
                  isCompleted && (
                    <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                      <button
                        onClick={() => downloadReport(state)}
                        className="flex items-center px-4 py-2 text-sm bg-button text-white rounded-lg shadow-sm transition-all hover:opacity-90 cursor-pointer"
                      >
                        <FiDownload className="mr-2" /> Download Report
                      </button>
                      <button
                        onClick={() => downloadInvoice(state)}
                        className="flex items-center px-4 py-2 text-sm bg-button text-white rounded-lg shadow-sm transition-all hover:opacity-90 cursor-pointer"
                      >
                        <FiDownload className="mr-2" /> Download Invoice
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-green-500/30">
                <h4 className="text-xs sm:text-sm font-heading mb-3">
                  Need assistance?
                </h4>
                {[
                  "Contact Support Team",
                  "View Booking FAQs",
                  "Modify Booking",
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleAssistanceClick(i)}
                    className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition cursor-pointer mb-2"
                  >
                    <p className="font-medium text-xs sm:text-sm">{item}</p>
                    <p className="text-button text-xs">
                      {i === 0
                        ? "Get immediate help via email or chat"
                        : i === 1
                        ? "Find answers to common questions"
                        : "Change dates or cancel your reservation"}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          {/* Additional Notes Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-xl p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8"
          >
            <h3 className="text-base sm:text-lg font-heading text-gray-900 mb-2 sm:mb-3">
              Additional Notes
            </h3>
            <div className="bbg-gradient-to-br from-white to-green-50 rounded-lg p-3 sm:p-4 text-gray-700 text-sm sm:text-base">
              {state.notes ||
                "No additional notes were provided for this booking."}
            </div>
          </motion.div>

          {/* Edit Modal */}
          {renderModal(
            showEditModal,
            { icon: BsPencil, text: "Edit Booking Details" },
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto p-1">
              {[
                { name: "bookingId", label: "Booking ID", disabled: true },
                { name: "brand", label: "Brand", disabled: true },
                { name: "model", label: "Model", disabled: true },
                { name: "variant", label: "Variant" },
                { name: "transmissionType", label: "Transmission Type" },
                { name: "fuelType", label: "Fuel Type" },
                { name: "date", label: "PDI Date", type: "date" },
                { name: "address", label: "Address" },
                { name: "notes", label: "Notes", textarea: true },
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {field.label}
                  </label>

                  {field.textarea ? (
                    <textarea
                      name={field.name}
                      value={state[field.name] || ""}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={
                        field.name === "date"
                          ? state.date
                            ? new Date(state.date).toISOString().slice(0, 10)
                            : ""
                          : state[field.name] || ""
                      }
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          [field.name]:
                            field.name === "date"
                              ? e.target.value
                              : e.target.value,
                        }))
                      }
                      disabled={field.disabled}
                      className={`w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent ${
                        field.disabled ? "bg-gray-100" : "bg-white"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>,
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(false)}
                className="px-4 sm:px-6 py-1.5 sm:py-2 text-gray-700 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 text-xs sm:text-sm"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSaving}
                onClick={handleUpdateInspection}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 text-white rounded-lg font-medium shadow-md text-xs sm:text-sm ${
                  isSaving
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-button hover:bg-green-700"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>
            </>
          )}

          {/* Payment Modal */}
          {renderModal(
            state.showPayment,
            { icon: BsCurrencyRupee, text: "Complete Payment" },
            <>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-gray-700 text-sm sm:text-base">
                  Service:
                </span>
                <span className="font-medium text-sm sm:text-base">
                  Vehicle Booking
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-gray-700 text-sm sm:text-base">
                  Amount:
                </span>
                <span className="text-xl sm:text-2xl font-heading text-button">
                  ₹2,500
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img
                    src={QRCode}
                    alt="QR Code"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  />
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  Scan with any UPI app to pay
                </p>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  // onClick={handleMarkAsPaid} disabled={state.isPaid}
                  className={`w-full py-2 sm:py-3 rounded-lg font-medium flex items-center justify-center text-xs sm:text-base ${
                    state.isPaid
                      ? "bg-green-100 text-green-800 cursor-not-allowed"
                      : "bg-button text-white hover:bg-green-700 shadow-md"
                  }`}
                >
                  {state.isPaid ? (
                    <>
                      <BsCheck className="mr-1 sm:mr-2" /> Payment Completed
                    </>
                  ) : (
                    "Mark as Paid"
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleState("showPayment", false)}
                  className="w-full py-2 sm:py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs sm:text-base"
                >
                  <BsX className="mr-1 sm:mr-2" /> Close
                </motion.button>
              </div>
            </>,
            null
          )}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 
                 bg-white rounded-lg sm:rounded-xl shadow-lg 
                 border border-green-200 overflow-hidden max-w-xs sm:max-w-sm"
              >
                <div className="flex items-center p-3 sm:p-4">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-3">
                    <BsCheck className="text-button text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-heading text-gray-900 text-sm sm:text-base">
                      Updated Successfully!
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Your booking details were saved.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notification */}
          <AnimatePresence>
            {state.showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-white rounded-lg sm:rounded-xl shadow-lg border border-green-200 overflow-hidden max-w-xs sm:max-w-sm"
              >
                <div className="flex items-center p-3 sm:p-4">
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-3">
                    <BsCheck className="text-button text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-heading text-gray-900 text-sm sm:text-base">
                      Payment Successful!
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Your car report are sent to your WhatsApp
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-700">No recent requests found.</p>
      )}
    </div>
  );
};

export default Recent;
