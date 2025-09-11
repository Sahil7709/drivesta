// import React, { useState,useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import { FaDownload, FaChevronDown } from "react-icons/fa";
// import jeepImage from "../../assets/honda_elevate.png";
// import ApiService from "../../core/services/api.service";
// import ServerUrl from "../../core/constants/serverUrl.constant";
// import generateInspectionPDF from '../admin/InspectionReportPdf';
// import sampleReport from "../../components/constants/publicData/SampleReportData";
// import { useAuth } from "../../core/contexts/AuthContext";

// const carStatusOptions = [
//   { value: "new", label: "New Car" },
//   { value: "used", label: "Used Car" },
// ];

// const Request = () => {

//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const query = new URLSearchParams(useLocation().search);
//   const isAdm = query.get("isAdm") === "true";

//   // form state
// const [selectedBrand, setSelectedBrand] = useState("");
// const [selectedModel, setSelectedModel] = useState("");
// const [selectedVariant, setSelectedVariant] = useState("");
// const [transmission, setTransmission] = useState("");
// const [fuel, setFuel] = useState("");
// const [carStatus, setCarStatus] = useState("");
// const [vehicles, setVehicles] = useState([])
// const [brands, setBrands] = useState([])
// const [models, setModels] = useState([])
// const [variants, setVariants] = useState([])
// const [pdiDate, setPdiDate] = useState("");
// const [note, setNotes] = useState("");
// const [address, setAddress] = useState("");
// const [dealer, setDealer] = useState("");
// const [selectedImage, setSelectedImage] = useState(jeepImage);
// const [errorMessage, setErrorMessage] = useState("");

// const [customerName, setCustomerName] = useState("");
// const [customerMobile, setCustomerMobile] = useState("");

// useEffect(() => {
//   if (!isAdm && user?.name) {
//     setCustomerName(user.name);
//     setCustomerMobile(user.mobile);
//   }
// }, [isAdm, user]);

// useEffect(() => {
//   const fetchVehicles = async () => {
//     try {
//       const response = await new ApiService().apiget(ServerUrl.API_GET_VEHICLES);

//       if (response?.data?.data) {
//         const uniqueBrands = Object.values(
//           response.data.data.reduce((acc, curr) => {
//             if (!acc[curr.brand]) {
//               acc[curr.brand] = curr; // store the first occurrence of each brand
//             }
//             return acc;
//           }, {})
//         );
//         const uniqueModels = Object.values(
//           response.data.data.reduce((acc, curr) => {
//             if (!acc[curr.model]) {
//               acc[curr.model] = curr;
//             }
//             return acc;
//           }, {})
//         );

//         setBrands(uniqueBrands);
//         setModels(uniqueModels);
//         setVehicles(response.data.data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch vehicles", err);
//     }
//   };

//   fetchVehicles();
// }, []);

//   // dropdown arrows
//   const [open, setOpen] = useState({
//     brand: false,
//     model: false,
//     variant: false,
//     status: false,
//   });

//   const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

//   // derived lists
//   // const brandObj = vehicles.find((b) => b.brand === selectedBrand);
//   // const modelObj = brandObj?.models.find((m) => m.name === selectedModel);
//   // const models =  [];
//   // const variants =  [];

//   // today for min date
//   const today = new Date().toISOString().split("T")[0];

//   // handlers
//   // const handleBrandChange = (e) => {
//   //   setSelectedBrand(e.target.value);
//   //   setModels(vehicles.filter((v) => v.brand === e.target.value).map((v) => ({ name: v.model, image: v.imageUrl })));
//   //   setSelectedModel("");
//   //   setSelectedVariant("");
//   //   setSelectedImage(jeepImage);
//   //   setTransmission("");
//   //   setFuel("");
//   // };

//   // const handleModelChange = (e) => {
//   //   const m = e.target.value;
//   //   setSelectedModel(m);
//   //   setVariants(vehicles.filter((x) => x.model === m).map((v) => ({ name: v.variant })));
//   //   setSelectedVariant("");
//   //   const img = vehicles.find((x) => x.model === m)?.imageUrl || jeepImage;
//   //   setSelectedImage(img);

//   //   setSelectedVariant("");
//   //   setTransmission("");
//   //   setFuel("");
//   // };

