import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Ici, nous utilisons une variable locale pour stocker l'utilisateur décodé
    const user = decoded; // Remplace 'decoded' par un type approprié si nécessaire

    // Si vous devez passer l'utilisateur à un autre middleware ou à un contrôleur, 
    // vous pouvez le faire via `res.locals` par exemple
    res.locals.user = user; // Passer l'utilisateur au prochain middleware ou au contrôleur

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
