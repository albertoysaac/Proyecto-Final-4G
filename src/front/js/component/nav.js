import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

export function Nav() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary row" data-bs-theme="dark">
		<div className="container-fluid">

			<div className="container col-3" >
				<HashLink className="navbar-brand" to="#top"><span><i className="bi bi-boxes">MVP-CRM</i></span></HashLink>
			</div>

			<div className="collapse navbar-collapse col-6" id="navbarNav">
				<ul className="navbar-nav">
					<li className="nav-item">
						<HashLink className="nav-link active" aria-current="page" to="#comentarios">comentarios</HashLink>
					</li>
					<li className="nav-item">
						<HashLink className="nav-link" to="/">Features</HashLink>
					</li>
				</ul>
			</div>
            <div className="col-3 d-none d-lg-flex justify-content-end">
                <Link to="/login">Comenzar</Link>
            </div>
			<div className="d-lg-none col-3">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#navbarToggleExternalContent" 
                        aria-controls="navbarToggleExternalContent" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse" id="navbarToggleExternalContent">
                    <div className="bg-dark p-4">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <HashLink className="nav-link" smooth to="#inicio">Inicio</HashLink>
                            </li>
                            <li className="nav-item">
                                <HashLink className="nav-link" smooth to="#comentarios">comentarios</HashLink>
                            </li>
                            <li className="nav-item">
                                <HashLink className="nav-link" smooth to="#precios">Precios</HashLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
		</div>
	</nav>
  );
}