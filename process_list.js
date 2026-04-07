const fs = require('fs');

const rawText = fs.readFileSync('raw_data.txt', 'utf-8');
const lines = rawText.split('\n').filter(l => l.trim() !== '');

// Skip header lines
const dataLines = lines.slice(2); // Skip "Suma de..." and "CLIENTES;..."

const sizes = [
  "14x17", // DI HT 14"X17"
  "8x10",  // DI HT 20X25 CM
  "10x14", // DI-HL 26X36 CM (10X14)
  "14x17", // DI-HL 35X43 14X17
  "10x14", // DIHT 10X14 (26X36 CM)
  "10x12", // DI-HT 25X30 (10X12)
  "8x10",  // DI-HL 20X25 CM (8X10)
  "8x10"   // DI-ML 20X25 CM (8X10) X 150 H
];

const clientes = [];
const consumos = [];
let clientCounter = 1;
let consumoCounter = 1;

for (const line of dataLines) {
  if (line.startsWith('Total general')) continue;
  
  const parts = line.split(';');
  const name = parts[0].trim();
  if (!name) continue;

  const clientId = clientCounter++;
  clientes.push({
    id: clientId,
    name: name,
    city: "N/A",
    ruc_id: "N/A",
    contact: "No registrado"
  });

  // Columns 1 to 8 are the sizes
  for (let i = 1; i <= 8; i++) {
    const qty = parseInt(parts[i]);
    if (!isNaN(qty) && qty > 0) {
      // Create a representative record
      consumos.push({
        id: consumoCounter++,
        client_id: clientId,
        order_date: "2025-01-01", // Placeholder
        quantity: qty,
        size: sizes[i-1],
        batch_number: "725" + (100 + clientId),
        expiry_date: "2026-12-31"
      });
    }
  }
}

const output = `const data = {
  clientes: ${JSON.stringify(clientes, null, 2)},
  consumos: ${JSON.stringify(consumos, null, 2)}
};

export default data;`;

fs.writeFileSync('src/data.js', output);
console.log(`Processed ${clientes.length} clients and ${consumos.length} consumption records.`);
