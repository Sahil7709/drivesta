import React from "react";
import withMaterialTable from "../../../components/constants/withMaterialTable";
import { toast } from "react-toastify";
import ApiService from "../../../core/services/api.service";
import ServerUrl from "../../../core/constants/serverUrl.constant";
import generateInspectionPDF from "../InspectionReportPdf";

const CompletedJobs = withMaterialTable(() => null, {
  title: "Completed Jobs",
  hideAddButton: true, // No Add button
  disableDefaultActions: true, // Disable default View/Edit/Delete actions

  // Define columns
  columns: [
    { accessorKey: "bookingId", header: "Booking ID" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "engineer_name", header: "Engineer" },
    {
      accessorKey: "paymentDate",
      header: "Date",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (!value) return "-";
        const date = new Date(value);
        return isNaN(date) ? "-" : date.toLocaleDateString();
      },
    },
    { accessorKey: "engineer_assignedSlot", header: "Slot" },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => {
        const downloadReport = async () => {
          try {
            toast.info("Your Inspection Report is being generated, please wait...");
            await generateInspectionPDF(row.original);
            toast.success("Inspection Report downloaded!");
          } catch (err) {
            toast.error("Failed to generate Inspection Report.");
          }
        };

        return (
          <button
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
            onClick={downloadReport}
          >
            Download Report
          </button>
        );
      },
    },
  ],

  // Fetch only COMPLETED jobs
  getData: async () => {
    try {
      const payload = ["COMPLETED"]; // API expects an array of statuses
      const res = await new ApiService().apipost(
        ServerUrl.API_GET_ALL_PDIREQUEST_STATUSES,
        payload
      );
      return res?.data?.data || [];
    } catch (err) {
      console.error("Error fetching completed jobs:", err);
      return [];
    }
  },

  // Dummy handlers since default actions are disabled
  viewData: async (row) => row,
  addData: async (row) => row,
  updateData: async (row) => row,
  deleteData: async (id) => id,
});

export default CompletedJobs;
