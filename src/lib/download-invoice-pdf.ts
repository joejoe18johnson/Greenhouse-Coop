const LETTER_WIDTH_PX = 816; // 8.5in at 96dpi
const LETTER_WIDTH_IN = 8.5;
const LETTER_HEIGHT_IN = 11;
const MARGIN_IN = 0.4;

function waitForLayout() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export async function downloadInvoicePdf(element: HTMLElement, filename: string) {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;
  element.classList.add("invoice-capture");
  element.style.width = `${LETTER_WIDTH_PX}px`;
  element.style.maxWidth = `${LETTER_WIDTH_PX}px`;

  await waitForLayout();

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: LETTER_WIDTH_PX,
      windowWidth: LETTER_WIDTH_PX,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
    const availWidth = LETTER_WIDTH_IN - MARGIN_IN * 2;
    const availHeight = LETTER_HEIGHT_IN - MARGIN_IN * 2;

    const aspect = canvas.height / canvas.width;
    let drawWidth = availWidth;
    let drawHeight = drawWidth * aspect;

    if (drawHeight > availHeight) {
      drawHeight = availHeight;
      drawWidth = drawHeight / aspect;
    }

    const x = (LETTER_WIDTH_IN - drawWidth) / 2;
    const image = canvas.toDataURL("image/jpeg", 0.94);

    pdf.addImage(image, "JPEG", x, MARGIN_IN, drawWidth, drawHeight);
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    element.classList.remove("invoice-capture");
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
  }
}
