# 🐾 Petopia

Petopia - це сучасний веб-магазин для домашніх тварин, який дозволяє користувачам переглядати та купувати товари для своїх улюбленців. Проект розроблено з використанням Django REST Framework для бекенду та Next.js для фронтенду.

![Petopia Screenshot](https://placeholder-for-screenshot.com) <!-- Замініть на реальний скріншот -->

## 🚀 Особливості

- 🛒 Повноцінний кошик для покупок з можливістю редагування
- 👤 Система користувачів з авторизацією через Google
- ❤️ Список бажань для збереження улюблених товарів
- 🔍 Пошук і фільтрація товарів
- 💳 Інтеграція з платіжною системою LiqPay
- 📦 Відстеження замовлень та історія покупок
- 📱 Адаптивний дизайн для мобільних пристроїв

## 🔧 Технології

### Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT для автентифікації
- Social Auth для Google авторизації

### Інфраструктура
- Docker і Docker Compose для контейнеризації
- Nginx для проксі-сервера

## 🛠️ Встановлення та запуск

### Передумови
- Docker і Docker Compose
- Node.js (для локальної розробки)
- Python 3.9+ (для локальної розробки)

### Запуск через Docker
```bash
# Клонувати репозиторій
git clone https://github.com/yourusername/petopia.git
cd petopia

# Створити файл .env на основі прикладу
cp .env.example .env

# Відредагувати файл .env із вашими налаштуваннями
nano .env

# Запустити контейнери
docker-compose up -d
```

### Запуск без Docker
Для встановлення та запуску фронтенду:
```bash
cd Frontend/petopia
npm install
npm run dev
```

Для встановлення та запуску бекенду:
```bash
cd Backend/petopia
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🌐 Змінні середовища

Створіть файл `.env` у кореневій директорії проекту зі змінними:

