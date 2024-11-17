import { Request, Response } from 'express';
import VerifiedChainService from '../services/VerifiedChain.service';

class VerifiedChainController {
  async createVerifiedChain(req: Request, res: Response) {
    try {
      const { chain } = req.body;
      const newChain = await VerifiedChainService.createVerifiedChain(chain);
      res.status(201).json(newChain);
    } catch (error: any) {
      res.status(400).json({ error: error.message }); // Retourne les erreurs de validation
    }
  }

  // Méthode pour récupérer toutes les VerifiedChains
  async getAllVerifiedChains(req: Request, res: Response): Promise<void> {
    try {
      const chains = await VerifiedChainService.getAllVerifiedChains();
      res.status(200).json(chains); // Retourne la liste de toutes les chaînes
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getVerifiedChainById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const chain = await VerifiedChainService.getVerifiedChainById(Number(id)); // Convertir l'ID en nombre
      if (chain) {
        res.status(200).json(chain); // Retourne la chaîne trouvée
      } else {
        res.status(404).json({ message: 'VerifiedChain non trouvée' });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }


}



export default new VerifiedChainController();
