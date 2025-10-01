// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { FiEye, FiDownload, FiCheck, FiX } from "react-icons/fi";
// import { toast } from "react-toastify";
// import ApiService from "../../core/services/api.service";
// import ServerUrl from "../../core/constants/serverUrl.constant";
// import { APPLICATION_CONSTANTS } from "../../core/constants/app.constant";
// import { useAuth } from "../../core/contexts/AuthContext";
// import generateInvoicePdf from "./InvoiceGeneratePdf";

// const PaymentManagement = () => {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const [payments, setPayments] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [showPaymentMethodPopup, setShowPaymentMethodPopup] = useState(false);
//   const [paymentMode, setPaymentMode] = useState("");
//   const [pendingPayment, setPendingPayment] = useState(null);

//   const adminRoles = ["admin", "superadmin"];
//   const isAdminRole = adminRoles.includes(user?.role);

//   useEffect(() => {
//     const fetchPayments = async () => {
//       try {
//         const url = id
//           ? `${ServerUrl.API_GET_REQUEST_BY_ID}/${id}`
//           : ServerUrl.API_GET_ALLPDIREQUEST;

//         const res = await new ApiService().apiget(url);
//         const data = id ? [res.data.data] : res.data.data || [];

//         const mapped = data
//           .map((item) => ({
//             id: item._id,
//             bookingId: item.bookingId || "N/A",
//             customerName: item.customerName || "Unknown",
//             customerMobile: item.customerMobile || "N/A",
//             address: item.address || "N/A",
//             brand: item.brand || "-",
//             model: item.model || "-",
//             variant: item.variant || "-",
//             amount: item.amount || 0,
//             pdiDate: item.date || "N/A",
//             status: item.status?.toUpperCase() || "PENDING",
//             paymentStatus: item.paymentStatus?.toUpperCase() || "UNPAID",
//             paymentMode: item.paymentMode || "N/A",
//           }))
//           .filter(
//             (p) =>
//               p.status === "ADMIN_APPROVED" || p.status === "COMPLETED"
//           );

//         setPayments(mapped);
//       } catch (err) {
//         console.error("Error fetching payments:", err);
//         toast.error("Failed to fetch payments");
//         setPayments([]);
//       }
//     };

//     fetchPayments();
//   }, [id]);

//   const downloadInvoice = async (p) => {
//     try {
//       toast.info("Your Invoice is being generated, please wait...");
//       await generateInvoicePdf(p);
//       toast.success("Invoice downloaded!");
//     } catch (err) {
//       toast.error("Failed to generate invoice.");
//     }
//   };

//   const filteredPayments = payments.filter(
//     (p) =>
//       p.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       p.customerMobile.includes(searchTerm)
//   );

//   const updatePaymentStatus = async (payment, selectedMode) => {
//     if (!isAdminRole) return;
//     try {
//       const requestId = payment.id;
//       const newRequestStatus =
//         payment.status === APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED.value
//           ? APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value
//           : payment.status;

//       const res = await new ApiService().apiput(
//         `${ServerUrl.API_UPDATE_PAYMENT_STATUS}/${requestId}`,
//         {
//           paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
//           status: newRequestStatus,
//           paymentMode: selectedMode || payment.paymentMode || "CASH",
//           paymentDate: new Date().toISOString(), // store payment date dynamically
//         }
//       );

//       if (res.data && res.data.data) {
//         toast.success("Payment and request status updated successfully");
//         setPayments((prev) =>
//           prev.map((p) =>
//             p.id === requestId
//               ? {
//                   ...p,
//                   paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
//                   status: newRequestStatus,
//                   paymentMode: selectedMode || p.paymentMode,
//                 }
//               : p
//           )
//         );

//         if (selectedPayment?.id === requestId) {
//           setSelectedPayment((prev) => ({
//             ...prev,
//             paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
//             status: newRequestStatus,
//             paymentMode: selectedMode || prev.paymentMode,
//           }));
//         }
//       } else {
//         toast.error("Failed to update payment/request status");
//       }
//     } catch (err) {
//       console.error("Error updating payment/request status:", err);
//       toast.error("Failed to update payment/request status");
//     } finally {
//       setShowPaymentMethodPopup(false);
//       setPaymentMode("");
//       setPendingPayment(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-primary p-4 sm:p-6 md:p-8">
//       <h1 className="text-3xl font-bold text-button mb-6">Payment Management</h1>

//       <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
//         <input
//           type="text"
//           placeholder="Search payments..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full sm:flex-1 px-4 py-2 border border-button rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//       </div>

