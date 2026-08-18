export interface LoadedImage {
  dataUrl: string;
  format: "PNG" | "JPEG";
  width: number;
  height: number;
}

/**
 * Fetches an image URL and converts it to a data URL + detected jsPDF format
 * ("PNG"/"JPEG"), so it can be embedded via doc.addImage. Returns null on any
 * failure (CORS, network) so PDF generation can gracefully skip the image
 * rather than throwing. Shared by every PDF generator that embeds an image
 * (quotation hero photo, B2B challan logo, ...).
 */
export async function loadImageAsDataUrl(src: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const format: "PNG" | "JPEG" = dataUrl.includes("image/png") ? "PNG" : "JPEG";

    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });

    return { dataUrl, format, ...dims };
  } catch {
    return null;
  }
}
