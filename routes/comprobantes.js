import express from 'express';
import multer from 'multer';
import { pool } from '../config/db.js';

const router = express.Router();
const storage = multer.memoryStorage(); // 👈 Guardar en memoria, no disco
const upload = multer({ storage });

// 🔻 Subir imagen en base64 (guarda en BLOB)
router.post('/:gasto_id', upload.single('imagen'), async (req, res) => {
  const { gasto_id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se envió ningún archivo' });
  }

  const [result] = await pool.query(
    `INSERT INTO comprobantes (gasto_id, imagen, tipo_mime, fecha_subida) VALUES (?, ?, ?, NOW())`,
    [gasto_id, file.buffer, file.mimetype]
  );

  res.json({ id: result.insertId, mensaje: 'Imagen guardada en la base de datos correctamente.' });
});

// 🔻 Obtener imágenes asociadas a un gasto (metadatos)
router.get('/:gasto_id', async (req, res) => {
  const { gasto_id } = req.params;
  const [rows] = await pool.query(
    'SELECT id, tipo_mime, fecha_subida FROM comprobantes WHERE gasto_id = ?',
    [gasto_id]
  );
  res.json(rows);
});

// 🔻 Descargar/ver imagen
router.get('/ver/:id', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT imagen, tipo_mime FROM comprobantes WHERE id = ?', [id]);

  if (rows.length === 0) return res.status(404).send('Imagen no encontrada');

  res.setHeader('Content-Type', rows[0].tipo_mime);
  res.send(rows[0].imagen);
});

export default router;
