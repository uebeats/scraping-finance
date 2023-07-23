const express = require('express');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;

// Establece la carpeta de vistas de EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Establece la carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para renderizar la vista EJS con el formulario y los resultados
app.get('/', (req, res) => {
  res.render('index', { quoteData: [] });
});

// Ruta para realizar el web scraping del quote seleccionado
app.get('/scrape/:quote', async (req, res) => {
  const quote = req.params.quote;
  const quoteData = await scrapeYahooFinance(quote);
  res.json(quoteData); // Devuelve los datos como JSON
});

async function scrapeYahooFinance(quote) {
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();

  // URL de la página que quieres hacer web scraping
  const url = `https://finance.yahoo.com/quote/${quote}/history?period1=1531526400&period2=1689292800&interval=1mo&filter=history&frequency=1mo&includeAdjustedClose=true`;

  await page.goto(url);

  // Aumentar el tiempo de espera a 60 segundos (60000 ms)
  const timeout = 60000;

  try {
    // Esperar a que aparezca el elemento de la tabla de datos utilizando el atributo data-test
    await page.waitForSelector('[data-test="historical-prices"]', { timeout });
  } catch (error) {
    console.error('Error al esperar el selector:', error);
    await browser.close();
    return;
  }

  // Extraer los datos de la tabla de historial de precios
  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-test="historical-prices"] tbody tr'));
    return rows.map(row => {
      const columns = Array.from(row.querySelectorAll('td'));
      // Verificar si hay suficientes columnas antes de acceder al sexto valor
      return columns.length >= 6 ? columns[5].innerText : null;
    });
  });

  // Cerrar el navegador
  await browser.close();

  // Filtrar los elementos nulos y devolver los datos extraídos
  return data.filter(item => item !== null);
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
