import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowBack, CheckCircle, LocationOn } from "@mui/icons-material";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { toast } from "react-toastify";

const timeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
];

const AssignEngineer = ({ request, onAssign, onBack, setModalOpen }) => {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [locationFilter, setLocationFilter] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    // const fetchEngineers = async () => {
    //   try {
    //     const response = await new ApiService().apiget(ServerUrl.API_GET_ALL_USERS_BY_ROLES + '/engineer');
    //     if (response?.data) setEngineers(response.data);
    //   } catch (err) {
    //     console.error("Failed to fetch engineers", err);
    //     toast.error("Failed to fetch engineers");
    //   }
    // };

    const fetchEngineers = async () => {
      try {
        // Add query param to include inactive engineers if backend supports it
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_ALL_USERS_BY_ROLES +
            "/engineer?includeInactive=true"
        );
        if (response?.data) setEngineers(response.data);
      } catch (err) {
        console.error("Failed to fetch engineers", err);
        toast.error("Failed to fetch engineers");
      }
    };

    const fetchCities = async () => {
      try {
        const response = await new ApiService().apiget(
          ServerUrl.API_GET_LOCATIONS
        );
        if (response?.data?.locations)
          setLocationFilter(response.data.locations);
        else setLocationFilter([]);
      } catch (err) {
        console.error("Failed to fetch Locations", err);
        toast.error("Failed to fetch locations");
      }
    };

    fetchCities();
    fetchEngineers();
  }, []);

  const handleSelectEngineer = (engineer) => setSelectedEngineer(engineer);

  const handleConfirmAssignment = async () => {
    if (!selectedEngineer || !selectedSlot || !selectedLocation) {
      toast.warn("Please select engineer, location and time slot correctly!");
      return;
    }

    try {
      const payload = {
        requestId: request._id,
        engineerId: selectedEngineer._id,
        location: selectedLocation,
        timeSlot: selectedSlot,
      };

      console.log("Assigning:", payload);

      const response = await new ApiService().apiput(
        ServerUrl.API_ASSIGN_ENGINEER,
        payload
      );
      if (response.data) {
        toast.success("Engineer assigned successfully!");
        setModalOpen(false);
      } else {
        toast.error(
          "Failed to assign engineer: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error assigning engineer:", error);
      toast.error("An error occurred while assigning engineer ");
    }
  };

  if (!request || !request._id) return <div>Request not found</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-green-700 hover:text-green-500"
        >
          <ArrowBack />
        </button>
        <div>
          <h2 className="text-green-700 font-bold text-lg">Assign Engineer</h2>
          <p className="text-green-700">
            Request #{request.bookingId || request._id}
          </p>
        </div>
        <div></div>
      </div>
      <hr className="border-green-100 mb-4" />

      {/* Filters */}
      <div className="mb-4">
        <label className="block text-green-700 mb-1">Filter by Location</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full border border-green-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Location</option>
          {locationFilter.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-green-700 mb-1">Time Slot</label>
        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
          className="w-full border border-green-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Time Slot</option>
          {timeSlots.map((slot, idx) => (
            <option key={idx} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      {/* Engineers list */}
      <div className="max-h-96 overflow-y-auto border border-green-200 rounded p-2 bg-green-50">
        {engineers.length === 0 ? (
          <p className="text-green-700 text-sm">No engineers available</p>
        ) : (
          engineers.map((engineer, index) => (
            // <motion.div
            //   key={engineer._id}
            //   initial={{ opacity: 0, y: 20 }}
            //   animate={{ opacity: 1, y: 0 }}
            //   transition={{ delay: index * 0.05 }}
            //   onClick={() => handleSelectEngineer(engineer)}
            //   className={`flex items-center justify-between p-3 mb-2 rounded shadow-sm cursor-pointer
            //     ${selectedEngineer?._id === engineer._id ? 'bg-green-200 border-l-4 border-green-700' : 'bg-green-100 hover:bg-green-50'}`}
            // >
            //   <div className="flex items-center gap-3">
            //     <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-lg font-bold">
            //       {engineer.name.charAt(0)}
            //     </div>
            //     <div>
            //       <p className="font-bold text-green-700">{engineer.name}</p>
            //       <p className="flex items-center text-green-700 text-sm gap-1">
            //         <LocationOn className="w-4 h-4" /> {engineer.engineer_location}
            //       </p>
            //       <p className="text-green-700 text-sm">{engineer.engineer_mobile}</p>
            //     </div>
            //   </div>
            //   {selectedEngineer?._id === engineer._id && <CheckCircle className="text-green-700 w-6 h-6" />}
            // </motion.div>

            <motion.div
              key={engineer._id}
              onClick={() => {
                if (!engineer.active) return; // Prevent selection of inactive engineers
                handleSelectEngineer(engineer);
              }}
              className={`flex items-center justify-between p-3 mb-2 rounded shadow-sm cursor-pointer
    ${!engineer.active ? "opacity-50 cursor-not-allowed" : ""}
    ${
      selectedEngineer?._id === engineer._id
        ? "bg-green-200 border-l-4 border-green-700"
        : "bg-green-100 hover:bg-green-50"
    }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-700 text-white flex items-center justify-center text-lg font-bold">
                  {engineer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-green-700">
                    {engineer.name} {!engineer.active && "(Inactive)"}
                  </p>
                  <p className="flex items-center text-green-700 text-sm gap-1">
                    <LocationOn className="w-4 h-4" />{" "}
                    {engineer.engineer_location}
                  </p>
                  <p className="text-green-700 text-sm">
                    {engineer.engineer_mobile}
                  </p>
                </div>
              </div>
              {selectedEngineer?._id === engineer._id && (
                <CheckCircle className="text-green-700 w-6 h-6" />
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onBack}
          className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded border border-green-700 hover:bg-green-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirmAssignment}
          disabled={!selectedEngineer || !selectedSlot || !selectedLocation}
          className={`flex items-center gap-1 px-4 py-2 rounded font-bold 
            ${
              !selectedEngineer || !selectedSlot || !selectedLocation
                ? "bg-green-200 text-green-700 border border-green-700 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
        >
          <CheckCircle /> Confirm Assignment
        </button>
      </div>
    </div>
  );
};

export default AssignEngineer;
