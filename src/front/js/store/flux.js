const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			theme: "light",
			usuariofirmado: {},
			authdata: {},
			dashboard: {
				stats: {},
				globalStats: null, //para almacenar las estadisticas del dashboard
			},
			areaDeTrabajo: {}, //para almacenar la tienda a operar
			caja: {
				estado: null, // 'abierta' | 'cerrada'
				cajaActual: null,
				movimientos: [],
				balance: 0,
			},
			historial: {},
			carrito: [],
			productosGlobales: [],
			inventario: [],
			tokenRefreshAttempts: 0, // Contador de intentos de renovación del token
            maxTokenRefreshAttempts: 3,

		},
		actions: {
			/*
		* queryhandler: es una función que se encarga de hacer
		* todas las peticiones al backend con cookies y token de autorización
		*/	toggleTheme: () => {
				const store = getStore();
				const newTheme = store.theme === "light" ? "dark" : "light";
				setStore({ theme: newTheme });
				document.documentElement.classList.toggle("dark", newTheme === "dark");
			},

			changeTheme: (theme) => {
                setStore({ theme });
                document.documentElement.className = theme;
            },

			queryhandler: async (method, route, id, data) => {
			const url = process.env.BACKEND_URL + route;
			console.log("peticion: " + url);
			const requestParams = getActions().requestParams(method, data);
			try {
				const response = await fetch(url + id, {
				...requestParams,
				credentials: "include", // Importante para incluir cookies
			});

			if (response.status === 401) {
				// Token expirado, intentar refrescar
				const refreshed = await getActions().refreshToken();
				if (refreshed) {
				// Reintentar la petición original
					const retryParams = getActions().requestParams(method, data);
					const retryResponse = await fetch(url + id, {
						...retryParams,
						credentials: "include",
					});
					const data = await retryResponse.json();
					return { status: retryResponse.ok, response: data };
				} else {
				// No se pudo refrescar el token, redirigir al login
					await getActions().logout();
					window.location.href = "/authPortal";
					return { status: false, response: {} };
				}
			}

			const data = await response.json();
			console.log(data);
			return { status: response.ok, response: data };
			} catch (error) {
				console.error("Error en queryhandler:", error);
				return { status: false, response: { error: error.message } };
			}
		},
		/*
		* requestParams: es una función que se encarga de armar los parametros
		* de la petición segun el metodo, los datos que se envian y
		* el token de autorización
		*/

		requestParams: (method, data) => {
			if (data === null) {
				if (getStore().authdata.access_token === undefined) {
				return {
					method: method,
					headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					},
				};
				} else if (getStore().authdata.access_token !== undefined) {
				return {
					method: method,
					headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: "Bearer " + getStore().authdata.access_token,
					},
				};
				}
			} else {
				if (getStore().authdata.access_token === undefined) {
				return {
					method: method,
					body: JSON.stringify(data),
					headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					},
				};
				} else if (getStore().authdata.access_token !== undefined) {
				return {
					method: method,
					body: JSON.stringify(data),
					credentials: "include",
					headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: "Bearer " + getStore().authdata.access_token,
					},
				};
				}
			}
		},

		registro(datos) {
		return getActions()
			.queryhandler("POST", "usuario/registroInicial", "", datos)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				usuariofirmado: response.usuario,
				authdata: {
					access_token: response.access_token,
					refresh_token: response.refresh_token,
					autoridades: response.usuario.autoridades[0],
				},
				areaDeTrabajo: response.tienda,
				});
			} else {
				return status;
			}
			return status;
			});
		},

		login: (data) => {
		return getActions()
			.queryhandler("POST", "login", "", data)
			.then(({ status, response }) => {
			if (status) {
				const authData = {
				access_token: response.data.access_token,
				autoridades: response.data.datos.autoridades[0],
				};

				// Guardar en localStorage
				localStorage.setItem("authdata", JSON.stringify(authData));
				localStorage.setItem(
				"usuariofirmado",
				JSON.stringify(response.data.datos)
				);

				if (response.data.datos.autoridades.length > 1) {
				setStore({
					usuariofirmado: response.data.datos,
					authdata: {
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
					rol: response.data.datos.autoridades[0].rol,
					},
				});
				}
				if (response.data.datos.autoridades.length === 1) {
				setStore({
					usuariofirmado: response.data.datos,
					authdata: {
					access_token: response.data.access_token,
					refresh_token: response.data.refresh_token,
					autoridades: response.data.datos.autoridades[0],
					},
				});
				getActions().getTienda(response.data.datos.autoridades[0].id);
				}
				return status;
			}
			});
		},
		//para refrescar el token
		refreshToken: async () => {
			const store = getStore();
            if (store.tokenRefreshAttempts >= store.maxTokenRefreshAttempts) {
                console.error("Límite de intentos de renovación del token alcanzado");
                await getActions().logout();
                window.location.href = "/authPortal";
                return false;
            }

            try {
                const { status, response } = await getActions().queryhandler("POST", "refresh", "", null);
                if (status) {
                    setStore({
                        authdata: {
                            ...store.authdata,
                            access_token: response.access_token,
                        },
                        tokenRefreshAttempts: 0, // Reiniciar contador de intentos
                    });
                    return true;
                } else {
                    setStore({ tokenRefreshAttempts: store.tokenRefreshAttempts + 1 });
                    return false;
                }
            } catch (error) {
                console.error("Error al refrescar token:", error);
                setStore({ tokenRefreshAttempts: store.tokenRefreshAttempts + 1 });
                return false;
            }
		},

		logout: () => {
		return getActions()
			.queryhandler("POST", "logout", "", null)
			.then(({ status }) => {
			if (status) {
				setStore({
				usuariofirmado: {},
				authdata: {},
				dashboard: {
					stats: {},
					globalStats: null,
				},
				areaDeTrabajo: {},
				caja: {
					estado: null,
					cajaActual: null,
					movimientos: [],
					balance: 0,
				},
				historial: {},
				});
				return true;
			}
			return false;
			});
		},
		
		setStore: (newState) => {
			const store = getStore();
			setStore({ ...store, ...newState });
		},

		actualizarCantidad: (productoId, cantidad) => {
			const carritoActualizado = getStore().carrito.map((item) =>
				item.producto.id === productoId ? { ...item, cantidad } : item
			);
			setStore({ carrito: carritoActualizado });
		},
		eliminarProducto: (productoId) => {
			const carritoActualizado = getStore().carrito.filter(
				(item) => item.producto.id !== productoId
			);
			setStore({ carrito: carritoActualizado });
		},

		buscarProductosGlobal: async (query) => {
			if (!query || query.length < 3) {
				return [];
			}

			try {
				return await getActions().queryhandler("GET",`productos/buscar?query=${encodeURIComponent(query)}`,"",null)
				.then(({ status, response }) => {
					if (status) {
						return response;
					} else {
						return status;
					}
				});
			} catch (error) {
				console.error("Error al buscar productos globales:", error);
				return [];
			}
		},

		registrarProducto: async (producto) => {
			console.log("Registrando producto:", producto);
			return getActions().queryhandler("POST", "producto/registrar", "", producto)
			.then(({ status, response }) => {
				if (status) {
					return response;
				} else {
					throw new Error("Error al registrar el producto");
				}
			});
		},

		


		//para obtener las estadisticas globales (solo para el CEO)
		getGlobalStats: () => {
			return getActions()
			.queryhandler("GET", "dashboard/stats/global", "", null)
			.then(({ status, response }) => {
				if (status) {
					setStore({
						dashboard: {
							...getStore().dashboard,
							globalStats: response,
						},
					});
					return response;
				}
			});
		},
		actualizarInventario: async (inventarioId, data) => {
		try {
			const { status, response } = await getActions().queryhandler(
			"PUT",
			`inventario/${inventarioId}`,
			"",
			data
			);

			if (status) {
			const inventarioActualizado = getStore().inventario.map((item) =>
				item.id === inventarioId ? response : item
			);
			setStore({ inventario: inventarioActualizado });
			}
		} catch (error) {
			console.error("Error al actualizar inventario:", error);
		}
		},

		eliminarInventario: async (inventarioId) => {
		try {
			const { status } = await getActions().queryhandler(
			"DELETE",
			`inventario/${inventarioId}`,
			"",
			null
			);

			if (status) {
			const inventarioActualizado = getStore().inventario.filter(
				(item) => item.id !== inventarioId
			);
			setStore({ inventario: inventarioActualizado });
			}
		} catch (error) {
			console.error("Error al eliminar inventario:", error);
		}
		},

		seleccionarTienda: (tienda) => {
		const store = getStore();
		setStore({
			authdata: {
			...store.authdata,
			autoridades: tienda,
			},
		});
		return getActions().getTienda(tienda.id);
		},

		getTienda: (id) => {
		return getActions()
			.queryhandler("GET", "tienda/", id, null)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				areaDeTrabajo: response,
				});
				return status;
			} else {
				return status;
			}
			});
		},

		getHistorialLogs: (tiendaId) => {
		return getActions()
			.queryhandler(
			"GET",
			`tienda/${tiendaId}/historial/usuarios`,
			"",
			null
			)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				historial: {
					...getStore().historial,
					logs: response,
				},
				});
				return response;
			}
			});
		},

		getHistorialVentasCompras: (tiendaId) => {
		return getActions()
			.queryhandler(
			"GET",
			`tienda/${tiendaId}/historial/ventas_compras`,
			"",
			null
			)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				historial: {
					...getStore().historial,
					ventas: response.ventas,
					compras: response.compras,
				},
				});
				return response;
			} else {
				throw new Error(
				"Error al obtener el historial de ventas y compras"
				);
			}
			});
		},

		getHistorialInventario: (tiendaId) => {
		return getActions()
			.queryhandler(
			"GET",
			`tienda/${tiendaId}/historial/inventario`,
			"",
			null
			)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				historial: {
					...getStore().historial,
					inventario: response,
				},
				});
				return response;
			}
			});
		},

		getInventarioTienda: (tiendaId) => {
			console.log("Obteniendo inventario de la tienda...");
		return getActions()
			.queryhandler("GET", `inventario/${tiendaId}`, "", null)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				inventario: response,
				});
				return response;
			} else {
				throw new Error("Error al obtener el inventario de la tienda");
			}
			});
		},

		getHistorialCaja: (tiendaId) => {
		return getActions()
			.queryhandler("GET", `tienda/${tiendaId}/historial/caja`, "", null)
			.then(({ status, response }) => {
			if (status) {
				setStore({
				historial: {
					...getStore().historial,
					caja: response,
				},
				});
				return response;
			}
			});
		},

		verificarCaja: async (tiendaId) => {
		try {
			const { status, response } = await getActions().queryhandler(
			"GET",
			`caja/estado/${tiendaId}`,
			"",
			null
			);

			if (status) {
			setStore({
				caja: {
				estado: response.estado,
				cajaActual: response.caja,
				movimientos: response.movimientos || [],
				balance: response.caja?.balance_actual || 0,
				},
			});
			return response;
			}
		} catch (error) {
			console.error("Error al verificar caja:", error);
			return null;
		}
		},

		// Abrir caja (no se usa)
		abrirCaja: async (data) => {
		try {
			const { status, response } = await getActions().queryhandler(
			"POST",
			"caja/abrir",
			"",
			data
			);

			if (status) {
			await getActions().verificarCaja(data.tienda_id);
			return response;
			}
		} catch (error) {
			console.error("Error al abrir caja:", error);
			return null;
		}
		},

		// Cerrar caja (no se usa)
		cerrarCaja: async (cajaId, data) => {
		try {
			const { status, response } = await getActions().queryhandler(
			"PUT",
			`caja/cerrar/${cajaId}`,
			"",
			data
			);

			if (status) {
			await getActions().verificarCaja(data.tienda_id);
			return response;
			}
		} catch (error) {
			console.error("Error al cerrar caja:", error);
			return null;
		}
		},

		//(no se usa)
		// Registrar movimiento
		registrarMovimiento: async (data) => {
		try {
			const { status, response } = await getActions().queryhandler(
			"POST",
			"caja/movimiento",
			"",
			data
			);

			if (status) {
			const store = getStore();
			setStore({
				caja: {
				...store.caja,
				movimientos: [...store.caja.movimientos, response.movimiento],
				balance: response.balance_actual,
				},
			});
			return response;
			}
		} catch (error) {
			console.error("Error al registrar movimiento:", error);
			return null;
		}
		},

		// Procesar venta
		procesarVenta: async (tiendaId, datosVenta) => {
		try {
			// Primero creamos el ticket
			await getActions().queryhandler("POST",`venta`,"",datosVenta)
			.then(({ status, response }) => {
				if (status) {
					console.log(response);
					return status;
				}
				return status;
			});
		} catch (error) {
			console.error("Error al procesar venta:", error);
			return null;
		}
		},

		// Procesar compra
		procesarCompra: async (tiendaId, datosCompra) => {
		try {
			await getActions().queryhandler("POST",`compra`,"",datosCompra)
			.then(({ status, response }) => {
				if (status) {
					console.log(response);
					return status;
				}
				return status;
			});
		} catch (error) {
			console.error("Error al procesar compra:", error);
			return null;
		}
		},

		//para obtener los usuarios de una tienda
		getUsuariosTienda: () => {
			const tienda_id = getStore().authdata.autoridades.id.toString();
			return getActions()
				.queryhandler("GET", `usuario/tienda/`, tienda_id, null)
				.then(({ status, response }) => {
				if (status) {
					const store = getStore();
					setStore({
					areaDeTrabajo: {
						...store.areaDeTrabajo,
						empleados: response,
					},
					});
					console.log(response);
					return response;
				} else {
					throw new Error("Error al obtener los usuarios de la tienda");
				}
				});
		},

		crearUsuario: async (userData) => {
			return getActions()
				.queryhandler("POST", "usuario/nuevo", "", userData)
				.then(({ status, response }) => {
				if (status) {
					console.log(response);
				}
				});
		},

		editar3ro: async (usuario) => {
			const data = {
				email: usuario.email,
				tienda_id: getStore().areaDeTrabajo.tienda.id,
				nombre: usuario.nombre,
				apellido: usuario.apellido,
				fecha_contratacion: usuario.fecha_contratacion,
				hora_entrada: usuario.hora_entrada,
				hora_salida: usuario.hora_salida,
				rol: usuario.rol,
			};

			return await getActions().queryhandler("PUT", "usuario/actDtosCeo", "", data)
			.then(({ status, response }) => {
				if (status) {
					console.log(response);
					return status;
				}
				return status;
			});
		},

		eliminarUsuario: (datosUsuario) => {
			return getActions()
				.queryhandler("PUT", `usuario/eliminar`, "", datosUsuario)
				.then(({ status, response }) => {
				if (status) {
					console.log(response);
					return status;
				}
				return status;
				});
		},

		agregarUsuario: (userData) => {
			return getActions()
				.queryhandler("POST", "usuario/nuevo", "", userData)
				.then(({ status, response }) => {
				if (status) {
					console.log(response);
				}
				});
		},

		getDashboardStats: () => {
			const store = getStore();
			const tienda_id = store.authdata.autoridades.id.toString();
			console.log(tienda_id);

			return getActions()
				.queryhandler("GET", `dashboard/stats/`, tienda_id, null)
				.then(({ status, response }) => {
				if (status) {
					setStore({
					dashboard: {
						stats: response,
					},
					});
					return response;
				}
				});
		},
	},
	};
};

export default getState;
