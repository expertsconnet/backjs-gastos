import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', async (_, res) => {
  const [rows] = await pool.query('SELECT * FROM gastos ORDER BY fecha DESC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const data = req.body;
  const [result] = await pool.query(`
    INSERT INTO gastos 
    (fecha, descripcion, lugar, placa, colaboradores, combustible, hidratacion, desayuno, almuerzo, cena, otros, otros_descripcion, total, fecha_creacion, fecha_actualizacion) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.fecha, data.descripcion, data.lugar, data.placa, data.colaboradores,
      data.combustible, data.hidratacion, data.desayuno, data.almuerzo,
      data.cena, data.otros, data.otros_descripcion, data.total
    ]);
  res.json({ id: result.insertId });
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  await pool.query(`
    UPDATE gastos SET 
    fecha = ?, descripcion = ?, lugar = ?, placa = ?, colaboradores = ?,
    combustible = ?, hidratacion = ?, desayuno = ?, almuerzo = ?, cena = ?,
    otros = ?, otros_descripcion = ?, total = ?, fecha_actualizacion = NOW()
    WHERE id = ?`,
    [
      data.fecha, data.descripcion, data.lugar, data.placa, data.colaboradores,
      data.combustible, data.hidratacion, data.desayuno, data.almuerzo,
      data.cena, data.otros, data.otros_descripcion, data.total, id
    ]);
  res.sendStatus(204);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM gastos WHERE id = ?', [req.params.id]);
  res.sendStatus(204);
});

export default router;
