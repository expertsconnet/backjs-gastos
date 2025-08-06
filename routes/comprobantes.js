import express from 'express';
import multer from 'multer';
import { pool } from '../config/db.js';

const router = express.Router();

// 🔧 Configuración de multer con límite de 10 MB por archivo
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB por archivo
});

// 🔻 Subir múltiples comprobantes para un gasto
router.post('/:gasto_id', upload.array('imagenes', 10), async (req, res) => {
  const { gasto_id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No se enviaron archivos' });
  }

  try {
    const insertResults = [];

    for (const file of files) {
      const [result] = await pool.query(
        `INSERT INTO comprobantes (gasto_id, imagen, tipo_mime, fecha_subida) VALUES (?, ?, ?, NOW())`,
        [gasto_id, file.buffer, file.mimetype]
      );
      insertResults.push({ id: result.insertId });
    }

    res.json({ mensaje: 'Comprobantes guardados correctamente.', insertados: insertResults });
  } catch (error) {
    console.error('Error al subir múltiples comprobantes:', error);
    res.status(500).json({ error: 'Error al guardar los comprobantes' });
  }
});

// 🔻 Obtener lista de comprobantes de un gasto (metadatos)
router.get('/:gasto_id', async (req, res) => {
  const { gasto_id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT id, tipo_mime, fecha_subida FROM comprobantes WHERE gasto_id = ?',
      [gasto_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener comprobantes:', error);
    res.status(500).json({ error: 'Error al obtener comprobantes.' });
  }
});

// 🔻 Ver imagen (descargar/mostrar directamente)
router.get('/ver/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT imagen, tipo_mime FROM comprobantes WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return res.status(404).send('Imagen no encontrada');

    res.setHeader('Content-Type', rows[0].tipo_mime);
    res.send(rows[0].imagen);
  } catch (error) {
    console.error('Error al mostrar imagen:', error);
    res.status(500).json({ error: 'Error al mostrar la imagen.' });
  }
});

// 🔻 Actualizar imagen de comprobante por ID
router.put('/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE comprobantes SET imagen = ?, tipo_mime = ?, fecha_subida = NOW() WHERE id = ?',
      [file.buffer, file.mimetype, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    res.json({ mensaje: 'Comprobante actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar comprobante:', error);
    res.status(500).json({ error: 'Error al actualizar el comprobante' });
  }
});

// 🔻 Eliminar comprobante por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM comprobantes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    res.json({ mensaje: 'Comprobante eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comprobante:', error);
    res.status(500).json({ error: 'Error al eliminar el comprobante' });
  }
});

export default router;
