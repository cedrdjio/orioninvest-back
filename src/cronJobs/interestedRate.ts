/*

import { Op } from 'sequelize';
import cron from 'node-cron'; // Assurez-vous d'installer node-cron
import User from '../models/User';
import Transaction from '../models/Transaction';
import Package from '../models/Package';

export const startInterestRateCronJob = () => {
  // CronJob exécuté chaque jour à minuit
  cron.schedule('0 0 * * *', async () => {
    console.log('Début de l’exécution du CronJob pour mettre à jour les soldes des utilisateurs.');
    try {
      // Récupérer toutes les transactions actives de type "package_purchase"
      const activeTransactions = await Transaction.findAll({
        where: {
          type: 'package_purchase',
          status: 'completed',
        },
      });

      for (const transaction of activeTransactions) {
        const user = await User.findByPk(transaction.userId);
        const packageData = await Package.findByPk(transaction.packageId);

        if (!user || !packageData) {
          console.warn(`Données manquantes pour la transaction ID: ${transaction.id}`);
          continue;
        }

        if (!packageData.startDate || !(packageData.startDate instanceof Date)) {
          console.error('Invalid startDate in packageData:', packageData.startDate);
          return;
        }

        if (typeof packageData.duration !== 'number' || packageData.duration <= 0) {
          console.error('Invalid duration in packageData:', packageData.duration);
          return;
        }

        const startDate = new Date(packageData.startDate);
        const duration = packageData.duration;

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const now = new Date();
        if (now > endDate) {
          console.log(`Le package ID: ${packageData.id} pour l'utilisateur ID: ${user.id} a expiré.`);
          continue;
        }

        const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysElapsed > 0) {
          const rewardAmount = (packageData.price * packageData.interestRate) / 100;

          user.balance += rewardAmount;
          await user.save();

          console.log(
            `Le solde de l'utilisateur ID: ${user.id} a été mis à jour avec ${rewardAmount} FCFA (Transaction ID: ${transaction.id}).`
          );
        }
      }

      console.log('Mise à jour des soldes terminée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l’exécution du CronJob:', error);
    }
  });
};


*/

import { Op } from 'sequelize';
import cron from 'node-cron'; // Assurez-vous d'installer node-cron
import User from '../models/User';
import Transaction from '../models/Transaction';
import Package from '../models/Package';
// CronJob exécuté chaque minute
export const startInterestRateCronJob = () => {
  cron.schedule('* * * * *', async () => {  // Exécution toutes les minutes
    console.log('Début de l’exécution du CronJob pour mettre à jour les soldes des utilisateurs.');
    
    try {
      // Récupérer toutes les transactions actives de type "package_purchase"
      const activeTransactions = await Transaction.findAll({
        where: {
          type: 'package_purchase',
          status: 'completed',
        },
      });

      for (const transaction of activeTransactions) {
        // Récupérer l'utilisateur et le package associés à la transaction
        const user = await User.findByPk(transaction.userId);
        const packageData = await Package.findByPk(transaction.packageId);

        if (!user || !packageData) {
          console.warn(`Données manquantes pour la transaction ID: ${transaction.id}`);
          continue;
        }

        // Assurez-vous que packageData contient bien les informations nécessaires
        if (!transaction.createdAt || !(transaction.createdAt instanceof Date)) {
          console.error('Invalid startDate in packageData:', packageData.startDate);
          return;
        }

        if (typeof packageData.duration !== 'number' || packageData.duration <= 0) {
          console.error('Invalid duration in packageData:', packageData.duration);
          return;
        }

        // Extraction des données nécessaires
        const startDate = new Date(transaction.createdAt); // Copie sécurisée de startDate
        const duration = packageData.duration; // Durée du package en jours

        // Calcul de la date de fin
        const endDate = new Date(startDate); // Crée une copie de startDate
        endDate.setDate(endDate.getDate() + duration); // Ajoute la durée en jours à startDate

        // Vérifier si le package est encore actif
        const now = new Date();
        if (now > endDate) {
          console.log(`Le package ID: ${packageData.id} pour l'utilisateur ID: ${user.id} a expiré.`);
          continue;
        }

        // Calculer le montant à ajouter au solde sans la condition de 24h
        const rewardAmount = (packageData.price * packageData.interestRate) / 100;

        // Ajouter la récompense au solde de l'utilisateur
        user.balance += rewardAmount;
        await user.save();

        console.log(
          `Le solde de l'utilisateur ID: ${user.id} a été mis à jour avec ${rewardAmount} FCFA (Transaction ID: ${transaction.id}).`
        );
      }

      console.log('Mise à jour des soldes terminée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l’exécution du CronJob:', error);
    }
  });
};
