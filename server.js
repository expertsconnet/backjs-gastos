import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gastosRouter from './routes/gastos.js';
import comprobantesRouter from './routes/comprobantes.js';

dotenv.config();

const app = express();

// ✅ Configuración correcta de CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://itecsolutions.onrender.com',
    'https://itecsolutions.info',
    'https://www.itecsolutions.info'
  ]
};


app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/gastos', gastosRouter);
app.use('/api/comprobantes', comprobantesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
