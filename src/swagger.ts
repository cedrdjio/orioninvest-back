// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const app = express();

// Configuration de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Version de l'API
    info: {
      title: 'Orion Invest API',
      version: '1.0.0',
      description: 'Documentation de l\'API pour Orion Invest',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Remplacez par votre URL
      },
    ],
  },
  apis: ['./src/routes.ts'], // Chemin vers vos fichiers de routes (modifiez si nécessaire)
};

// Génération de la documentation Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middleware pour servir la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
