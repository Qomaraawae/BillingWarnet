import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReceipt = (userData) => {
  return new Promise((resolve) => {
    const doc = new jsPDF();

    // Add logo (optional)
    // const logo = new Image();
    // logo.src = '/path/to/logo.png';
    // doc.addImage(logo, 'PNG', 10, 10, 30, 30);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("STRUK PEMBAYARAN WARNET", 105, 20, { align: "center" });

    // Transaction info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`No. Transaksi: ${userData.id.slice(0, 8)}`, 14, 40);
    doc.text(`Tanggal: ${new Date().toLocaleString()}`, 14, 50);

    // Customer info
    autoTable(doc, {
      startY: 60,
      head: [["Informasi Pelanggan", ""]],
      body: [
        ["Nama", userData.name],
        ["Paket", userData.packageName],
        ["Durasi", `${userData.time} menit`],
      ],
      styles: {
        cellPadding: 5,
        fontSize: 12,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    // Payment details
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Rincian Pembayaran", ""]],
      body: [
        ["Total", `Rp ${userData.price.toLocaleString()}`],
        ["Status", "LUNAS"],
        ["Metode", "QRIS"],
      ],
      styles: {
        cellPadding: 5,
        fontSize: 12,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Footer
    doc.setFontSize(10);
    doc.text(
      "Terima kasih telah menggunakan layanan kami",
      105,
      doc.lastAutoTable.finalY + 20,
      { align: "center" }
    );
    doc.text(
      "~ Struk ini sah sebagai bukti pembayaran ~",
      105,
      doc.lastAutoTable.finalY + 30,
      { align: "center" }
    );

    // Save PDF
    doc.save(`struk-${userData.name}-${Date.now()}.pdf`);
    resolve();
  });
};
