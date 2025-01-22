import React, { useState } from "react";
import {Login} from "../component/login";
import {Register} from "../component/register";

export const AuthPortal = () => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="container bg-background text-foreground">
            <div className="row min-vh-100 justify-content-center align-items-center">
                <div className="col-12 col-md-6 text-center">
                    <div>
                        {showLogin ? <Login /> : <Register />}
                    </div>
                    <div className="mb-4">
                        <button 
                            className={`btn mx-2 ${showLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setShowLogin(true)}
                        >
                            Login
                        </button>
                        <button 
                            className={`btn mx-2 ${!showLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setShowLogin(false)}
                        >
                            Register
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};
if (module.hot) {
    module.hot.accept();
}