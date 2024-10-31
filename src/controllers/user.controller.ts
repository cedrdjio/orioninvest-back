// src/controllers/UserController.ts

import { Request, Response } from 'express';
import UserService from '../services/user.service';

class UserController {
 
  // Récupération du profil utilisateur
  static async getProfile(req: Request, res: Response) {
    // @ts-ignore
    const user = req.user
    try {
      console.log(user);
      const userId = user.email; // `req.user` doit être attaché par un middleware d'authentification
      const userProfile = await UserService.getProfile(userId);
      res.status(200).json(userProfile);
    } catch (error) {
      res.status(400).json({ message: 'Erreur system {{'+error+'}}'});
    }
  }

  // Récupération de la liste des filleuls
  static async getReferrals(req: Request, res: Response) {
     // @ts-ignore
     const user = req.user
    try {
      const userId = user.email;
      const referrals = await UserService.getReferrals(userId);
      res.status(200).json(referrals);
    } catch (error) {
        res.status(400).json({ message: 'Erreur system', error });
    }
  }
}

export default UserController;