//       <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
//         <table className="w-full text-left text-sm sm:text-base">
//           <thead className="bg-green-50 text-button">
//             <tr>
//               <th className="p-3">Customer</th>
//               <th className="p-3">Booking ID</th>
//               <th className="p-3">Vehicle</th>
//               <th className="p-3">Amount</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredPayments.map((p) => (
//               <tr key={p.id} className="border-b hover:bg-gray-50">
//                 <td className="p-3 flex items-center gap-3">
//                   <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
//                     {p.customerName.charAt(0)}
//                   </div>
//                   <div>
//                     <p>{p.customerName}</p>
//                     <p className="text-gray-500 text-sm">{p.customerMobile}</p>
//                   </div>
//                 </td>
//                 <td className="p-3">{p.bookingId}</td>
//                 <td className="p-3">
//                   <div>{p.brand} {p.model}</div>
//                   <div>{p.variant}</div>
//                 </td>
//                 <td className="p-3">₹{p.amount.toLocaleString("en-IN")}</td>
//                 <td className="p-3">
//                   <span
//                     className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
//                       p.paymentStatus === "PAID"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}
//                   >
//                     {p.paymentStatus}
//                   </span>
//                 </td>
//                 <td className="p-3 flex space-x-2">
//                   <button
//                     onClick={() => setSelectedPayment(p)}
//                     className="text-blue-600 hover:text-blue-800"
//                   >
//                     <FiEye className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => downloadInvoice(p)}
//                     className="text-gray-600 hover:text-gray-800 cursor-pointer"
//                   >
//                     <FiDownload className="w-5 h-5" />
//                   </button>
//                   {isAdminRole && p.paymentStatus !== "PAID" && (
//                     <button
//                       onClick={() => {
//                         setPendingPayment(p);
//                         setShowPaymentMethodPopup(true);
//                       }}
//                       className="text-green-600 hover:text-green-800"
//                     >
//                       <FiCheck className="w-5 h-5" />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {selectedPayment && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
//           <div className="relative bg-white rounded-lg max-w-lg w-full shadow-xl z-10 p-6">
//             <h2 className="text-lg font-bold mb-4">
//               {selectedPayment.customerName} - {selectedPayment.bookingId}
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <p><strong>Mobile:</strong> {selectedPayment.customerMobile}</p>
//               <p><strong>Address:</strong> {selectedPayment.address}</p>
//               <p><strong>Vehicle:</strong> {selectedPayment.brand} {selectedPayment.model} {selectedPayment.variant}</p>
//               <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString("en-IN")}</p>
//               <p><strong>PDI Date:</strong> {selectedPayment.pdiDate}</p>
//               <p><strong>Status:</strong> {selectedPayment.paymentStatus}</p>
//               <p><strong>Request Status:</strong> {selectedPayment.status}</p>
//             </div>

//             <div className="mt-6 flex gap-3">
//               <button
//                 onClick={() => downloadInvoice(selectedPayment)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
//               >
//                 <FiDownload className="w-5 h-5 mr-1" /> Download
//               </button>

//               {isAdminRole && selectedPayment.paymentStatus !== "PAID" && (
//                 <button
//                   onClick={() => {
//                     setPendingPayment(selectedPayment);
//                     setShowPaymentMethodPopup(true);
//                   }}
//                   className="px-4 py-2 border border-green-600 text-green-600 rounded-md flex items-center"
//                 >
//                   <FiCheck className="w-5 h-5 mr-1" /> Mark as Paid
//                 </button>
//               )}

