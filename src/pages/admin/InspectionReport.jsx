import React, { useState, useEffect, useRef } from 'react';
import { FiEye, FiDownload } from 'react-icons/fi';
import ServerUrl from '../../core/constants/serverUrl.constant';
import ApiService from '../../core/services/api.service';
import { useNavigate } from 'react-router-dom';
import { APPLICATION_CONSTANTS } from '../../core/constants/app.constant';
import { toast } from 'react-toastify';
import { useAuth } from "../../core/contexts/AuthContext";
import generateInspectionPDF from './InspectionReportPdf';

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  sent: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
};

const InspectionReport = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const payload = [
          APPLICATION_CONSTANTS.REQUEST_STATUS.WAITING_FOR_APPROVAL.value,
          APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_APPROVED.value,
          APPLICATION_CONSTANTS.REQUEST_STATUS.ADMIN_REJECTED.value,
          APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value
        ];
        const res = await new ApiService().apipost(ServerUrl.API_GET_ALL_PDIREQUEST_STATUSES, payload);
        setReports(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (openDialog && modalRef.current && !modalRef.current.contains(e.target)) setOpenDialog(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDialog]);

const handleViewReport = (report) => {
  const adminRoles = ["admin", "superadmin"];

  if (adminRoles.includes(user.role)) {
    navigate(`/${user.role}/dashboard/report/${report._id}?isAdm=true`);
  }
};

  const downloadReport = async (r) => {
    try {
      toast.info("Your Inspection Report is being generated, please wait...");
      await generateInspectionPDF(r);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate report.");
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-primary min-h-screen font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-button mb-6 flex items-center gap-2">
        <span className="p-2 bg-primary rounded-full"><FiEye size={20} className="text-button" /></span>
        Inspection Reports Management
      </h1>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-green-50">
              <tr>
                <th className="p-3 text-left text-sm font-body text-button">Booking ID</th>
                <th className="p-3 text-left text-sm font-body text-button">Customer Name</th>
                <th className="p-3 text-left text-sm font-body text-button">Engineer Name</th>
                <th className="p-3 text-left text-sm font-body text-button">Brand Model</th>
                <th className="p-3 text-left text-sm font-body text-button">Date</th>
                <th className="p-3 text-left text-sm font-body text-button">Status</th>
                <th className="p-3 text-left text-sm font-body text-button">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{r.bookingId}</td>
                  <td className="p-3 text-sm">
                    <div className="flex flex-col">
                      <span>{r.customer?.name}</span>
                      <span className="text-gray-500 text-xs">{`${r.customerName || ''} ${r.customerMobile || ''}`}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex flex-col">
                      <span>{r.engineer?.name}</span>
                      <span className="text-gray-500 text-xs">{r.engineer_name || ''}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-700">{`${r.brand} ${r.model}`}</td>
                  <td className="p-3 text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span>{(r.date && new Date(r.date).toLocaleDateString()) || 'N/A'}</span>
                      {/* <span className="text-gray-500 text-xs">{r.time || ''}</span> */}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[r.status]?.bg} ${statusColors[r.status]?.text} ${statusColors[r.status]?.border} border`}>
                      {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewReport(r)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                    >
                      <FiEye size={16} /> Review
                    </button>

                    <button
                      onClick={() => downloadReport(r)}
                      className={`flex items-center gap-1 px-3 py-1 text-sm border rounded-md cursor-pointer
                        ${r.paymentStatus === 'PAID' && r.status === 'COMPLETED'
                          ? 'text-green-600 border-green-300 hover:bg-green-50'
                          : 'text-gray-400 border-gray-300 cursor-not-allowed hover:bg-transparent'}`}
                      disabled={!(r.paymentStatus === 'PAID' && r.status === 'COMPLETED')}
                    >
                      <FiDownload size={16} /> Report
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal Placeholder */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-lg font-body mb-4">Review Report - {selectedReport?.bookingId}</h2>
            {/* Modal content goes here */}
            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md" onClick={() => setOpenDialog(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionReport;