import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../../store/appContext";
import {getOpenFoodFacts} from "../../../utils/openFoodFacts";

const ModalRegistroProducto = React.lazy(() => import("./modal/modalRegistroProducto")); // Importar el nuevo modal

export const BuscadorProductos = () => {
    const { store, actions } = useContext(Context);
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModalRegistro, setShowModalRegistro] = useState(false); // Estado para mostrar el modal
    const [productoTemp, setProductoTemp] = useState(null); // Estado para el producto temporal

	const normalizarProducto = (producto) => {
		if (!producto) return null;
		if (producto?.producto?.id && producto?.producto?.id !== "producto no registrado"|| producto?.id) {
			console.log(producto, store.modo);
			return {
				cantidad: producto.cantidad ||0,
				cantidad_maxima: producto.cantidad_maxima ||60,
				cantidad_minima: producto.cantidad_minima ||5,
				id_inventario: producto.id_inventario || "sin registro en inventario",
				precio_actual: {
					compra: producto.precio_compra || 0,
					venta: 	producto.precio_venta || 0
				},
				producto: {
					categoria: producto.categoria || "",
					codigo: producto.codigo || "",
					descripcion: producto.descripcion || "",
					id: producto.id || "producto no registrado", 
					imagen_url: producto.imagen_url || null,
					marca: producto.marca || "",
					nombre: producto.nombre || "",
					unidad_medida: producto.unidad_medida || "pieza"
				},
				ubicacion: producto.ubicacion || "Estante A, Refrigerador B"
			};
		}else {
			console.log("producto sin id");
			return {
				cantidad: producto.cantidad || 0,
				cantidad_maxima: producto.cantidad_maxima || 60,
				cantidad_minima: producto.cantidad_minima || 5,
				precio_actual: {
					compra: producto.precio_compra || 0,
					venta: producto.precio_venta || 0
				},
				producto: {
					categoria: producto.categoria || "",
					codigo: producto.codigo || "",
					descripcion: producto.descripcion || "",
					imagen_url: producto.imagen_url || "",
					marca: producto.marca || "",
					nombre: producto.nombre || "",
					unidad_medida: producto.unidad_medida || "pieza"
				},
				ubicacion: producto.ubicacion || "Estante A, Refrigerador B"
			};
		}
	};

    const handleSearch = async () => {
        if (query.length > 0) {
            setIsLoading(true);
            console.log(store.inventario);
            const productosLocales = store.inventario.filter(producto =>	
                (producto.producto.nombre && producto.producto.nombre.toLowerCase().includes(query.toLowerCase())) ||
                (producto.producto.codigo && producto.producto.codigo.includes(query))
            );
            if (productosLocales.length > 0) {
				//"se encntraron productos locales"
                await actions.setStore({ productosEncontrados: productosLocales, modo: "venta" });
                setIsLoading(false);
            } else {
                // Buscar en la base de datos global
                const resultado = await actions.buscarProductosGlobal(query);
				const globalNormalizado = resultado.map(producto => normalizarProducto(producto));
				console.log(globalNormalizado);
                if (globalNormalizado.length === 0) {
                    // Buscar en Open Food Facts
                    const productData = await getOpenFoodFacts(query);
					const offNormalizado = productData.map(producto => normalizarProducto(producto));

                    if (offNormalizado.length > 0) {
						//"se encontraron productos en Open Food Facts"
                        await actions.setStore({ productosEncontrados: offNormalizado, modo: "compra" });

                    } else {
						// No se encontraron productos
                        await actions.setStore({ productosEncontrados: [], modo: "registro" });
                        setProductoTemp({
                            cantidad: 0,
							cantidad_maxima: 50,
							cantidad_minima: 5,
							precio_actual: {
								compra: null,
								venta: null
							},
							producto: {
								categoria: producto.categoria || "",
								codigo: producto.codigo || "",
								descripcion: producto.descripcion || "",
								imagen_url: producto.imagen || null,
								marca: producto.marca || "",
								nombre: producto.nombre || "",
								unidad_medida: producto.unidad_medida || "pieza"
							},
							ubicacion: null
                        });
                        setShowModalRegistro(true); // Mostrar el modal de registro
                    }
                } else {
					//"se encontraron productos globales"
                    await actions.setStore({ productosEncontrados: globalNormalizado, modo: "compra" });
                }
                setIsLoading(false); 
            }
        } else {
            actions.setStore({ productosEncontrados: [] });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleGuardarProducto = async (producto) => {
		console.log("producto a guardar:", producto);
        try {
			if (!producto.id) {
				// extraer los datos del producto para registrar
				const registro = { nombre: producto.nombre,
					codigo: producto.codigo, descripcion: producto.descripcion, categoria: producto.categoria,
					marca: producto.marca, unidad_medida: producto.unidad_medida
				};
			
				// registrarProducto regresa true o false ya que el registro no regresa el precio y lo uso en carritoVenta
				if(await actions.registrarProducto(registro)){
					const productoNormalizado = normalizarProducto(producto)
					await actions.setStore({carrito: [...store.carrito, productoNormalizado]});
					setShowModalRegistro(false);
				}

				if (respuesta) {
					// agregando a carrito producto normalizado de la base de datos global
					await actions.setStore({carrito: [...store.carrito, respuesta]});
					setShowModalRegistro(false);
				}
			}else if (producto.id) {
				// agregando a carrito producto normalizado de la base de datos global
				const productoNormalizado = normalizarProducto(producto);
				console.log("producto global a guardar:", producto);
				await actions.setStore({carrito: [...store.carrito, productoNormalizado]});
				setShowModalRegistro(false);
			}
        } catch (error) {
            console.error("Error al registrar el producto:", error);
			setShowModalRegistro(false);
        }
    };

    const handleProductoSeleccionado = async (producto) => {
		console.log("modo:" ,store.modo, "producto:", producto);
        if (store.modo === "registro" || store.modo === "compra") {
            setProductoTemp(producto);
			await actions.setStore({productosEncontrados: []});
        } else if (store.modo === "venta") {
			const localNormalizado = normalizarProducto(producto);
			setProductoTemp(localNormalizado);
            await actions.setStore({carrito: [...store.carrito, localNormalizado]});
			await actions.setStore({productosEncontrados: []});
        }
		else{
			console.error("Error al seleccionar el producto");
			setShowModalRegistro(false);
		}
		setShowModalRegistro(true);
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar por nombre o código de barras..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lime-500"
                />
                {isLoading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-500"></div>
                    </div>
                )}
                {(store.productosEncontrados || []).length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-auto">
                        {(store.productosEncontrados || []).map((producto, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    handleProductoSeleccionado(producto);
                                    setQuery("");
                                }}
                                className="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center"
                            >
                                <div className="flex items-center">
                                    {producto.producto.imagen_url && (
                                        <img src={producto.producto.imagen_url} alt={producto.producto.nombre} className="w-12 h-12 mr-4" />
                                    )}
                                    <div>
                                        <p className="font-medium">{producto.producto.nombre}</p>
                                        <p className="text-sm text-gray-500">
                                            Código: {producto.producto.codigo}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-lime-600">
                                        ${producto.precio_actual?.venta || "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {producto.producto.categoria} - {producto.producto.marca}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {showModalRegistro && (
                <ModalRegistroProducto
                    producto={productoTemp}
					modo={store.modo}
                    onClose={() => setShowModalRegistro(false)}
                    onGuardar={handleGuardarProducto}
                />
            )}
        </div>
    );
};