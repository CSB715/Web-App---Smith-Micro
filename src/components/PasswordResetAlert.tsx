import "../styles/Alert.css";
import { useRef, useState } from "react";
import "../styles/Modal.css";


function closeAlert() {
  const modal = document.getElementById("resetPasswordAlert");
  modal!.style.display = "none";
}

function PasswordResetAlert() {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      id="resetPasswordAlert"
      className="alert"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) closeAlert();
      }}
      style = {{display: "none"}}
    >
      <div className="alert-content">
        <span className="close" onClick={() => closeAlert()}>
          &times;
        </span>
           <p>A password reset link has been sent to your inbox.</p>
      </div>
    </div>
  );
}

export default PasswordResetAlert;
