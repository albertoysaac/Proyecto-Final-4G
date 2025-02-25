import React from "react";
import { useContext } from "react";
import { Context } from "./store/appContext";
import { Route, Routes, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/dashboard";
import { AuthPortal } from "./pages/authPortal";
import { Nav } from "./component/nav";
import { LandingPage } from "./pages/landingPage"; 
import injectContext from "./store/appContext";

const ProtectedRoute = ({ children }) => {
    const { store } = useContext(Context);
    return store.authdata.access_token ? children : <Navigate to="/authPortal" />;
};

//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    return (
        <Routes>
            <Route path="/" element={
                <>
                    <Nav />
                    <LandingPage />
                </>
                } />
            <Route path="/authPortal" element={<AuthPortal />} />
            <Route path="/dashboard/*" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
    );
};

export default injectContext(Layout);
