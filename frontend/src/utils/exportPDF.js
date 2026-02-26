import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Xuất phần tử DOM ra file PDF
 * @param {string} elementId - ID của element cần chụp
 * @param {string} fileName - Tên file PDF (không cần .pdf)
 * @param {object} options - Tuỳ chọn thêm
 */
export const exportToPDF = async (
  elementId,
  fileName = "gia-pha",
  options = {},
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Không tìm thấy element với id="${elementId}"`);
  }

  const {
    padding = 20,
    quality = 2, // scale factor: 2 = retina quality
    orientation = "landscape",
  } = options;

  // Chụp element thành canvas
  const canvas = await html2canvas(element, {
    scale: quality,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  // Tính kích thước trang PDF
  const pdfWidth = orientation === "landscape" ? 297 : 210; // A4 mm
  const pdfHeight = orientation === "landscape" ? 210 : 297;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Tính tỉ lệ để vừa trang với padding
  const availW = pdfWidth - padding * 2;
  const availH = pdfHeight - padding * 2;
  const ratio = Math.min(availW / canvasWidth, availH / canvasHeight);

  const imgW = canvasWidth * ratio;
  const imgH = canvasHeight * ratio;

  const offsetX = (pdfWidth - imgW) / 2;
  const offsetY = (pdfHeight - imgH) / 2;

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });

  // Header
  pdf.setFontSize(14);
  pdf.setTextColor(16, 185, 129); // emerald-500
  pdf.setFont("helvetica", "bold");
  pdf.text("Gia Pha", padding, padding - 6);

  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}`,
    pdfWidth - padding,
    padding - 6,
    { align: "right" },
  );

  // Tree image
  pdf.addImage(imgData, "PNG", offsetX, offsetY, imgW, imgH);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text("Tạo bởi Gia Phả App", pdfWidth / 2, pdfHeight - 5, {
    align: "center",
  });

  pdf.save(`${fileName}.pdf`);
};

/**
 * Xuất danh sách thành viên ra PDF dạng bảng
 * @param {Array} members - Mảng thành viên
 * @param {string} treeName - Tên cây gia phả
 */
export const exportMemberListToPDF = (members, treeName = "Gia Pha") => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 15;
  const lineH = 8;
  let y = margin;

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(16, 185, 129);
  pdf.setFont("helvetica", "bold");
  pdf.text(treeName, pageW / 2, y, { align: "center" });
  y += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Danh sach thanh vien • ${members.length} nguoi`, pageW / 2, y, {
    align: "center",
  });
  y += 4;

  pdf.setDrawColor(229, 231, 235);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // Column headers
  const cols = {
    no: { x: margin, w: 10, label: "STT" },
    name: { x: margin + 10, w: 60, label: "Ho va ten" },
    gender: { x: margin + 70, w: 22, label: "Gioi tinh" },
    birth: { x: margin + 92, w: 30, label: "Ngay sinh" },
    place: { x: margin + 122, w: 45, label: "Que quan" },
    alive: { x: margin + 167, w: 18, label: "TT" },
  };

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(55, 65, 81);
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, y - 5, pageW - margin * 2, lineH, "F");
  Object.values(cols).forEach(({ x, label }) => pdf.text(label, x + 1, y));
  y += lineH - 2;
  pdf.line(margin, y, pageW - margin, y);
  y += 3;

  // Rows
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  members.forEach((member, idx) => {
    if (y > 270) {
      pdf.addPage();
      y = margin;
    }

    // Zebra stripe
    if (idx % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, y - 5, pageW - margin * 2, lineH, "F");
    }

    pdf.setTextColor(17, 24, 39);
    const genderLabel =
      member.gender === "male"
        ? "Nam"
        : member.gender === "female"
          ? "Nu"
          : "Khac";
    const birthDate = member.dateOfBirth
      ? new Date(member.dateOfBirth).toLocaleDateString("vi-VN")
      : "—";
    const alive = member.isAlive ? "Song" : "Mat";

    pdf.text(String(idx + 1), cols.no.x + 1, y);
    pdf.text(member.fullName?.slice(0, 30) || "—", cols.name.x + 1, y);
    pdf.text(genderLabel, cols.gender.x + 1, y);
    pdf.text(birthDate, cols.birth.x + 1, y);
    pdf.text((member.birthPlace || "—").slice(0, 22), cols.place.x + 1, y);

    if (!member.isAlive) {
      pdf.setTextColor(156, 163, 175);
    } else {
      pdf.setTextColor(16, 185, 129);
    }
    pdf.text(alive, cols.alive.x + 1, y);
    pdf.setTextColor(17, 24, 39);

    y += lineH;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `Trang ${i}/${totalPages} • Tao boi Gia Pha App • ${new Date().toLocaleDateString("vi-VN")}`,
      pageW / 2,
      295,
      { align: "center" },
    );
  }

  pdf.save(`${treeName.replace(/\s+/g, "-")}-danh-sach.pdf`);
};
