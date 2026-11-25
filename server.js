const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;
const N = 3; // Número de lista de Cardona Molina Jeefry (primer integrante alfabéticamente)
const HEADER_ESPERADO = `CIAF-${N}`;
const ORIGEN_PERMITIDO = 'http://localhost:5500';

// 1) CORS: solo permite el origen definido (responde Access-Control-Allow-Origin: http://localhost:5500)
app.use(cors({
  origin: ORIGEN_PERMITIDO,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Red-Equipo'],
  exposedHeaders: ['X-Servidor-Procesado']
}));

app.use(express.json());

// 2) Middleware de validación del header personalizado
app.use((req, res, next) => {
  const valor = req.get('X-Red-Equipo');
  if (valor !== HEADER_ESPERADO) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Falta el encabezado X-Red-Equipo o su valor es incorrecto.',
      esperado: `X-Red-Equipo: ${HEADER_ESPERADO}`
    });
  }
  res.set('X-Servidor-Procesado', `Equipo-${N}`);
  next();
});

// Datos en memoria
const envios = [
  { id: 1, guia: 'ENV-1001', destino: 'Pereira', estado: 'En tránsito' },
  { id: 2, guia: 'ENV-1002', destino: 'Santa Rosa de Cabal', estado: 'Entregado' }
];

// 3) GET: consulta de envíos
app.get('/api/envios', (req, res) => {
  res.status(200).json(envios);
});

// 4) POST: registro de un envío
app.post('/api/envios', (req, res) => {
  const { guia, destino, estado } = req.body || {};
  if (
    typeof guia !== 'string' || !guia.trim() ||
    typeof destino !== 'string' || !destino.trim() ||
    typeof estado !== 'string' || !estado.trim()
  ) {
    return res.status(400).json({
      error: 'Datos incompletos',
      mensaje: 'Se requieren guia, destino y estado como textos no vacíos.'
    });
  }

  const guiaNormalizada = guia.trim();
  const guiaDuplicada = envios.some(
    envio => envio.guia.toLowerCase() === guiaNormalizada.toLowerCase()
  );
  if (guiaDuplicada) {
    return res.status(400).json({
      error: 'Guía duplicada',
      mensaje: 'Ya existe un envío registrado con esa guía.'
    });
  }

  const nuevo = {
    id: Math.max(0, ...envios.map(envio => envio.id)) + 1,
    guia: guiaNormalizada,
    destino: destino.trim(),
    estado: estado.trim()
  };
  envios.push(nuevo);
  res.status(201).json(nuevo);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor en http://127.0.0.1:${PORT}`);
  console.log(`Header requerido -> X-Red-Equipo: ${HEADER_ESPERADO}`);
});
