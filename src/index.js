const express = require('express');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const moment = require('moment');
const { log } = require('console');

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
app.get('/scrape/', async (req, res) => {
  // const quote = req.params.quote;
  const quote = req.query.quote;
  const interval = req.query.interval;
  const period1 = req.query.period1;
  const period2 = req.query.period2;

  function obtenerMarcaTiempoUnix(fecha) {
    const fechaMoment = moment(fecha, 'YYYY-MM-DD').unix();
    // const fechaConvertida = moment(fechaMoment, 'MMM DD, YYYY').unix();
    return fechaMoment;
  }

  const quoteData = await scrapeYahooFinance(quote, interval, obtenerMarcaTiempoUnix(period1), obtenerMarcaTiempoUnix(period2));
  // console.log(period1, period2, interval)
  res.json(quoteData); // Devuelve los datos como JSON
});

async function scrapeYahooFinance(quote, interval, period1, period2) {

  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();

  // URL de la página que quieres hacer web scraping
  const url = `https://finance.yahoo.com/quote/${quote}/history?period1=${period1}&period2=${period2}&interval=${interval}&filter=history&frequency=${interval}&includeAdjustedClose=true`;

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
  // console.log(data);
  // console.log(url);
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