//   // const handleVariantChange = (e) => {
//   //   const v = e.target.value;
//   //   setSelectedVariant(v);
//   //   setTransmission(vehicles.find((x) => x.variant === v)?.transmissionType || "");
//   //   setFuel(vehicles.find((x) => x.variant === v)?.fuelType || "");
//   //   // const vObj = variants.find((x) => x.name === v);
//   //   // if (vObj) {
//   //   //   setTransmission(vObj.transmission);
//   //   //   setFuel(vObj.fuel);
//   //   // }
//   //   // setTransmission("");
//   //   // setFuel("");
//   // };

//   const handleBrandChange = (e) => {
//   const brand = e.target.value;
//   setSelectedBrand(brand);

//   // ✅ unique models per brand
//   const uniqueModelsForBrand = Object.values(
//     vehicles
//       .filter((v) => v.brand === brand)
//       .reduce((acc, curr) => {
//         if (!acc[curr.model]) {
//           acc[curr.model] = { name: curr.model, image: curr.imageUrl };
//         }
//         return acc;
//       }, {})
//   );

//   setModels(uniqueModelsForBrand);
//   setSelectedModel("");
//   setSelectedVariant("");
//   setSelectedImage(jeepImage);
//   setTransmission("");
//   setFuel("");
// };

// const handleModelChange = (e) => {
//   const m = e.target.value;
//   setSelectedModel(m);

//   // ✅ unique variants per model
//   const uniqueVariantsForModel = Object.values(
//     vehicles
//       .filter((x) => x.model === m)
//       .reduce((acc, curr) => {
//         if (!acc[curr.variant]) {
//           acc[curr.variant] = { name: curr.variant };
//         }
//         return acc;
//       }, {})
//   );

//   setVariants(uniqueVariantsForModel);

//   // update image for model
//   const img = vehicles.find((x) => x.model === m)?.imageUrl || jeepImage;
//   setSelectedImage(img);

//   setSelectedVariant("");
//   setTransmission("");
//   setFuel("");
// };

// const handleVariantChange = (e) => {
//   const v = e.target.value;
//   setSelectedVariant(v);

//   const variantObj = vehicles.find((x) => x.variant === v);

//   setTransmission(variantObj?.transmissionType || "");
//   setFuel(variantObj?.fuelType || "");
// };

