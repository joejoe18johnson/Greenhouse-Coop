/** Strip leading zeros while typing (e.g. "025" → "25"). */
export function sanitizeNumericTyping(raw: string, allowDecimal = false) {
  if (raw === "") return "";

  let cleaned = raw.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!cleaned) return "";

  if (allowDecimal) {
    const dotIndex = cleaned.indexOf(".");
    if (dotIndex >= 0) {
      const intPart = cleaned.slice(0, dotIndex);
      const decPart = cleaned.slice(dotIndex + 1).replace(/\./g, "");
      const normalizedInt = intPart.replace(/^0+(?=\d)/, "") || (intPart.includes("0") ? "0" : "");
      cleaned = decPart.length ? `${normalizedInt}.${decPart}` : `${normalizedInt}.`;
    } else {
      cleaned = cleaned.replace(/^0+(?=\d)/, "");
    }
    return cleaned;
  }

  return cleaned.replace(/^0+(?=\d)/, "");
}

export function parseNumericValue(raw: string, fallback = 0) {
  if (raw === "" || raw === ".") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatNumericDisplay(value: number, allowDecimal = false) {
  if (value === 0) return "0";
  return allowDecimal ? String(value) : String(Math.round(value));
}
