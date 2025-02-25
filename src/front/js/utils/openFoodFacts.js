import axios from 'axios';

export async function getOpenFoodFacts(query) {
    try {
        let response;
        if (/^\d{4,}$/.test(query)) {
            // Buscar por código de barras
            response = await axios.get(`https://mx.openfoodfacts.org/api/v0/product/${query}.json`);
            if (response.data.status === 1) {
                const product = response.data.product;
                return [{
                    nombre: product.product_name || "No disponible",
                    codigo: product.code || "No disponible",
                    descripcion: product.generic_name || "No disponible",
                    categoria: product.categories_tag || "No disponible",
                    marca: product.brands || "No disponible",
                    unidad_medida: product.product._keywords[0] || "No disponible",
                    imagen: product.image_url || "No disponible",
                }];
            } else {
                throw new Error('Producto no encontrado');
            }
        } else {
            // Buscar por nombre
            response = await axios.get(`https://mx.openfoodfacts.org/cgi/search.pl`, {
                params: {
                    search_terms: query,
                    search_simple: 1,
                    action: 'process',
                    json: 1
                }
            });

            if (response.data.products && response.data.products.length > 0) {
                // Obtener hasta 5 productos coincidentes
				console.log(response.data.products);
                const products = response.data.products.slice(0, 5).map(product => ({
                    nombre: product.product_name || "No disponible",
                    codigo: product.code || "No disponible",
                    descripcion: product.generic_name || "No disponible",
                    categoria: product.categories || "No disponible",
                    marca: product.brands || "No disponible",
                    unidad_medida: product._keywords || "No disponible",
                    imagen: product.image_url || "No disponible"
                }));
                return products;
            } else {
                throw new Error('Producto no encontrado');
            }
        }
    } catch (error) {
        console.error(`Error al obtener datos del producto con nombre ${query}:`, error);
        return null;
    }
}