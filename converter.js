const fs = require('fs');
const path = require('path');

/**
 * Script para procesar el CSV de Impresoras-Orimec y generar data.js
 */

const INPUT_FILE = 'base.xlsx - Hoja1.csv';
const OUTPUT_FILE = 'src/data.js';

// Función para parsear una línea de CSV respetando comas dentro de comillas
function parseCSVLine(line) {
  const result = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Manejar comillas dobles escapadas ("")
      if (inQuotes && line[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  result.push(currentCell.trim());
  return result;
}

function processCSV() {
  try {
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`Error: El archivo ${INPUT_FILE} no existe en el directorio raíz.`);
      return;
    }

    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Omitir encabezado si existe (asumimos que la primera línea es el header)
    const dataLines = lines.slice(1);

    const clientsMap = new Map();
    const clientes = [];
    const consumos = [];
    
    let clientIdCounter = 1;
    let consumoIdCounter = 1;

    for (const line of dataLines) {
      const columns = parseCSVLine(line);
      
      // Mapeo de columnas según requerimiento:
      // Articulo: Columna 1 (Index 0)
      // Cliente: Columna 4 (Index 3)
      // Fecha: Columna 7 (Index 6)
      // Provincia: Columna 9 (Index 8)
      // Cod Cliente: Columna 10 (Index 9)
      // Cantidad: Columna 12 (Index 11)
      // Vta Total: Columna 15 (Index 14)

      const rawArticulo = columns[0];
      const rawCliente = columns[3];
      const rawFecha = columns[6];
      const rawProvincia = columns[8];
      const rawCodCliente = columns[9];
      const rawCantidad = columns[11];
      const rawVtaTotal = columns[14];

      if (!rawCliente) continue;

      // Lógica de filtrado: Primeros 20 clientes únicos
      if (!clientsMap.has(rawCliente)) {
        if (clientsMap.size < 20) {
          const newClient = {
            id: clientIdCounter++,
            name: rawCliente,
            city: rawProvincia || 'N/A',
            ruc_id: rawCodCliente || 'N/A'
          };
          clientsMap.set(rawCliente, newClient);
          clientes.push(newClient);
        }
      }

      // Si el cliente está entre los 20 seleccionados, procesamos el consumo
      if (clientsMap.has(rawCliente)) {
        const client = clientsMap.get(rawCliente);
        
        consumos.push({
          id: consumoIdCounter++,
          client_id: client.id,
          date: rawFecha || '',
          product: rawArticulo || '',
          quantity: parseInt(rawCantidad, 10) || 0,
          vta_total: parseFloat((rawVtaTotal || '0').replace(',', '.')) || 0
        });
      }
    }

    // Formatear vta_total a 2 decimales en el objeto final
    const finalConsumos = consumos.map(c => ({
      ...c,
      vta_total: parseFloat(c.vta_total.toFixed(2))
    }));

    const outputContent = `const data = {
  clientes: ${JSON.stringify(clientes, null, 2)},
  consumos: ${JSON.stringify(finalConsumos, null, 2)}
};

export default data;`;

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log(`¡Éxito! Se ha generado ${OUTPUT_FILE} con ${clientes.length} clientes y ${finalConsumos.length} registros de consumo.`);

  } catch (error) {
    console.error('Error procesando el archivo:', error);
  }
}

processCSV();
