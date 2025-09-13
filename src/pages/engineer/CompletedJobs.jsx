import React from "react";
import { PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const downloadPDF = (job) => {
    const doc = new jsPDF();
    doc.setTextColor(46, 125, 50);
    doc.text(`Job Report - ${job.bookingId}`, 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Booking ID",
          "Brand",
          "Model",
          "Variant",
          "Engineer",
          "Customer",
          "Inspection",
          "Payment",
          "Status",
        ],
      ],
      body: [
        [
          job.bookingId,
          job.customerName,
          job.engineer_name,
          `${job.brand} - ${job.model} - ${job.variant}`,
          job.date,
          `${job.paymentStatus} - ${job.amount}`,
          job.status,
        ],
      ],
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Description"]],
      body: [[job.description || "-"]],
    });
    doc.save(`Job_${job.bookingId}.pdf`);
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
                  onClick={() => isInspectionCompleted && generateInspectionPDF(job)}
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