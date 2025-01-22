const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			areaDeTrabajo: {
				datosTienda: {
					nombre: "",
					direccion: "",
					inventario: [],
					administradores: [],
					empleados: [],
					historial: [],
				},
				usuario: {
					email: "",
					nombre: "",
					rol: "",
				}
			},
		},
		actions: {
			
			requestParams: (method, data) => {

				if (data === null) {
					if (getStore().jwt === null) {
						return {
							method: method,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json",
							}
						}
					}
					else if (getStore().jwt !== null) {
						return {
							method: method,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json",
								"Authorization": "Bearer " + getStore().jwt
							}
						}
					}
				}
				else {
					if (getStore().jwt === null) {
						return {
							method: method,
							body: JSON.stringify(data),
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json",
							}
						}
					}
					else if (getStore().jwt !== null) {
						return {
							method: method,
							body: JSON.stringify(data),
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json",
								"Authorization": "Bearer " + getStore().jwt
							}
						}
					}
				}
			},
			queryhandler: async (method, route, id, data) => {
				const url = process.env.BACKEND_URL + route;
				console.log("peticion: " + url);
				const resquestParams = getActions().requestParams(method, data);
				
				return fetch(url + id, resquestParams)
					.then((response) => {
						try {
							let isOk = response.ok;
							
							return response.json().then((data) => {
								
								return { status: isOk, data: data };
							});
						} catch (error) {
							console.log(error.message);
						}
					});
			},

			login: (data) => {
				return getActions().queryhandler("POST", "login/", "", data)
					.then(({ status, data }) => {
						setStore({ loggedUser: data.user, jwt: data.jwt });
						localStorage.setItem("jwt", getStore().jwt);
						localStorage.setItem("name", getStore().loggedUser.name);
						localStorage.setItem("email", getStore().loggedUser.email);
						console.log(data.user.roles);
						console.log(JSON.stringify(data.user.roles));
						localStorage.setItem("roles", JSON.stringify(data.user.roles));
						return getActions().getWorkflow();
					});

			},
			register: (newUserData) => {
				return getActions().queryhandler("POST", "signup/", "", newUserData)
					.then(({ status, data }) => {
						console.log(status);
						console.log(data);
						setStore({ loggedUser: data.user, jwt: data.jwt });
						localStorage.setItem("jwt", JSON.stringify(data.user.jwt))
						localStorage.setItem("name", JSON.stringify(data.user.name))
						localStorage.setItem("email", JSON.stringify(data.user.email))
						localStorage.setItem("id", JSON.stringify(data.user.id))
						console.log(data.user.roles);
						console.log(JSON.stringify(data.user.roles));
						localStorage.setItem("roles", JSON.stringify(data.user.roles))
						return getActions().getWorkflow();
					});

			},
			nuevaTienda:(datos)=>{
				return getActions().queryhandler("POST", "registro/inicial", "", datos)
					.then(({ status, data }) => {
						console.log(status);
						console.log(data);   //data:
											// "message": "Registro exitoso",
											// "token": token,
											// "tienda": nueva_tienda.serialize(),
											// "usuario": nuevo_ceo.serialize()
						return getActions().getWorkflow();
					});
			}
		}
	};
};

export default getState;
