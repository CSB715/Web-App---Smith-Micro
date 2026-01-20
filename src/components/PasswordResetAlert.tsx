import "../styles/Alert.css";

function ShowPasswordResetAlert() {
    const modal = document.getElementById("resetPasswordAlert");
    const span = document.getElementsByClassName("close")[5];

    modal!.style.display = "block";

    span!.addEventListener("click", () => {
        modal!.style.display = "none";
    });

    window.onclick = function(event) {
        if (event.target === modal) {
            modal!.style.display = "none";
        }
    };
}

function PasswordResetAlert() {
    return (
        <div id="resetPasswordAlert" className="alert">
            <div className="alert-content">
                <span className="close" >&times;</span>
                <p>A password reset link has been sent to your inbox.</p>
            </div>
        </div>
    )
}

export default PasswordResetAlert;
export { ShowPasswordResetAlert };