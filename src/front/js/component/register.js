import React, { useState } from 'react';
import { useContext } from "react";
import { Context } from "../store/appContext";

export const Register = () => {
	const { store, actions } = useContext(Context);
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleSubmit = (event) => {
		event.preventDefault();
		if (password !== confirmPassword) {
			alert("Las contraseñas no coinciden");
			return;
		}
		actions.register({
			'email': email,
			'username': username,
			'password': password
		});
	};

	return (
		<div className="container">
			<h2>Registro de Usuario</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="email" className="form-label">Email:</label>
					<input 
						type="email" 
						className="form-control" 
						id="email" 
						value={email} 
						onChange={(e) => setEmail(e.target.value)}
						required 
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="username" className="form-label">Usuario:</label>
					<input 
						type="text" 
						className="form-control" 
						id="username" 
						value={username} 
						onChange={(e) => setUsername(e.target.value)}
						required 
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="password" className="form-label">Contraseña:</label>
					<input 
						type="password" 
						className="form-control" 
						id="password" 
						value={password} 
						onChange={(e) => setPassword(e.target.value)}
						required 
					/>
				</div>
				<div className="mb-3">
					<label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña:</label>
					<input 
						type="password" 
						className="form-control" 
						id="confirmPassword" 
						value={confirmPassword} 
						onChange={(e) => setConfirmPassword(e.target.value)}
						required 
					/>
				</div>
				<button type="submit" className="btn btn-primary">Registrarse</button>
			</form>
		</div>
	);
};