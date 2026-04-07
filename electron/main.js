import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración de rutas para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;
let mainWindow;

// --- GESTIÓN DE FIREBASE ---
// En producción, buscamos el archivo en la raíz de recursos de la App (extraResources)
const serviceAccountPath = isDev 
  ? path.join(__dirname, '..', 'serviceAccountKey.json')
  : path.join(process.resourcesPath, 'serviceAccountKey.json');

// Inicialización de Firebase Admin
if (fs.existsSync(serviceAccountPath)) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccountPath)
      });
      console.log('Firebase Admin SDK inicializado correctamente');
    }
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
  }
} else {
  console.error(`Error: No se encontró serviceAccountKey.json en: ${serviceAccountPath}`);
}

const db = getApps().length > 0 ? getFirestore() : null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Asegúrate de que preload.js esté en la misma carpeta que este archivo
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "Fujifilm DI-HT Inventory Manager",
    icon: path.join(__dirname, '../public/icon.png')
  });

  // --- ELIMINAR BARRA DE MENÚS (File, Edit, View, etc.) ---
  mainWindow.setMenu(null);

  if (isDev) {
    // Desarrollo: Usamos el servidor de Vite
    mainWindow.loadURL('http://127.0.0.1:3000');
    mainWindow.webContents.openDevTools(); 
  } else {
    // Producción: Cargamos el archivo físico index.html de la carpeta dist
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialización de la App
app.whenReady().then(createWindow);

// --- HANDLERS IPC (Lógica de base de datos) ---

// Obtener Clientes
ipcMain.handle('get-clients', async (event, { searchTerm = '' } = {}) => {
  if (!db) return [];
  try {
    const clientsRef = db.collection('clientes');
    const snapshot = await clientsRef.get();
    const allClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return allClients.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.ruc_id?.toLowerCase().includes(term)
      );
    }
    return allClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
});

// Obtener Consumo por Cliente
ipcMain.handle('get-consumption', async (event, { clientId }) => {
  if (!db) return [];
  try {
    const snapshot = await db.collection('consumos')
      .where('client_id', '==', clientId)
      .orderBy('order_date', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching consumption:', error);
    return [];
  }
});

// Obtener Datos de Fidelidad (Loyalty)
ipcMain.handle('get-loyalty', async () => {
  if (!db) return [];
  try {
    const snapshot = await db.collection('loyalty').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return [];
  }
});

// Gestión de ventanas cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});