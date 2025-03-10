# 🐾 Petopia

![Next.js](https://img.shields.io/badge/Next.js-13-black.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

<details>
<summary><b>🇬🇧 English Version (click to expand)</b></summary>

# 🐾 Petopia

Petopia is a modern pet store web application that allows users to browse and purchase products for their pets. The project is built using Django REST Framework for the backend and Next.js for the frontend.

## 🎯 Project Purpose

Petopia aims to provide pet owners with a convenient and user-friendly platform to discover and purchase high-quality products for their beloved animals. Our focus is on creating an intuitive shopping experience with thorough product information and seamless checkout process.

<div align="center">
    <img src="docs/images/main.png" alt="Petopia Main Page" width="800"/>
</div>

## 📌 Key Features

- 🛒 Full-featured shopping cart with editing capabilities
- 👤 User system with Google authentication
- ❤️ Wishlist for saving favorite products
- 🔍 Product search and filtering
- 💳 LiqPay payment system integration
- 📦 Order tracking and purchase history
- 📱 Responsive design for mobile devices

## 💻 Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion, Axios
- **Backend**: Django, Django REST Framework, PostgreSQL, Simple JWT for authentication, Social Auth for Google authorization
- **Infrastructure**: Docker and Docker Compose for containerization, Nginx as proxy server

## 🚀 Installation and Launch

### Using Docker (recommended):

```bash
# Clone the repository
git clone https://github.com/yourusername/petopia.git
cd petopia

# Create .env file from example
cp .env.example .env

# Edit .env with your settings
nano .env

# Launch containers
docker-compose up -d
```

### Local installation (for development):

```bash
# Frontend setup
cd Frontend/petopia
npm install
npm run dev

# Backend setup
cd Backend/petopia
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 📄 License

This project is distributed under the MIT license. See the [LICENSE](LICENSE) file for details.

</details>

## 🎯 Призначення проекту

Petopia створено для надання власникам домашніх тварин зручної та дружньої платформи для пошуку та придбання якісних товарів для їхніх улюбленців. Ми зосереджуємось на створенні інтуїтивного досвіду покупок з детальною інформацією про товари та безпроблемним процесом оформлення замовлення.

<div align="center">
    <img src="docs/images/main.png" alt="Petopia Main Page" width="800"/>
</div>

## 📌 Ключові можливості

<details>
<summary><b>👉 Розгорнути детальний опис можливостей</b></summary>

- 🛒 **Повноцінний кошик для покупок** з можливістю додавання, видалення та редагування кількості товарів
- 👤 **Розширена система користувачів** з авторизацією через Google, профілями та збереженими адресами доставки
- ❤️ **Персоналізований список бажань** для збереження улюблених товарів з швидким додаванням до кошика
- 🔍 **Потужний пошук і фільтрація** товарів за категоріями, цінами, брендами та іншими параметрами
- 💳 **Безпечна інтеграція з LiqPay** для швидкої та захищеної оплати замовлень
- 📦 **Детальне відстеження замовлень** та повна історія покупок у особистому кабінеті
- 📱 **Адаптивний дизайн** для мобільних пристроїв з оптимізованою навігацією та відображенням
- 🌟 **Система відгуків та оцінок** для товарів з можливістю додавання фотографій
- 🔔 **Сповіщення про знижки** та повернення товарів у наявність

</details>

## 💻 Технічний стек

<details>
<summary><b>👉 Розгорнути повний технічний опис</b></summary>

### Frontend
- **Next.js** з серверними компонентами для оптимізованого рендерингу та SEO
- **React** з функціональними компонентами та хуками для управління станом
- **Tailwind CSS** для гнучкого та ефективного стилізування інтерфейсу
- **Framer Motion** для плавних анімацій та покращення користувацького досвіду
- **Axios** для зручної роботи з HTTP запитами та інтеграції з бекендом
- **React Query** для ефективного кешування даних та управління станом запитів
- **React Hook Form** для валідації та обробки форм

### Backend
- **Django** з оптимізованою архітектурою для швидкої обробки запитів
- **Django REST Framework** для створення надійного та масштабованого API
- **PostgreSQL** для надійного зберігання даних та складних запитів
- **Simple JWT** для безпечної автентифікації користувачів
- **Social Auth** для інтеграції з Google OAuth та інших соціальних мереж
- **Celery** для асинхронної обробки задач (відправка повідомлень, генерація звітів)
- **Redis** для кешування та черг повідомлень

### Інфраструктура
- **Docker і Docker Compose** для контейнеризації та спрощення розгортання
- **Nginx** в якості проксі-сервера та для обслуговування статичних файлів
- **GitHub Actions** для CI/CD автоматизації
- **AWS S3** для зберігання медіа-файлів

</details>

## 🚀 Встановлення та запуск

<details>
<summary><b>Використання Docker (рекомендовано)</b></summary>

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
</details>

<details>
<summary><b>Локальне встановлення (для розробки)</b></summary>

```bash
# Для встановлення та запуску фронтенду:
cd Frontend/petopia
npm install
npm run dev

# Для встановлення та запуску бекенду:
cd Backend/petopia
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
</details>

## 📊 Адміністративний інтерфейс

Система включає розширену адмін-панель для керування товарами, замовленнями та користувачами:

<details>
<summary><b>👉 Переглянути всі скріншоти</b></summary>
<div align="center">
    <div>
        <img src="docs/images/admin1.png" width="45%" alt="Адмін-панель товарів"/>
        <img src="docs/images/admin2.png" width="45%" alt="Статистика продажів"/>
    </div>
    <div>
        <img src="docs/images/admin3.png" width="45%" alt="Управління замовленнями"/>
        <img src="docs/images/admin4.png" width="45%" alt="Налаштування магазину"/>
    </div>
</div>
</details>

<div align="center">
    <img src="docs/images/admin1.png" width="70%" alt="Адмін-панель товарів"/>
</div>

## 🌐 Змінні середовища

Створіть файл `.env` у кореневій директорії проекту зі змінними:

```
# Django Settings
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=petopia
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Google OAuth Settings
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LiqPay Settings
LIQPAY_PUBLIC_KEY=your_liqpay_public_key
LIQPAY_PRIVATE_KEY=your_liqpay_private_key

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## 📄 Ліцензія

Цей проект розповсюджується під ліцензією MIT. Детальніше у файлі [LICENSE](LICENSE).

