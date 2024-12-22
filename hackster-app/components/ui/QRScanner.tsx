import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { CircleX } from "lucide-react";

type QRScannerProps = {
    onDataScan: (codeData: string) => void
    onCancel: () => void
}

export default function QRScanner({onDataScan, onCancel}: QRScannerProps) {

    function onScan(detectedCodes: IDetectedBarcode[]) {
        const codeData = detectedCodes[0].rawValue;
        onDataScan(codeData);
    }

    return (
        <div>
            <Scanner onScan={onScan} formats={["qr_code"]} />
            <button className="btn btn-xl btn-outline btn-primary w-full mt-5 text-xl" onClick={onCancel}><CircleX/> Cancel</button>
        </div>
    );
}