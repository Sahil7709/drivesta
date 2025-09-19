import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiEye, FiDownload, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { APPLICATION_CONSTANTS } from "../../core/constants/app.constant";
import { useAuth } from "../../core/contexts/AuthContext";
import generateInvoicePdf from "./InvoiceGeneratePdf";

const PaymentManagement = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const adminRoles = ["admin", "superadmin"];
  const isAdminRole = adminRoles.includes(user?.role);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const url = id
          ? `${ServerUrl.API_GET_REQUEST_BY_ID}/${id}`
          : ServerUrl.API_GET_ALLPDIREQUEST;

        const res = await new ApiService().apiget(url);
        const data = id ? [res.data.data] : res.data.data || [];

        const mapped = data
          .map((item) => ({
            id: item._id,
            bookingId: item.bookingId || "N/A",
            customerName: item.customerName || "Unknown",
            customerMobile: item.customerMobile || "N/A",
            address: item.address || "N/A",
            brand: item.brand || "-",
            model: item.model || "-",
            variant: item.variant || "-",
            amount: item.amount || 0,
            pdiDate: item.date || "N/A",
            status: item.status?.toUpperCase() || "PENDING",
            paymentStatus: item.paymentStatus || "Unpaid",
            paymentMode: item.paymentMode || "N/A",
          }))
          .filter(
            (p) =>
              p.status === "ADMIN_APPROVED" || p.status === "COMPLETED"
          );

        setPayments(mapped);
      } catch (err) {
        console.error("Error fetching payments:", err);
        toast.error("Failed to fetch payments");
        setPayments([]);
      }
    };

    fetchPayments();
  }, [id]);

  const downloadInvoice = async (p) => {
    try {
      toast.info("Your Invoice is being generated, please wait...");
      await generateInvoicePdf(p);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error("Failed to generate invoice.");
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerMobile.includes(searchTerm)
  );

  const updatePaymentStatus = async (payment) => {
    if (!isAdminRole) return;
    try {
      const requestId = payment.id;
      const newRequestStatus =
        payment.status ===
        APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED.value
          ? APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value
          : payment.status;

      const res = await new ApiService().apiput(
        `${ServerUrl.API_UPDATE_PAYMENT_STATUS}/${requestId}`,
        {
          paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
          status: newRequestStatus,
        }
      );

      if (res.data && res.data.data) {
        toast.success("Payment and request status updated successfully")
        setPayments((prev) =>
          prev.map((p) =>
            p.id === requestId
              ? {
                  ...p,
                  paymentStatus:
                    APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
                  status: newRequestStatus,
                }
              : p
          )
        );

        if (selectedPayment?.id === requestId) {
          setSelectedPayment((prev) => ({
            ...prev,
            paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
            status: newRequestStatus,
          }));
        }
      } else {
        toast.error("Failed to update payment/request status");
      }
    } catch (err) {
      console.error("Error updating payment/request status:", err);
      toast.error("Failed to update payment/request status");
    }
  };

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-button mb-6">
        Payment Management
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:flex-1 px-4 py-2 border border-button rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-sm sm:text-base">
          <thead className="bg-green-50 text-button">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Booking ID</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    {p.customerName.charAt(0)}
                  </div>
                  <div>
                    <p>{p.customerName}</p>
                    <p className="text-gray-500 text-sm">
                      {p.customerMobile}
                    </p>
                  </div>
                </td>
                <td className="p-3">{p.bookingId}</td>
                <td className="p-3">
                  <div>{p.brand} {p.model}</div>
                  <div>{p.variant}</div>
                </td>
                <td className="p-3">
                  ₹{p.amount.toLocaleString("en-IN")}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      p.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  {/* Eye (all roles) */}
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  {/* Download (all roles) */}
                  <button
                    onClick={() => downloadInvoice(p)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  {/* Mark as Paid (only admin/superadmin) */}
                  {isAdminRole && p.paymentStatus !== "PAID" && (
                    <button
                      onClick={() => updatePaymentStatus(p)}
                      className="text-green-600 hover:text-green-800 "
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-lg max-w-lg w-full shadow-xl z-10 p-6">
            <h2 className="text-lg font-bold mb-4">
              {selectedPayment.customerName} - {selectedPayment.bookingId}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong>Mobile:</strong> {selectedPayment.customerMobile}</p>
              <p><strong>Address:</strong> {selectedPayment.address}</p>
              <p><strong>Vehicle:</strong> {selectedPayment.brand} {selectedPayment.model} {selectedPayment.variant}</p>
              <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString("en-IN")}</p>
              <p><strong>PDI Date:</strong> {selectedPayment.pdiDate}</p>
              <p><strong>Status:</strong> {selectedPayment.paymentStatus}</p>
              <p><strong>Request Status:</strong> {selectedPayment.status}</p>
            </div>

            <div className="mt-6 flex gap-3">
              {/* Download (all roles) */}
              <button
                onClick={() => downloadInvoice(selectedPayment)}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
              >
                <FiDownload className="w-5 h-5 mr-1" /> Download
              </button>

              {/* Mark as Paid (only admin/superadmin) */}
              {isAdminRole && selectedPayment.paymentStatus !== "Paid" && (
                <button
                  onClick={() => updatePaymentStatus(selectedPayment)}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-md flex items-center"
                >
                  <FiCheck className="w-5 h-5 mr-1" /> Mark as Paid
                </button>
              )}

              {/* Close (all roles) */}
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 border text-gray-600 rounded-md flex items-center"
              >
                <FiX className="w-5 h-5 mr-1" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
