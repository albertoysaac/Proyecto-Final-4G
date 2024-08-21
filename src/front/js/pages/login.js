// src/front/js/pages/Login.jsx
import React, { useState } from 'react';
const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const handleSubmit = (event) => {
		event.preventDefault();
		// Aquí realizarías la lógica de autenticación
		console.log('Usuario:', username, 'Contraseña:', password);
	};
	return (
		<div className="container">
			<h2>Iniciar Sesión</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="username" className="form-label">Usuario:</label>
					<input 
						type="text" 
						className="form-control" 
						id="username" 
						value={username} 
						onChange={(e) => setUsername(e.target.value)} 
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
					/>
				</div>
				<button type="submit" className="btn btn-primary">Ingresar</button>
			</form>
		</div>
	);
};
export default Login;