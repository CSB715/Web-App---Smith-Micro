import "../styles/Alert.css";
import { useRef } from "react";

function closeAlert() {
    const modal = document.getElementById("errorAlert");
    modal!.style.display = "none";
}

function ErrorAlert() {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    
    return (
        <div id="errorAlert" className="alert"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeAlert(); }}> 
            <div className="alert-content">
                <span className="close" onClick={() => closeAlert()}>&times;</span>
                <p>We're sorry, an error occurred. Please try again later.</p>
            </div>
        </div> 
    );
}

export default ErrorAlert;