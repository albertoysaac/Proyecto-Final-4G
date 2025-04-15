import React, { useContext, Suspense } from "react";
import { Context } from "./store/appContext";
import { Route, Routes, Navigate } from "react-router-dom";
import injectContext from "./store/appContext";
import Nav from "./component/nav";
import LandingPage from "./pages/landingPage";

const Dashboard = React.lazy(() => import("./pages/Dashboard/dashboard"));
const AuthPortal = React.lazy(() => import("./pages/authPortal"));

const ProtectedRoute = ({ children }) => {
    const { store } = useContext(Context);
    return store.authdata.access_token ? children : <Navigate to="/authPortal" />;
};

const Layout = () => {
    const basename = process.env.BASENAME || "";

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Nav />
                            <LandingPage />
                        </>
                    }
                />
                <Route path="/authPortal" element={<AuthPortal />} />
                <Route
                    path="/dashboard/*"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
};

export default injectContext(Layout);
