// src/controllers/package.controller.ts
import { Request, Response } from 'express';
import Package from '../models/Package';

export class PackageController {
  // Create a new package
  async createPackage(req: Request, res: Response) {
    const { name, description, price } = req.body;

    try {
      const packageItem = await Package.create({ name, description, price });
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
}
