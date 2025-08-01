import {useEffect, useState} from "react";
import {BrowserRouter as Router} from "react-router-dom";
import {AppContent} from "./AppContent";

function App() {
    const [flag, setFlag] = useState(true);
    const handleBooleanChange = () => {
        setFlag((prevState) => !prevState);
    };

    useEffect(() => {
    }, [flag]);

    const userRole = "admin";

    return (
        <Router>
            <AppContent
                flag={flag}
                handleBooleanChange={handleBooleanChange}
                setFlag={setFlag}
                userRole={userRole}
            />
        </Router>
    );
}

export default App;
