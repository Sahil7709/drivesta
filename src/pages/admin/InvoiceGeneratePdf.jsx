// src/utils/generateInvoicePdf.js
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const generateInvoicePdf = (order) => {
  return new Promise((resolve) => {
    const doc = new jsPDF();

    const invoiceGreen = [60, 184, 120]; // #3cb878
    const darkBlue = [27, 43, 75];       // #1b2b4b
    const textGray = [100, 100, 100];
    const newGreen = [125, 217, 87];     // #7dd957

    // Header background
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, 210, 50, "F");

    // Try to load logo
    const logo = new Image();
    logo.src = "/carnomia.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 6, 1, 70, 37);
      finishPdf();
    };

    logo.onerror = () => {
      // fallback circle logo
      doc.setFillColor(...invoiceGreen);
      doc.circle(35, 25, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("C", 33, 28);
      finishPdf();
    };

    function finishPdf() {
      // Slogan
      doc.setFont("times", "italic");
      doc.setFontSize(16);
      doc.setTextColor(...newGreen);
      doc.text("We Inspect Before You Invest", 8, 35);

      // INVOICE title
      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(...invoiceGreen);
      doc.text("INVOICE", 195, 27, { align: "right" });

      // Separator
      doc.setDrawColor(...textGray);
      doc.setLineWidth(0.5);
      doc.line(15, 55, 195, 55);

      // Invoice details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Booking ID: ${order.bookingId || "N/A"}`, 195, 65, { align: "right" });
      const paymentDate = order.paymentDate
        ? new Date(order.paymentDate).toLocaleDateString()
        : "26-09-2025";
      doc.text(`Invoice Date: ${paymentDate}`, 195, 72, { align: "right" });
      // Invoice To
      const startY = 85;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...invoiceGreen);
      doc.text("Invoice To:", 15, startY);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(order.customerName || "N/A", 15, startY + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Phone: +91 ${order.customerMobile || "N/A"}`, 15, startY + 18);

      // Invoice From
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...invoiceGreen);
      doc.text("Invoice From:", 195, startY, { align: "right" });
 
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Carnomia Technology", 195, startY + 10, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...textGray);
      doc.text("Phone :- +91 7385978109 / 7378554409", 195, startY + 26, { align: "right" });
      doc.text("E mail :- carnomiatechnologies@gmail.com", 195, startY + 34, { align: "right" });

      // Table
      const tableStartY = startY + 50;
      const amount = parseFloat(order.amount) || 0;

      autoTable(doc, {
        startY: tableStartY,
        head: [["Vehicle", "Payment Mode", "Payment Status"]],
        body: [[
          `${order.brand || "-"} ${order.model || "-"} ${order.variant || "-"}`,
          order.paymentMode || "CASH",
          order.paymentStatus || "N/A"
        ]],
        theme: "grid",
        tableWidth: 180,
        headStyles: {
          fillColor: invoiceGreen,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 11
        },
        bodyStyles: { textColor: [0, 0, 0], fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 45, halign: "center" },
          2: { cellWidth: 45, halign: "center" }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 15, right: 15 }
      });

      // Total
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalText = `Total: ₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      doc.setFillColor(...invoiceGreen);
      doc.rect(150, finalY, 45, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(totalText, 153, finalY + 7);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...textGray);
      doc.text("Thank you for choosing Carnomia!", 105, 280, { align: "center" });

      // ✅ Save
      const fileName = `invoice_${order.bookingId || "N/A"}.pdf`;
      doc.save(fileName);

      resolve(fileName);
    }
  });
};

export default generateInvoicePdf;
