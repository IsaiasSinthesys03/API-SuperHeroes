import './db.js';
import express from 'express';
import heroController from './controllers/heroController.js';
import villainController from './controllers/villainController.js';
import battleController from './controllers/battleController.js';
import equipoController from './controllers/equipoController.js';
import enfrentamientoController from './controllers/enfrentamientoController.js';
import round1Jugador1Controller from './controllers/round1Jugador1Controller.js';
import round1Jugador2Controller from './controllers/round1Jugador2Controller.js';
import round2Jugador1Controller from './controllers/round2Jugador1Controller.js';
import round2Jugador2Controller from './controllers/round2Jugador2Controller.js';
import round3Jugador1Controller from './controllers/round3Jugador1Controller.js';
import round3Jugador2Controller from './controllers/round3Jugador2Controller.js';
import estadisticasController from './controllers/estadisticasController.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Superhéroes',
    version: '1.0.0',
    description: 'Documentación de la API de superhéroes',
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use(express.json());
app.use('/api', heroController);
app.use('/api', villainController);
app.use('/api', battleController);
app.use('/api', equipoController);
app.use('/api', enfrentamientoController);
app.use('/api', round1Jugador1Controller);
app.use('/api', round1Jugador2Controller);
app.use('/api', round2Jugador1Controller);
app.use('/api', round2Jugador2Controller);
app.use('/api', round3Jugador1Controller);
app.use('/api', round3Jugador2Controller);
app.use('/api', estadisticasController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
