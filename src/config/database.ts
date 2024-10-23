// src/config/database.ts

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    dialect: 'mysql',  // ou 'postgres' si tu utilises PostgreSQL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // important pour certaines configurations SSL
      }
    },
  }
);

export default sequelize;
