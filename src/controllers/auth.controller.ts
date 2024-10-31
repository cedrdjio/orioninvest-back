import { Request, Response } from 'express';
import { RegisterDTO, LoginDTO } from '../dtos/auth.dto';
import { authService } from '../services/auth.service';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const data: RegisterDTO = req.body;
      const user = await authService.register(data);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async signin(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;  // "identifier" = email ou phone_number
      const data = await authService.login(identifier, password);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}

export const authController = new AuthController();
