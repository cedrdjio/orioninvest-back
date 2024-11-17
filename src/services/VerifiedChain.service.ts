import VerifiedChain from '../models/VerifiedChain';

class VerifiedChainService {
  async createVerifiedChain(chain: string) {
    try {
      return await VerifiedChain.create({ chain });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Cette chaîne existe déjà.');
      }
      if (error.name === 'SequelizeValidationError') {
        throw new Error(error.errors[0].message); // Retourne le message d'erreur de validation
      }
      throw error;
    }
  }

  async getAllVerifiedChains() {
    try {
      const chains = await VerifiedChain.findAll(); // Récupère toutes les chaînes
      return chains;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Récupérer une VerifiedChain par ID
  async getVerifiedChainById(id: number) {
    try {
      const chain = await VerifiedChain.findByPk(id); // Recherche par ID
      return chain;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }


  // Autres méthodes (get, update, delete)...
}

export default new VerifiedChainService();
