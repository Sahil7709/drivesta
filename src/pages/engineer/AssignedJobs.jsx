import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../core/services/api.service';
import { toast } from "react-toastify";
import ServerUrl from '../../core/constants/serverUrl.constant';
import StorageService from "../../core/services/storage.service";
import { APPLICATION_CONSTANTS } from '../../core/constants/app.constant';

const AssignedJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchAssignedJobs = async () => {
      try {
        const user = JSON.parse(StorageService.getData(APPLICATION_CONSTANTS.STORAGE.USER_DETAILS));

        const res = await new ApiService().apiget(
          `${ServerUrl.API_GET_ALL_REQUESTS_BY_ENGINEER}/${user.userId}`
        );

        const allJobs = res.data?.data || [];
        const assignedJobs = allJobs.filter(
          job => job.status === APPLICATION_CONSTANTS.REQUEST_STATUS.ASSIGNED_ENGINEER.value
        );
        setJobs(assignedJobs);
      } catch (err) {
        console.error("Error fetching assigned jobs:", err);
      }
    };
    fetchAssignedJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchText.toLowerCase();
    return (
      job.customerName?.toLowerCase().includes(searchLower) ||
      job.brand?.toLowerCase().includes(searchLower) ||
      job.model?.toLowerCase().includes(searchLower) ||
      job.customerMobile?.toLowerCase().includes(searchLower) ||
      job.address?.toLowerCase().includes(searchLower)
    );
  });

  const handleStartPdi = (job) => {
    setSelectedJob(job);
    setShowPopup(true);
  };

  const handleContinueInspection = async (job) => {
    if (!job) return;

    try {
      // Update status in backend
      await new ApiService().apiput(
        `${ServerUrl.API_GET_INSPECTION_UPDATE}/${job._id}`,
        { status: APPLICATION_CONSTANTS.REQUEST_STATUS.IN_PROGRESS.value }
      );

      // Remove job from assigned jobs list
      setJobs(prev => prev.filter(j => j._id !== job._id));

      // Close popup
      setShowPopup(false);

      // Navigate to Report page (like OngoingJobs)
      navigate("/engineer/dashboard/report/" + job._id, {
        state: { job },
      });
    } catch (err) {
      console.error("Failed to start PDI:", err);
      toast.error("Failed to start PDI. Try again.");
    }
  };

  return (
    <div className="p-6 bg-primary min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-button">Assigned Jobs</h1>

      {/* Search */}
      <div className="flex items-center mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by name, model, phone..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-button"
        />
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <p className="text-gray-500">No assigned jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div
              key={job._id}
              className="bg-white/20 backdrop-blur-md p-5 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-green-100"
            >
              <h2 className="font-bold text-xl mb-2 text-button">
                {job.brand || 'N/A'} {job.model || ''}
              </h2>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Boking ID:</strong> {job.bookingId || 'N/A'}</p>
                <p><strong>Customer:</strong> {job.customerName || 'N/A'}</p>
                <p><strong>Location:</strong> {job.address || 'N/A'}</p>
                <p><strong>Date:</strong> {(job.date && new Date(job.date).toLocaleDateString()) || 'N/A'}</p>
                <p><strong>Phone:</strong> {job.customerMobile || 'N/A'}</p>
              </div>
              <button
                onClick={() => handleStartPdi(job)}
                className="mt-4 w-full bg-button text-white py-2 rounded-lg hover:bg-green-600 transition"
              >
                Start PDI
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Popup */}
      <Dialog open={showPopup} onClose={() => setShowPopup(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-button font-bold">Job Details</DialogTitle>
        <DialogContent dividers>
          {selectedJob && (
            <div className="space-y-2 text-sm">
              <p><strong>Vehicle:</strong> {selectedJob.brand || 'N/A'} {selectedJob.model || ''}</p>
              <p><strong>Booking ID:</strong> {selectedJob.bookingId || 'N/A'}</p>
              <p><strong>Customer:</strong> {selectedJob.customerName || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedJob.customerMobile || 'N/A'}</p>
              <p><strong>Location:</strong> {selectedJob.address || 'N/A'}</p>
              <p><strong>Assigned Date:</strong> {(selectedJob.date && new Date(selectedJob.date).toLocaleDateString()) || 'N/A'}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)} variant="outlined">Cancel</Button>
          <Button
            onClick={() => handleContinueInspection(selectedJob)}
            variant="contained"
            color="success"
          >
            Continue for Inspection
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssignedJobs;
