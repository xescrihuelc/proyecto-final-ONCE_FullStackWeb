
import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./SignaturePad.css";

export default function SignaturePad({ onEnd }) {
    const sigCanvas = useRef();

    const clear = () => sigCanvas.current.clear();
    const save = () => {
        const canvas = sigCanvas.current.getCanvas();
        const dataURL = canvas.toDataURL("image/png");
        onEnd(dataURL);
    };

    return (
        <div className="signature-pad">
            <SignatureCanvas
                penColor="black"
                ref={sigCanvas}
                canvasProps={{ className: "sigCanvas" }}
                onEnd={save}
            />
            <button type="button" onClick={clear} className="btn-clear">
                Borrar
            </button>
        </div>
    );
}
