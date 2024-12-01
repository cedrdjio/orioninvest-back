// src/controllers/package.controller.ts
import { Request, Response } from 'express';
import Package from '../models/Package';
import { PackageService } from '../services/package.service';

const packageService = new PackageService();

export class PackageController {
  // Create a new package
  async createPackage(req: Request, res: Response) {
    const { name, description, price , image, duration , interestRate } = req.body;

    try {
      const packageItem = await Package.create({ name, description, price, image, duration , interestRate });
      res.status(201).json(packageItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create package' });
    }
  }

  // List all packages
  async listPackages(req: Request, res: Response) {
    try {
      const packages = await Package.findAll();
      res.status(200).json(packages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve packages' });
    }
  }

  async getPackageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pkg = await packageService.getPackageById(parseInt(id, 10));
      res.status(200).json(pkg);
    } catch (error: any) {
      res.status(error.message === 'Package non trouvé' ? 404 : 500).json({ message: error.message });
    }
  }


}