//   // submit
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!selectedBrand || !selectedModel || !selectedVariant || !carStatus) {
//     toast.error("Please fill all required fields.");
//     return;
//   }
//   console.log("Submitting PDI:", { customerName, customerMobile, user });

//   const payload = {
//     brand: selectedBrand,
//     model: selectedModel,
//     address: address,
//     dealerName: dealer,
//     date: pdiDate,
//     notes: note,
//     variant: selectedVariant,
//     transmissionType: transmission,
//     fuelType: fuel,
//     imageUrl:selectedImage,
//     carStatus: carStatus,
//     customerName: customerName || user?.name || "",
//     customerMobile: customerMobile || user?.mobile || "",
//   };

//   try {
//     const response = await new ApiService().apipost(ServerUrl.API_PDI_CREATE, payload);
//     toast.success("Vehicle PDI Created successfully!");
//     setTimeout(() => {
//       navigate("/success");
//     }, 1000);

//     setSelectedBrand("");
//     setSelectedModel("");
//     setSelectedVariant("");
//     setTransmission("");
//     setFuel("");
//     setCarStatus("");
//     setSelectedImage("");
//     setPdiDate("");
//     setAddress("");
//     setDealer("");
//     setNotes("");
//     if (isAdm) {
//         setCustomerName("");
//         setCustomerMobile("");
//       }
//   } catch (error) {
//     console.error("Error creating PDI:", error);
//     setErrorMessage("Failed to create PDI. Please try again later.");
//   }
// };

//   return (
//     <div className="min-h-screen bg-primary px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 font-sans">
//       <div className="mt-12 sm:mt-16 md:mt-20 flex flex-col md:flex-row justify-center items-center md:items-start gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-7xl mx-auto">
//         {/* Left side (title & image) */}
//         <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center">
//           <motion.h2
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8"
//           >
//             Request Vehicle Inspection
//           </motion.h2>

//           <motion.img
//             key={selectedImage}
//             src={selectedImage}
//             alt="Vehicle"
//             initial={{ scale: 0.8, opacity: 0, y: 50 }}
//             animate={{
//               scale: 1,
//               opacity: 1,
//               y: 0,
//               transition: { duration: 0.8, ease: "easeOut" },
//             }}
//             className="w-full max-w-[300px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[530px] mt-4 sm:mt-6 md:mt-8 object-contain drop-shadow-lg"
//           />

//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             onClick={() => generateInspectionPDF(sampleReport)}
//             className="text-blue-600 text-sm sm:text-base md:text-lg mt-6 sm:mt-8 md:mt-10 font-body flex items-center gap-2 hover:underline bg-transparent border-none cursor-pointer"
//           >
//             Download Sample Report <FaDownload />
//           </motion.button>
//         </div>

//         {/* Right side (form) */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.4 }}
//           className="w-full max-w-[360px] sm:max-w-[400px] md:max-w-[450px] md:w-1/2 bg-white border border-button p-4 sm:p-5 md:p-6 lg:p-8 rounded-2xl shadow-xl shadow-gray-300/60"
//         >
//           <h3 className="text-lg sm:text-xl md:text-2xl font-body mb-3 md:mb-4 text-gray-800">
//             Vehicle Details
//           </h3>

//           {/* Error Message */}
//           {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

//           <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>

//             {isAdm && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Customer Name"
//                   required
//                   value={customerName}
//                   onChange={(e) => setCustomerName(e.target.value)}
//                   className="w-full border border-gray-300 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-button"
//                 />
//                 <input
//                   type="tel"
//                   placeholder="Customer Mobile"
//                   required
//                   value={customerMobile}
//                   onChange={(e) => setCustomerMobile(e.target.value)}
//                   className="w-full border border-gray-300 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-button"
//                 />
//               </>
//             )}

//             <SelectField
//               label="Select Brand"
//               required
//               value={selectedBrand}
//               onChange={handleBrandChange}
//               options={brands.map((b) => ({ label: b.brand, value: b.brand }))}
//               open={open.brand}
//               toggle={() => toggle("brand")}
//             />

//             <SelectField
//               label="Select Model"
//               required
//               disabled={!selectedBrand}
//               value={selectedModel}
//               onChange={handleModelChange}
//               options={models.map((m) => ({ label: m.name, value: m.name }))}
//               open={open.model}
//               toggle={() => toggle("model")}
//             />

//             <SelectField
//               label="Select Variant"
//               required
//               disabled={!selectedModel}
//               value={selectedVariant}
//               onChange={handleVariantChange}
//               options={variants.map((v) => ({ label: v.name, value: v.name }))}
//               open={open.variant}
//               toggle={() => toggle("variant")}
//             />

//             <div className="grid grid-cols-2 gap-3 md:gap-4">
//               <input
//                 type="text"
//                 readOnly
//                 value={transmission}
//                 placeholder="Transmission"
//                 className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 bg-gray-50 text-sm sm:text-base"
//               />
//               <input
//                 type="text"
//                 readOnly
//                 value={fuel}
//                 placeholder="Fuel Type"
//                 className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 bg-gray-50 text-sm sm:text-base"
//               />
//             </div>

//             <input
//               type="text"
//               placeholder="Dealer Name"
//               required
//               value={dealer}
//               onChange={(e) => setDealer(e.target.value)}
//               className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-button"
//             />

//             <input
//               type="text"
//               placeholder="Address"
//               required
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-button"
//             />

//             <SelectField
//               label="Select Car Status"
//               required
//               value={carStatus}
//               onChange={(e) => setCarStatus(e.target.value)}
//               options={carStatusOptions}
//               open={open.status}
//               toggle={() => toggle("status")}
//             />

//             <input
//               type="date"
//               required
//               min={today}
//               value={pdiDate}
//               onChange={(e) => setPdiDate(e.target.value)}
//               className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-button"
//             />

//             <textarea
//               placeholder="Notes (optional)"
//               rows={2}
//               value={note}
//               onChange={(e) => setNotes(e.target.value)}
//               className="w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-button"
//             />

//             <label className="flex items-start gap-2 text-xs sm:text-sm md:text-base text-gray-700">
//               <input
//                 type="checkbox"
//                 required
//                 className="mt-0.5 h-4 w-4 text-button rounded focus:ring-button"
//               />
//               I confirm the above information is accurate.
//             </label>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               className="w-full bg-button text-white py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg font-bold rounded-xl hover:bg-green-700 transition shadow-md"
//             >
//               Book PDI Now
//             </motion.button>
//           </form>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// const SelectField = ({
//   label,
//   value,
//   onChange,
//   options,
//   open,
//   toggle,
//   disabled = false,
//   required = true,
// }) => (
//   <div className="relative">
//     <motion.div whileHover={{ scale: 1.01 }} className="w-full">
//       <select
//         value={value}
//         required={required}
//         disabled={disabled}
//         onChange={onChange}
//         onFocus={toggle}
//         onBlur={() => setTimeout(toggle, 200)}
//         className={`w-full border border-gray-300 rounded-xl p-2 sm:p-2.5 md:p-3 text-sm sm:text-base appearance-none focus:outline-none focus:ring-2 focus:ring-button transition ${
//           disabled ? "bg-gray-50 cursor-not-allowed" : "cursor-pointer"
//         }`}
//       >
//         <option value="">{label}</option>
//         {options.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//       <motion.div
//         animate={{ rotate: open ? 180 : 0 }}
//         transition={{ duration: 0.2 }}
//         className="absolute right-2 sm:right-3 top-2.5 sm:top-3 md:top-3.5 text-gray-400 pointer-events-none"
//       >
//         <FaChevronDown className="h-4 w-4" />
//       </motion.div>
//     </motion.div>
//   </div>
// );

// export default Request;

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaDownload, FaChevronDown } from "react-icons/fa";
import jeepImage from "../../assets/honda_elevate.png";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import generateInspectionPDF from "../admin/InspectionReportPdf";
import sampleReport from "../../components/constants/publicData/SampleReportData";
import { useAuth } from "../../core/contexts/AuthContext";

