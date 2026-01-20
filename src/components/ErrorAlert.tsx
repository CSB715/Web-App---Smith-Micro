import "../styles/Alert.css";

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