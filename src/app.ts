import express from 'express';
import { AuthController } from './controllers/auth.controller';
import sequelize from './config/database';
import User from './models/User';
const app = express();
const cors = require('cors');
const authController = new AuthController();

app.use(express.json());
//Middleware CORS pour autoriser toutes les origines
app.use(cors());

// Pour s'assurer que les requêtes préliminaires (OPTIONS) fonctionnent
app.options('*', cors());

app.post('/auth/register', (req, res) => authController.signup(req, res));
app.post('/auth/login', (req, res) => authController.signin(req, res));

const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('Connexion à la base de données réussie.');
  
      // Synchronisation des modèles avec la base de données
      await User.sync({ alter: true }); // 'alter' modifie les tables sans perte de données
      console.log('Modèles synchronisés.');
  
      // Ici, démarre ton serveur Express
    } catch (error) {
      console.error('Impossible de se connecter à la base de données :', error);
    }
  };

startServer();
export default app;