//               <button
//                 onClick={() => setSelectedPayment(null)}
//                 className="px-4 py-2 border text-gray-600 rounded-md flex items-center"
//               >
//                 <FiX className="w-5 h-5 mr-1" /> Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showPaymentMethodPopup && pendingPayment && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
//           <div className="relative bg-white rounded-lg max-w-xs w-full shadow-xl z-10 p-6">
//             <h3 className="text-lg font-bold mb-4">Select Payment Mode</h3>
//             <select
//               className="w-full border px-3 py-2 rounded mb-4"
//               value={paymentMode}
//               onChange={(e) => setPaymentMode(e.target.value)}
//             >
//               <option value="">-- Select --</option>
//               <option value="CASH">Cash</option>
//               <option value="ONLINE">Online</option>
//               <option value="UPI">UPI</option>
//               <option value="CARD">Card</option>
//             </select>
//             <div className="flex gap-2">
//               <button
//                 className="px-4 py-2 bg-green-600 text-white rounded"
//                 disabled={!paymentMode}
//                 onClick={() => updatePaymentStatus(pendingPayment, paymentMode)}
//               >
//                 Mark as Paid
//               </button>
//               <button
//                 className="px-4 py-2 border rounded"
//                 onClick={() => {
//                   setShowPaymentMethodPopup(false);
//                   setPaymentMode("");
//                   setPendingPayment(null);
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentManagement;

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

  // popup states
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [pendingPayment, setPendingPayment] = useState(null);

  const isAdminRole = ["admin", "superadmin"].includes(user?.role);

  // ✅ fetch payments
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
            paymentStatus: item.paymentStatus?.toUpperCase() || "UNPAID",
            paymentMode: item.paymentMode || "N/A",
            paymentDate: item.paymentDate || null,
          }))
          .filter(
            (p) => p.status === "ADMIN_APPROVED" || p.status === "COMPLETED"
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

  // ✅ invoice download
  const downloadInvoice = async (p) => {
    try {
      toast.info("Your Invoice is being generated, please wait...");
      await generateInvoicePdf(p);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error("Failed to generate invoice.");
    }
  };

  // ✅ update payment status
  const updatePaymentStatus = async (payment, selectedMode, enteredAmount) => {
    if (!isAdminRole) return;

    try {
      const requestId = payment.id;
      const newRequestStatus =
        payment.status === APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED.value
          ? APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value
          : payment.status;

      const paymentDate = new Date().toISOString();

      const res = await new ApiService().apiput(
        `${ServerUrl.API_UPDATE_PAYMENT_STATUS}/${requestId}`,
        {
          paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
          status: newRequestStatus,
          paymentMode: selectedMode || payment.paymentMode || "CASH",
          amount: enteredAmount || payment.amount,
          paymentDate,
        }
      );

      if (res.data && res.data.data) {
        toast.success("Payment updated successfully");

        // update in list
        setPayments((prev) =>
          prev.map((p) =>
            p.id === requestId
              ? {
                  ...p,
                  paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
                  status: newRequestStatus,
                  paymentMode: selectedMode || p.paymentMode,
                  amount: enteredAmount || p.amount,
                  paymentDate,
                }
              : p
          )
        );

        // update in detail popup
        if (selectedPayment?.id === requestId) {
          setSelectedPayment((prev) => ({
            ...prev,
            paymentStatus: APPLICATION_CONSTANTS.PAYMENT_STATUS.PAID.value,
            status: newRequestStatus,
            paymentMode: selectedMode || prev.paymentMode,
            amount: enteredAmount || prev.amount,
            paymentDate,
          }));
        }
      } else {
        toast.error("Failed to update payment");
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      toast.error("Failed to update payment");
    } finally {
      resetPopup();
    }
  };

  // ✅ reset popup
  const resetPopup = () => {
    setShowPaymentPopup(false);
    setPaymentMode("");
    setPaymentAmount("");
    setPendingPayment(null);
  };

  // ✅ open popup with pre-filled amount
  const openPaymentPopup = (payment) => {
    setPendingPayment(payment);
    setPaymentAmount(payment.amount || "");
    setShowPaymentPopup(true);
  };

  // ✅ filter payments
  const filteredPayments = payments.filter(
    (p) =>
      p.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerMobile.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-button mb-6">Payment Management</h1>

      {/* search */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:flex-1 px-4 py-2 border border-button rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* table */}
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
                    <p className="text-gray-500 text-sm">{p.customerMobile}</p>
                  </div>
                </td>
                <td className="p-3">{p.bookingId}</td>
                <td className="p-3">
                  <div>{p.brand} {p.model}</div>
                  <div>{p.variant}</div>
                </td>
                <td className="p-3">₹{p.amount.toLocaleString("en-IN")}</td>
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
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => downloadInvoice(p)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  {isAdminRole && p.paymentStatus !== "PAID" && (
                    <button
                      onClick={() => openPaymentPopup(p)}
                      className="text-green-600 hover:text-green-800"
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

      {/* detail popup */}
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
              <p><strong>Payment Status:</strong> {selectedPayment.paymentStatus}</p>
              <p><strong>Request Status:</strong> {selectedPayment.status}</p>
              <p><strong>Payment Mode:</strong> {selectedPayment.paymentMode}</p>
              <p><strong>Payment Date:</strong> 
                {selectedPayment.paymentDate
                  ? new Date(selectedPayment.paymentDate).toLocaleDateString("en-IN")
                  : "N/A"}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => downloadInvoice(selectedPayment)}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
              >
                <FiDownload className="w-5 h-5 mr-1" /> Download
              </button>

              {isAdminRole && selectedPayment.paymentStatus !== "PAID" && (
                <button
                  onClick={() => openPaymentPopup(selectedPayment)}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-md flex items-center"
                >
                  <FiCheck className="w-5 h-5 mr-1" /> Mark as Paid
                </button>
              )}

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

      {/* payment popup */}
      {showPaymentPopup && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-lg max-w-xs w-full shadow-xl z-10 p-6">
            <h3 className="text-lg font-bold mb-4">Enter Payment Details</h3>

            <input
              type="number"
              className="w-full border px-3 py-2 rounded mb-4"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="">-- Select Payment Mode --</option>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={!paymentMode || !paymentAmount}
                onClick={() =>
                  updatePaymentStatus(pendingPayment, paymentMode, paymentAmount)
                }
              >
                Mark as Paid
              </button>
              <button
                className="px-4 py-2 border rounded"
                onClick={resetPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;

