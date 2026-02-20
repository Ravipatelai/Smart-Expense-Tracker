export const extractUpiFromQr = (qrText) => {
  try {
    if (!qrText.startsWith("upi://")) return null;

    const url = new URL(qrText);

    return {
      pa: url.searchParams.get("pa"), // receiver@upi
      pn: url.searchParams.get("pn"), // Receiver Name (VERY IMPORTANT)
    };
  } catch {
    return null;
  }
};
