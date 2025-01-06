import React from "react"; 
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import Layout from "./layout";
import "../styles/index.css";

const container = document.querySelector("#app");
const root = createRoot(container);
root.render(
        <BrowserRouter>
        	<Layout />
        </BrowserRouter>
);

if (module.hot) {
        module.hot.accept();
    }
