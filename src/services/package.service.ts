import Package from '../models/Package';

export class PackageService {
  async createPackage(data: { name: string; description: string; price: number; image: string; duration : number }) {
    return await Package.create(data);
  }

  async listPackages() {
    return await Package.findAll();
  }
}
