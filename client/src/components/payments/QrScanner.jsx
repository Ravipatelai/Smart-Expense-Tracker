import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function QrScanner({ onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) return;

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      },
      () => { }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="w-full">
      <div id="qr-reader" className="overflow-hidden rounded-lg w-full" />
    </div>
  );
}
