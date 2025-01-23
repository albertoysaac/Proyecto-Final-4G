import React from "react";
import { Link } from "react-router-dom";
import { CardComentarios } from '../component/cardComentarios';
import logo from '../../img/hurricane.svg';

export const LandingPage = () => {
    const testimonios = [
        {
            nombre: "María González",
            cargo: "Dueña de Abarrotes La Esperanza",
            comentario: "Desde que implementamos CRMiTiendita, nuestro control de inventario mejoró un 80%."
        },
        {
            nombre: "Carlos Rodríguez",
            cargo: "Gerente de Minisuper Express",
            comentario: "La facilidad para gestionar múltiples sucursales es increíble. Ahorro tiempo y dinero."
        },
        {
            nombre: "Ana Martínez",
            cargo: "Propietaria de Farmacia del Barrio",
            comentario: "El soporte técnico es excelente y el sistema es muy intuitivo."
        },
        {
            nombre: "Juan López",
            cargo: "Administrador de Tienda de Conveniencia",
            comentario: "Las alertas de stock bajo nos han ayudado a mantener siempre producto disponible."
        },
        {
            nombre: "Patricia Torres",
            cargo: "Dueña de Papelería Central",
            comentario: "Los reportes de ventas me ayudan a tomar mejores decisiones de compra."
        },
        {
            nombre: "Roberto Sánchez",
            cargo: "Gerente de Ferretería El Martillo",
            comentario: "La integración con el punto de venta es perfecta. Todo sincronizado."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-lime-600 to-lime-800 dark:from-green-900 dark:to-green-950">
            <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="container mx-auto px-4 py-24 relative">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <h1 className="text-4xl md:text-6xl font-bold text-white">
                            Descubre <span className="text-yellow-400">CRMiTiendita</span>
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Más de 10 mil tiendas ya descubrieron cómo Tiendita CRM 
                            ha revolucionado la manera de controlar el inventario y las ventas.
                        </p>
                        <Link 
                            to="/authPortal"
                            className="inline-block px-8 py-4 text-lg font-semibold 
                                     bg-yellow-500 hover:bg-yellow-400 
                                     text-gray-900 rounded-full 
                                     transform hover:scale-105 
                                     transition-all duration-300 
                                     shadow-lg hover:shadow-xl"
                        >
                            Comenzar Ahora
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div id="carouselExampleIndicators" 
                             className="relative rounded-2xl shadow-2xl overflow-hidden">
                            <div className="carousel-indicators absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
                                <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors"></button>
                                <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors"></button>
                                <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white/80 transition-colors"></button>
                            </div>

                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img 
                                        src="https://picsum.photos/1200/600" 
                                        className="w-full h-[600px] object-cover"
                                        alt="Feature 1"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                            <h3 className="text-2xl font-bold mb-2">
                                                Control de Inventario
                                            </h3>
                                            <p className="text-lg text-white/90">
                                                Gestiona tu inventario de manera eficiente
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Repetir para otros slides */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 
                                 text-gray-900 dark:text-white">
                        Lo que dicen nuestros clientes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonios.map((testimonio, index) => (
                            <CardComentarios 
                                key={index} 
                                datos={testimonio} 
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};