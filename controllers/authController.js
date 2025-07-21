import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Registro de usuario
router.post('/auth/register', async (req, res) => {
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Error de validación o usuario existente
 *       500:
 *         description: Error interno
 */
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    const existing = await userRepository.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ username, password: hashedPassword });
    res.status(201).json({ message: 'Usuario registrado', user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/auth/login', async (req, res) => {
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Usuario o contraseña incorrectos
 *       500:
 *         description: Error interno
 */
  try {
    const { username, password } = req.body;
    const user = await userRepository.findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;
