// ...existing code...
import './db.js';
import express from 'express';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
// import battleController from './controllers/battleController.js';
import equipoController from './controllers/equipoController.js';
import enfrentamientoController from './controllers/enfrentamientoController.js';
import round1Jugador1Controller from './controllers/round1Jugador1Controller.js';
import round1Jugador2Controller from './controllers/round1Jugador2Controller.js';
import round2Jugador1Controller from './controllers/round2Jugador1Controller.js';
import round2Jugador2Controller from './controllers/round2Jugador2Controller.js';
import round3Jugador1Controller from './controllers/round3Jugador1Controller.js';
import round3Jugador2Controller from './controllers/round3Jugador2Controller.js';
import estadisticasController from './controllers/estadisticasController.js';
import authController from './controllers/authController.js';
import authMiddleware from './middlewares/authMiddleware.js';

const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Superhéroes',
    version: '1.0.0',
    description: 'Documentación de la API de superhéroes.\n\n⚠️ Todos los endpoints (excepto /auth/register y /auth/login) requieren autenticación JWT Bearer. Usa el botón Authorize e ingresa tu token con el formato: Bearer <token>.',
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: []
    }
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);


app.use(express.json());
app.use('/api', authController); // Endpoints de registro y login públicos
// app.use('/api/battles', authMiddleware, battleController);
app.use('/api/enfrentamientos', authMiddleware, enfrentamientoController);
app.use('/api/equipos', authMiddleware, equipoController);
app.use('/api/estadisticas', authMiddleware, estadisticasController);
app.use('/api/heroes', authMiddleware, heroController);
app.use('/api/villains', authMiddleware, villainController);
app.use('/api/round1', authMiddleware, round1Jugador1Controller);
app.use('/api/round1jugador2', authMiddleware, round1Jugador2Controller);
app.use('/api/round2jugador1', authMiddleware, round2Jugador1Controller);
app.use('/api/round2jugador2', authMiddleware, round2Jugador2Controller);
app.use('/api/round3jugador1', authMiddleware, round3Jugador1Controller);
app.use('/api/round3jugador2', authMiddleware, round3Jugador2Controller);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ejemplo: proteger todos los endpoints de combate (descomenta para activar protección global)
// app.use('/api/round1', authMiddleware);
// app.use('/api/round2', authMiddleware);
// app.use('/api/round3', authMiddleware);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
