import { chromium } from 'playwright';

export async function scrapping(codigoDeBarras) {
    try {
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        
        await page.goto(`https://mx.openfoodfacts.org/producto/${codigoDeBarras}`);
        
        const results = await page.$$eval('.MjjYud', (elements) => 
            elements.map((el) => {
                try {
                    const dominio = el.querySelector('.byrV5b')?.textContent || '';
                    const disponible = el.querySelector('.fG8Fp.uo4vr')?.textContent || '';
                    let linkEspecifico = '';
                    
                    
                    
                    if (dominiosPermitidos.some(d => dominio.toLowerCase().includes(d))) {
                        linkEspecifico = el.querySelector('a')?.getAttribute('href') || '';
                    }
                    
                    return { linkEspecifico, dominio, disponible };
                } catch (error) {
                    console.error('Error en el mapeo de elementos:', error);
                    return null;
                }
            })
        );
        console.log('results:', results);

        
        return results;
        
    } catch (error) {
        console.error('Error searching product:', error);
        throw error;
    }
}