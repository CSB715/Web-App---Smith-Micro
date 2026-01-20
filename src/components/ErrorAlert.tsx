import "../styles/Alert.css";

function showErrorModal() {
        const modal = document.getElementById("errorAlert");
        const span = document.getElementsByClassName("close")[6];

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


function ErrorAlert() {
    return (
        <div id="errorAlert" className="alert"> 
            <div className="alert-content">
                <span className="close" >&times;</span>
                <p>We're sorry, an error occurred. Please try again later.</p>
            </div>
        </div>
    );
}

export default ErrorAlert;
export { showErrorModal };