const LETTER_WIDTH_PX = 816; // 8.5in at 96dpi
const LETTER_WIDTH_IN = 8.5;
const LETTER_HEIGHT_IN = 11;
const MARGIN_IN = 0.4;

function waitForLayout() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function sliceCanvasPage(
  source: HTMLCanvasElement,
  y: number,
  sliceHeight: number
): HTMLCanvasElement {
  const page = document.createElement("canvas");
  page.width = source.width;
  page.height = sliceHeight;
  const ctx = page.getContext("2d");
  if (!ctx) return page;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, page.width, page.height);
  ctx.drawImage(source, 0, y, source.width, sliceHeight, 0, 0, source.width, sliceHeight);
  return page;
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

  const captureHeight = Math.max(element.scrollHeight, element.offsetHeight);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: LETTER_WIDTH_PX,
      windowWidth: LETTER_WIDTH_PX,
      height: captureHeight,
      windowHeight: captureHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
    const contentWidth = LETTER_WIDTH_IN - MARGIN_IN * 2;
    const contentHeight = LETTER_HEIGHT_IN - MARGIN_IN * 2;

    // Canvas pixels that fit on one printed page at full width (no shrinking).
    const pageSliceHeightPx = Math.floor((contentHeight / contentWidth) * canvas.width);
    if (pageSliceHeightPx <= 0) {
      throw new Error("Could not layout invoice for PDF.");
    }

    let y = 0;
    let pageIndex = 0;

    while (y < canvas.height) {
      const sliceHeight = Math.min(pageSliceHeightPx, canvas.height - y);
      const pageCanvas = sliceCanvasPage(canvas, y, sliceHeight);
      const drawHeightIn = (sliceHeight / canvas.width) * contentWidth;
      const image = pageCanvas.toDataURL("image/jpeg", 0.94);

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(image, "JPEG", MARGIN_IN, MARGIN_IN, contentWidth, drawHeightIn);

      y += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } finally {
    element.classList.remove("invoice-capture");
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
  }
}
