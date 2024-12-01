import Package from '../models/Package';

export class PackageService {
  async createPackage(data: { 
    name: string; 
    description: string; 
    price: number; 
    image: string; 
    duration: number; 
    interestRate: number;
    niche: string; 
  }) {
    return await Package.create(data);
  }

  async listPackages() {
    return await Package.findAll();
  }

  // Nouvelle méthode pour récupérer un package par ID
  async getPackageById(id: number) {
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      throw new Error('Package non trouvé');
    }
    return pkg;
  }
}
