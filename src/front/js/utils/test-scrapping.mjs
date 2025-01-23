import { scrapping } from './scrapping.mjs';

async function testScrapping() {
    const codigosBarras = [
        '00750102540305' // Coca Cola
        //'00075605814668', // Sabritas
        //'00750105875670'  // Bimbo
    ];

    for (const codigo of codigosBarras) {
        console.log(`\nBuscando producto con código: ${codigo}`);
        try {
            const results = await scrapping(codigo);
            console.log('Resultados encontrados:', JSON.stringify(results, null, 2));
        } catch (error) {
            console.error(`Error con código ${codigo}:`, error);
        }
    }
}

testScrapping();