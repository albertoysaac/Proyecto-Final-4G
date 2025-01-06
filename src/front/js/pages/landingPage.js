import React from 'react';
import { Link } from 'react-router-dom';
import { CardComentarios } from '../component/cardComentarios';

export const LandingPage = () => {
    return (
        <div >
            <section className="seccion-p-d contairner-fluid w-100 h-80" id="top">
                <div className="container">
                    <div className="text-center d-flex flex-column align-items-center">
                        <h1>Descubre <strong>Tiendita CRM</strong> el futuro de las aplicaciones administrativas, y la mas utilizada por tienditas miselaneas por todo México</h1>
                        <p>Mas de 10 mil tiendas ya descubrieron como Tiendita CRM ha revolucionado la manera de controlar el inventario, las ventas, 
                            y como potenciar su crecimiento de la mano de sus potentes herramientas de analiticas.</p>
                        <div className="data-container">
                            <Link to="/authPortal" className="btnComenzar"><span>Comenzar</span></Link>
                        </div>
                    </div>
                    
                </div>
            </section>
            <section className="|" id="features">
                <div className=' container-fluid seccion-e row'>
                    <div id="carouselExampleIndicators" className="carousel slide container">
                        <div className="carousel-indicators">
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>

                        <div className="carousel-inner">
                            <div className="carousel-item active">
                                <img src="https://picsum.photos/201/300" className="d-block" alt="..."/>
                            </div>
                            <div className="carousel-item">
                                <img src="https://picsum.photos/200/301" className="d-block " alt="..."/>
                            </div>
                            <div className="carousel-item">
                                <img src="https://picsum.photos/202/300" className="d-block " alt="..."/>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>  
                </div>
            </section>
            <div className="seccion-c" id="comentarios">
                <div className="row">
                    <div className="col">
                        <CardComentarios key={1} datos = {{nombre: "alberto", cargo: "Coca-Cola CEO", comentario: "excelente aplicacion"}} />
                        <CardComentarios key={2} datos = {{nombre: "isaac", cargo: "Facebook CEO", comentario: "me encanta la app"}}/>
                    </div>
                    <div className="col">
                        <CardComentarios key={3} datos = {{nombre: "carlos", cargo: "space-x engennier", comentario: "lo mejor que he visto"}}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

if (module.hot) {
    module.hot.accept();
}