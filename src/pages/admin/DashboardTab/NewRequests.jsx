import React, { useEffect, useState } from "react";
import { FiUser, FiPhone, FiCalendar, FiTruck } from "react-icons/fi";
import RequestDetails from "./RequestDetails";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import { APPLICATION_CONSTANTS } from "../../../core/constants/app.constant";
import { useNavigate } from "react-router-dom";
import RequestForm from "../../customer/RequestForm";

const NewRequests = ({ setViewMode }) => {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchPDIRequests(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      fetchPDIRequests(true);
    }
  }, [modalOpen]);

  const fetchPDIRequests = async (isMounted) => {
    try {
      setLoading(true);
      const api = new ApiService();
      const { data } = await api.apipost(
        ServerUrl.API_GET_ALL_PDIREQUEST_STATUSES,
        [APPLICATION_CONSTANTS.REQUEST_STATUS.NEW.value]
      );

      if (isMounted && Array.isArray(data?.data)) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch PDI requests:", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const handleAssignClick = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleAssignEngineer = (id, engineer, slot) => {
    const updated = requests.map((r) =>
      r.id === id
        ? { ...r, assignedEngineer: engineer.name, slot, status: "assigned" }
        : r
    );
    setRequests(updated);
    setModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-button">New Requests</h2>
        <button
          onClick={() => {
            navigate(`/request?isAdm=true`);
          }}
          className="px-4 py-2 bg-button text-white rounded-lg shadow hover:bg-green-500 transition"
        >
          + New Request
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {requests.filter((r) => r.status === "NEW").length === 0 ? (
          <p className="text-center text-button col-span-full py-4">
            No new requests available
          </p>
        ) : (
          requests
            .filter((r) => r.status === "NEW")
            .map((r) => (
              <div
                key={r.id || r._id}
                className="bg-white border-l-4 border-green-500 rounded-lg shadow hover:shadow-md p-4 flex flex-col justify-between transition"
              >
                <div>
                  <h3 className="font-semibold text-button flex items-center">
                    <FiUser className="mr-2" />
                    {r.customerName || "Unknown Customer"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="bg-green-100 text-button px-2 py-0.5 rounded text-xs font-semibold">
                      #{r.bookingId}
                    </span>
                  </p>
                </div>

                <div className="mt-3 text-gray-600 text-sm space-y-1">
                  <p className="flex items-center">
                    <FiTruck className="mr-2 text-gray-500" />
                    {`${r.brand} ${r.model} ${r.variant}` || "Not provided"} 
                  </p>
                  <p className="flex items-center">
                    <FiPhone className="mr-2 text-gray-500" />
                    {r.customerMobile || "Not provided"}
                  </p>
                  <p className="flex items-center">
                    <FiCalendar className="mr-2 text-gray-500" />
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>

                <button
                  onClick={() => handleAssignClick(r)}
                  className="mt-4 px-3 py-2 bg-button text-white rounded-lg shadow hover:bg-green-600 transition text-sm"
                >
                  Assign Engineer
                </button>
              </div>
            ))
        )}
      </div>

      {/* Assign Engineer Modal */}
      <RequestDetails
        open={modalOpen}
        onClose={() => {
          setSelectedRequest(null);
          setModalOpen(false);
        }}
        request={selectedRequest}
        onAssign={handleAssignEngineer}
        setModalOpen={setModalOpen}
      />
    </div>
  );
};

export default NewRequests;
