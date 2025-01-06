import React from "react";
import { Route, Routes } from "react-router-dom";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import { AuthPortal } from "./pages/authPortal";
import { Nav } from "./component/nav";
import { LandingPage } from "./pages/landingPage"; 
import injectContext from "./store/appContext";

import { Asidebar } from "./component/asidebar";
import { Footer } from "./component/footer";

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
                    <Footer />
                </>
                } />
            <Route path="/authPortal" element={<AuthPortal />} />
            <Route path="/crm/*" element={
                <>
                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/demo" element={<Demo />} />
                        <Route path="/single/:theid" element={<Single />} />
                        <Route path="/*" element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </>
            } />
        </Routes>
    );
};

export default injectContext(Layout);
