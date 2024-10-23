import express from 'express';
import { AuthController } from './controllers/auth.controller';

const app = express();
const authController = new AuthController();

app.use(express.json());

app.post('/auth/register', (req, res) => authController.register(req, res));
app.post('/auth/login', (req, res) => authController.login(req, res));

export default app;
