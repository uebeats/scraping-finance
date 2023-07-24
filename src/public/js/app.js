// Inicializa el select2
$('select').select2({
    theme: 'bootstrap-5'
  });

  // Agrega el evento click al botón de obtener datos
  document.getElementById('getQuoteButton').addEventListener('click', async () => {
    // Obtener los datos del formulario
    const quote = document.getElementById('quote').value;
    const interval = document.getElementById('interval').value;
    const period1 = document.getElementById('period1').value;
    const period2 = document.getElementById('period2').value;

    // Mostrar el loader mientras se hace la solicitud
    const loader = document.getElementById('loader');
    loader.style.display = 'block';

    // Obtener los datos del quote
    try {
      const response = await fetch(`/scrape/?quote=${quote}&interval=${interval}&period1=${period1}&period2=${period2}&frecuency=${interval}`);
      
      const quoteData = await response.json();
      const quoteDataList = document.getElementById('quoteDataList');
      quoteDataList.innerHTML = '';
      quoteData.forEach(quote => {
        console.log(response.url);
        // para mostrar la data en una lista
        const li = document.createElement('li');
        li.textContent = quote;
        quoteDataList.appendChild(li);
        // quoteDataList.value = quoteDataList.value + quote + '\n';
      });
    } catch (error) {
      console.error('Error al obtener los datos del quote:', error);
    } finally {
      // Ocultar el loader cuando se recibe la respuesta o hay un error
      loader.style.display = 'none';
    }
  });

  // Agrega el evento click al botón de copiar al portapapeles
  document.getElementById('copyButton').addEventListener('click', () => {
    // Copiar los datos al portapapeles
    const quoteDataList = document.getElementById('quoteDataList');
    const listItems = quoteDataList.getElementsByTagName('li');
    let textToCopy = '';
    for (let i = 0; i < listItems.length; i++) {
      textToCopy += listItems[i].textContent + '\n';
    }
    copyToClipboard(textToCopy);
    alert('Datos copiados al portapapeles. Ahora puedes pegarlos en la hoja de cálculo.');
  });
  
  // Función para copiar el texto al portapapeles
  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = 0;
    textarea.style.left = 0;
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = 0;
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }