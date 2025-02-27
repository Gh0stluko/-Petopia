const path = require('path');
const dotenv = require('dotenv');

// Виправлений шлях до вашого файлу .env
const envPath =   path.join(process.cwd(), '../../.env');

// Завантажуємо змінні середовища
dotenv.config({ path: envPath });

// Експортуємо GOOGLE_CLIENT_ID як константу
module.exports = {
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
};