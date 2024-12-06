import { Op } from 'sequelize';
import moment from 'moment';
import cron from 'node-cron';
import User from '../models/User';
import Package from '../models/Package';
import Transaction from '../models/Transaction';

// Tâche cron pour ajouter des dividendes tous les jours
cron.schedule('0 0 * * *', async () => {
  try {
    // Récupérer toutes les transactions d'achat de package
    const transactionsToUpdate = await Transaction.findAll({
      where: {
        type: 'package_purchase',
        status: 'completed',
      },
    });

    for (const transaction of transactionsToUpdate) {
      // Récupérer le package associé à la transaction
      const packageToUpdate = await Package.findByPk(transaction.packageId);
      if (!packageToUpdate) continue;

      // Vérifier si le package a un startDate
      if (!packageToUpdate.startDate) {
        console.log(`Package with ID ${packageToUpdate.id} does not have a startDate.`);
        continue;
      }

      // Calculer le nombre de jours écoulés depuis l'achat du package
      const daysElapsed = moment().diff(moment(packageToUpdate.startDate), 'days');
      
      // Calculer le pourcentage de progression en fonction de la durée du package
      const progressPercentage = Math.min(
        (daysElapsed / packageToUpdate.duration) * 100,  // Proportionnel à la durée du package
        100 // Le pourcentage ne doit pas dépasser 100
      );

      // Mettre à jour le champ progressPercentage dans le package
      packageToUpdate.progressPercentage = progressPercentage;
      await packageToUpdate.save();  // Sauvegarder la mise à jour

      // Vérifier si la progression est de 100% et si les dividendes doivent être appliqués
      if (progressPercentage === 100) {
        // Calculer les dividendes journaliers
        const dailyDividends = (packageToUpdate.price * packageToUpdate.interestRate) / 100;
        const user = await User.findByPk(transaction.userId);

        if (user) {
          user.balance += dailyDividends;
          await user.save();  // Sauvegarder le solde mis à jour
        }
      }
    }

    console.log('Progression des dividendes mise à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des dividendes:', error);
  }
});