import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";
import { Asidebar } from "../component/asidebar";

export const Home = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="container-fluid">
			<div className="col-3 vh-100">
				<Asidebar />
			</div>
			<div className=" col-9 content-container">
				
			</div>

			
		</div>
	);
};
