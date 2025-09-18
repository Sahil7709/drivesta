import React from "react";
import { PictureAsPdf } from "@mui/icons-material";
import { toast } from "react-toastify";
import withMaterialTable from "../../components/constants/withMaterialTable";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import StorageService from "../../core/services/storage.service";
import { APPLICATION_CONSTANTS } from "../../core/constants/app.constant";
import { IconButton, Tooltip } from "@mui/material";
import generateInspectionPDF from "../admin/InspectionReportPdf";

const statusColors = {
  COMPLETED: "bg-green-100 text-green-800",
  PENDING: "bg-gray-100 text-gray-800",
};

const CompletedJobs = () => {
  
    const downloadReport = async (job) => {
    try {
      toast.info("Your Inspection Report is being generated, please wait...");
      await generateInspectionPDF(job); 
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate report.");
    }
  };

  const tableConfig = {
    title: "Completed Jobs",
    hideAddButton: true,
    disableDefaultActions: true,
    columns: [
      { accessorKey: "bookingId", header: "Booking ID" },
      { accessorKey: "customerName", header: "Customer" },
      { accessorKey: "engineer_name", header: "Engineer" },
      
      { header: "Vehicle", accessorFn: (row) => `${row.brand} ${row.model} ${row.variant}`},
      { accessorKey: "date", header: "Inspection" },
      {
        id: "payment",
        header: "Payment",
        Cell: ({ row }) =>
          `${row.original.paymentStatus} - ${row.original.amount}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              statusColors[row.original.status] ||
              "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "pdf",
        header: "Actions",
        Cell: ({ row }) => {
          const job = row.original;
          const isInspectionCompleted =
            job.status ===
            APPLICATION_CONSTANTS.REQUEST_STATUS.COMPLETED.value;

          return (
            <Tooltip
              title={
                isInspectionCompleted
                  ? "Download Report"
                  : "Inspection not completed"
              }
            >
              <span>
                <IconButton
                  onClick={() => isInspectionCompleted && downloadReport(job)}
                  disabled={!isInspectionCompleted}
                >
                  <PictureAsPdf
                    color={isInspectionCompleted ? "success" : "disabled"}
                  />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    getData: async () => {
      const user = JSON.parse(
        StorageService.getData(APPLICATION_CONSTANTS.STORAGE.USER_DETAILS)
      );
      const res = await new ApiService().apiget(
        `${ServerUrl.API_GET_ALL_REQUESTS_BY_ENGINEER}/${user.userId}`
      );
        // Only show jobs with status WAITING_FOR_APPROVAL or COMPLETED
        const jobs = res.data?.data || [];
        return jobs.filter(
          (job) =>
            job.status === "WAITING_FOR_APPROVAL" || job.status === "COMPLETED"
        );
    },
  };

  const WrappedTable = withMaterialTable(null, tableConfig);
  return <WrappedTable />;
};

export default CompletedJobs;