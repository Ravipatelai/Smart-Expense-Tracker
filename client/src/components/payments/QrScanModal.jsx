import { X, ScanLine } from "lucide-react";
import QrScanner from "./QrScanner";
import { extractUpiFromQr } from "./upi.utils";

export default function QrScanModal({ open, onClose, onScanSuccess, onError }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md p-4 animate-scale-in">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <ScanLine size={18} className="text-primary" />
                        <h2 className="font-bold text-foreground">Scan UPI QR Code</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scanner Body */}
                <div className="p-6">
                    <div className="rounded-xl overflow-hidden border border-border shadow-inner bg-black/5">
                        <QrScanner
                            onScan={(text) => {
                                const data = extractUpiFromQr(text);
                                if (data?.pa) {
                                    onScanSuccess(data);
                                    onClose();
                                } else {
                                    onError("Invalid UPI QR code");
                                }
                            }}
                        />
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-center text-muted-foreground">
                            Align the QR code within the frame to scan
                        </p>
                        <div className="flex justify-center gap-3">
                            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Auto-detect</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Hints */}
                <div className="p-4 bg-muted/20 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center italic">
                        Tip: Ensure good lighting for faster recognition
                    </p>
                </div>
            </div>
        </div>
    );
}
