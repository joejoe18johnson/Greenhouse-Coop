export async function downloadInvoicePdf(element: HTMLElement, filename: string) {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    margin,
    position,
    contentWidth,
    imgHeight,
    undefined,
    "FAST"
  );
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      position,
      contentWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
