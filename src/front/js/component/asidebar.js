import React from "react";
import { Link } from "react-router-dom";


export const Asidebar = () => {
	return (
		<>
			<aside className="aside-container">
				<i class="bi bi-justify"></i>
				<div className="aside-content">
					<ul className="asidebar-nav">
						<li className="nav-item">
							<Link to="/home">
								<i class="bi bi-house-fill"></i><span className="nav-link active" aria-current="page">Inicio</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/perfil">
								<i class="bi bi-people-fill"></i>
								<span className="nav-link active" aria-current="page">Usuarios</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/ventas">
								<i class="bi bi-cart4"></i>
								<span className="nav-link">Ventas</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/services">
								<i class="bi bi-grid-1x2-fill"></i>
								<span className="nav-link">Inventario</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/dashboard">
								<i class="bi bi-bar-chart-line-fill"></i>
								<span className="nav-link">Dashboard</span>
							</Link>
						</li>
					</ul>
				</div>
			</aside>
		</>
	);
};
