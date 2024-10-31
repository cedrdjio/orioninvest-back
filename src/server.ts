import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { AuthController } from './controllers/auth.controller';
import User from './models/User';
import router from './routes';
import Package from './models/Package';
import Transaction from './models/Transaction';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(router);
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Orion Invest API');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');

    await User.sync({ alter: true });
    await Package.sync({ alter: true });
    await Transaction.sync({ alter: true });
    console.log('All models have been synchronized successfully.');
    console.log('Modèles synchronisés.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données :', error);
  }
};

startServer();

export default app;
