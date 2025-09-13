import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";

const RequestSuccess = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPDIRequest = async () => {
      try {
        const response = await new ApiService().apiget(ServerUrl.API_GET_ALLPDIREQUEST);
        if (response?.data?.data?.length > 0) {
          const latestRequest = response.data.data[response.data.data.length - 1];
          setData(latestRequest);
        }
      } catch (err) {
        console.error("Failed to fetch PDI requests", err);
      }
    };

    fetchPDIRequest();
  }, []);

  if (!data) return null;

  const { bookingId, brand, model, imageUrl } = data;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center font-sans px-4 py-8 sm:px-6 md:px-10 lg:px-16">
      <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-14 lg:py-16 text-center">
        
        {/* Heading */}
        <h1 className="text-green-700 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3">
          Congratulations, your PDI is booked successfully!
        </h1>

        {/* Booking Details */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 text-xs sm:text-sm md:text-base mb-4">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <FaCheckCircle className="text-green-600 text-base sm:text-lg md:text-xl" />
            <p>
              <strong>Booking ID:</strong> {bookingId}
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <strong>Brand:</strong> {brand}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <strong>Model:</strong> {model}
          </div>
        </div>

        {/* Subtext */}
        <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-6">
          Our team will reach out soon to finalize your appointment.
        </p>

        {/* Vehicle Image */}
        <img
          src={`${ServerUrl.IMAGE_URL}${imageUrl}`}
          alt={`${brand} ${model}`}
          className="mx-auto w-full max-w-[250px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] object-contain mb-6"
        />
        
        {/* Button */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="bg-green-800 hover:bg-green-900 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-md transition text-sm sm:text-base md:text-lg"
          >
            Go to your Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestSuccess;