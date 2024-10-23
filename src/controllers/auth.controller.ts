import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { CustomError } from '../common/errors/CustomError';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterDTO = req.body;
      const user = await authService.register(data);
      res.status(201).json(user);
    } catch (error) {
      const err = error as CustomError;
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginDTO = req.body;
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      const err = error as CustomError;
      res.status(err.status || 500).json({ message: err.message });    }
  }
}