const carStatusOptions = [
  { value: "new", label: "New Car" },
  { value: "used", label: "Used Car" },
];

const Request = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = new URLSearchParams(useLocation().search);
  const isAdm = query.get("isAdm") === "true";

  // Form state
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [carStatus, setCarStatus] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [pdiDate, setPdiDate] = useState("");
  const [note, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [dealer, setDealer] = useState("");
  const [selectedImage, setSelectedImage] = useState(jeepImage);
  const [errorMessage, setErrorMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  const [open, setOpen] = useState({
    brand: false,
    model: false,
    variant: false,
    status: false,
  });

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const today = new Date().toISOString().split("T")[0];

  // Initialize customer info for non-admin
  useEffect(() => {
    if (!isAdm && user) {
      setCustomerName(user.name);
      setCustomerMobile(user.mobile);
    }
  }, [isAdm, user]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_VEHICLES
        );
        const data = response?.data?.data || [];

        // Unique brands and models
        const uniqueBrands = Object.values(
          data.reduce((acc, curr) => {
            if (!acc[curr.brand]) acc[curr.brand] = curr;
            return acc;
          }, {})
        );

        setBrands(uniqueBrands);
        setVehicles(data);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      }
    };
    fetchVehicles();
  }, []);

  // Handlers for brand, model, variant selection
  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setSelectedModel("");
    setSelectedVariant("");
    setSelectedImage(jeepImage);
    setTransmission("");
    setFuel("");

    const uniqueModelsForBrand = Object.values(
      vehicles
        .filter((v) => v.brand === brand)
        .reduce((acc, curr) => {
          if (!acc[curr.model])
            acc[curr.model] = { name: curr.model, image: curr.imageUrl };
          return acc;
        }, {})
    );

    setModels(uniqueModelsForBrand);
    setVariants([]);
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    setSelectedVariant("");
    setTransmission("");
    setFuel("");

    const uniqueVariantsForModel = Object.values(
      vehicles
        .filter((v) => v.model === model)
        .reduce((acc, curr) => {
          if (!acc[curr.variant]) acc[curr.variant] = { name: curr.variant };
          return acc;
        }, {})
    );

    setVariants(uniqueVariantsForModel);

    const img = vehicles.find((x) => x.model === model)?.imageUrl || jeepImage;
    setSelectedImage(img);
  };

  const handleVariantChange = (e) => {
    const variant = e.target.value;
    setSelectedVariant(variant);

    const variantObj = vehicles.find((x) => x.variant === variant);
    setTransmission(variantObj?.transmissionType || "");
    setFuel(variantObj?.fuelType || "");
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBrand || !selectedModel || !selectedVariant || !carStatus) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      brand: selectedBrand,
      model: selectedModel,
      variant: selectedVariant,
      transmissionType: transmission,
      fuelType: fuel,
      imageUrl: selectedImage,
      dealerName: dealer,
      address,
      carStatus,
      date: pdiDate,
      notes: note,
      customerName: isAdm ? customerName : user?.name || "",
      customerMobile: isAdm ? customerMobile : user?.mobile || "",
    };

    try {
      await new ApiService().apipost(ServerUrl.API_PDI_CREATE, payload);
      toast.success("Vehicle PDI Created successfully!");
      setTimeout(() => navigate("/success"), 1000);

      // Reset form
      setSelectedBrand("");
      setSelectedModel("");
      setSelectedVariant("");
      setTransmission("");
      setFuel("");
      setCarStatus("");
      setSelectedImage(jeepImage);
      setPdiDate("");
      setAddress("");
      setDealer("");
      setNotes("");
      if (isAdm) {
        setCustomerName("");
        setCustomerMobile("");
      }
      setErrorMessage("");
    } catch (error) {
      console.error("Error creating PDI:", error);
      setErrorMessage("Failed to create PDI. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-primary px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 sm:py-10 font-sans">
      <div className="mt-12 sm:mt-16 md:mt-20 flex flex-col md:flex-row justify-center items-center md:items-start gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-7xl mx-auto">
        {/* Left side: Title & Image */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8"
          >
            Request Vehicle Inspection
          </motion.h2>

          <motion.img
            key={selectedImage}
            src={`${ServerUrl.IMAGE_URL}${selectedImage}`}
            alt="Vehicle"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: "easeOut" },
            }}
            className="w-full max-w-[500px] mt-4 sm:mt-6 md:mt-8 object-contain drop-shadow-lg"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => generateInspectionPDF(sampleReport)}
            className="text-blue-600 text-sm sm:text-base md:text-lg mt-6 sm:mt-8 md:mt-10 font-body flex items-center gap-2 hover:underline bg-transparent border-none cursor-pointer"
          >
            Download Sample Report <FaDownload />
          </motion.button>
        </div>

        {/* Right side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[450px] md:w-1/2 bg-white border border-button p-6 lg:p-8 rounded-2xl shadow-xl shadow-gray-300/60"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-body mb-4 text-gray-800">
            Vehicle Details
          </h3>
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isAdm && (
              <>
                <input
                  type="text"
                  placeholder="Customer Name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-button"
                />
                <input
                  type="tel"
                  placeholder="Customer Mobile"
                  required
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-button"
                />
              </>
            )}

            <SelectField
              label="Select Brand"
              value={selectedBrand}
              onChange={handleBrandChange}
              options={brands.map((b) => ({ label: b.brand, value: b.brand }))}
              open={open.brand}
              toggle={() => toggle("brand")}
            />
            <SelectField
              label="Select Model"
              value={selectedModel}
              onChange={handleModelChange}
              options={models.map((m) => ({ label: m.name, value: m.name }))}
              open={open.model}
              toggle={() => toggle("model")}
              disabled={!selectedBrand}
            />
            <SelectField
              label="Select Variant"
              value={selectedVariant}
              onChange={handleVariantChange}
              options={variants.map((v) => ({ label: v.name, value: v.name }))}
              open={open.variant}
              toggle={() => toggle("variant")}
              disabled={!selectedModel}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                readOnly
                value={transmission}
                placeholder="Transmission"
                className="w-full border border-gray-300 rounded-xl p-2 bg-gray-50 text-base"
              />
              <input
                type="text"
                readOnly
                value={fuel}
                placeholder="Fuel Type"
                className="w-full border border-gray-300 rounded-xl p-2 bg-gray-50 text-base"
              />
            </div>

            <input
              type="text"
              placeholder="Dealer Name"
              required
              value={dealer}
              onChange={(e) => setDealer(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-button"
            />
            <input
              type="text"
              placeholder="Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-button"
            />
            <SelectField
              label="Select Car Status"
              value={carStatus}
              onChange={(e) => setCarStatus(e.target.value)}
              options={carStatusOptions}
              open={open.status}
              toggle={() => toggle("status")}
            />
            <input
              type="date"
              required
              min={today}
              value={pdiDate}
              onChange={(e) => setPdiDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 text-base focus:outline-none focus:ring-2 focus:ring-button"
            />
            <textarea
              placeholder="Notes (optional)"
              rows={2}
              value={note}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-button"
            />

            <label className="flex items-start gap-2 text-base text-gray-700">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-button rounded focus:ring-button"
              />
              I confirm the above information is accurate.
            </label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-button text-white py-3 text-lg font-bold rounded-xl hover:bg-green-700 transition shadow-md"
            >
              Book PDI Now
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  open,
  toggle,
  disabled = false,
  required = true,
}) => (
  <div className="relative">
    <motion.div whileHover={{ scale: 1.01 }} className="w-full">
      <select
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onFocus={toggle}
          onBlur={() => setTimeout(() => setOpen(false), 200)} 
        className={`w-full border border-gray-300 rounded-xl p-3 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-button ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <motion.div
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute right-3 top-3 text-gray-400 pointer-events-none"
      >
        <FaChevronDown className="h-4 w-4" />
      </motion.div>
    </motion.div>
  </div>
);

export default Request;
