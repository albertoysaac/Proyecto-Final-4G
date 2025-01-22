import React from 'react';
import { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { Input } from "./ui/input";


export const Login = () => {
	const { store, actions } = useContext(Context);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const handleSubmit = (event) => {
		actions.login({'username': username, 'password': password});
	};
	return (
		<div className="container">
			<h2>Iniciar Sesión</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="username" className="form-label">Usuario:</label>
					<Input 
						type="text" 
						className="form-control" 
						id="username" 
						value={username} 
						onChange={(e) => setUsername(e.target.value)} 
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="password" className="form-label">Contraseña:</label>
					<Input 
						type="password" 
						className="form-control" 
						id="password" 
						value={password} 
						onChange={(e) => setPassword(e.target.value)} 
					/>
				</div>
				<button type="submit" className="btn btn-primary">Ingresar</button>
			</form>
		</div>
	);
};