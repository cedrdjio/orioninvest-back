// src/cron/applyDailyInterest.ts
import { Op } from 'sequelize';
import moment from 'moment';
import User from '../models/User';
import Package from '../models/Package';
import Transaction from '../models/Transaction';

// Fonction pour appliquer les intérêts quotidiens
export default async function applyDailyInterest() {
  console.log("Exécution du cron job - Application des intérêts");

  // Récupérer toutes les transactions de type 'package_purchase' qui sont actives
  const transactions = await Transaction.findAll({
    where: {
      type: 'purchase', // Rechercher les achats de package
      createdAt: {
        [Op.lte]: moment().toDate(),
      },
    },
    include: {
      model: Package,
      required: true,
    },
  });

  for (const transaction of transactions) {
    const { userId, packageId, amount, createdAt } = transaction;
    const user = await User.findByPk(userId);
    const packageToBuy = await Package.findByPk(packageId);

    if (!user || !packageToBuy) {
      console.log(`Utilisateur ou package non trouvé pour la transaction ID: ${transaction.id}`);
      continue;
    }

    // Calculer les intérêts journaliers
    const dailyInterest = (packageToBuy.price * packageToBuy.interestRate) / 100;

    // Calculer le nombre de jours écoulés depuis l'achat (hors le jour de l'achat)
    const daysSincePurchase = moment().diff(moment(createdAt), 'days');

    if (daysSincePurchase > 0) {
      // Appliquer les intérêts au solde de l'utilisateur chaque jour
      for (let i = 0; i < daysSincePurchase; i++) {
        user.balance += dailyInterest;
        await user.save();

        // Créer une nouvelle transaction pour l'intérêt appliqué
        await Transaction.create({
          userId: user.id,
          type: 'interest',
          amount: dailyInterest,
          packageId: packageToBuy.id,
          status: 'completed',
        });
        console.log(`Intérêt ajouté pour l'utilisateur ${user.id} pour le jour ${i + 1}`);
      }
    }
  }
}
