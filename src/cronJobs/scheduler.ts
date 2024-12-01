// src/cron/scheduler.ts
import cron from 'node-cron';
import applyDailyInterest from './applyDailyInterest';

// Planifier la tâche cron pour s'exécuter tous les jours à 00:00 (minuit)
cron.schedule('0 0 * * *', async () => {
  await applyDailyInterest();
  console.log("Tâche cron exécutée - Intérêts appliqués");
});
