# Petopia Backend

Бекенд частина проекту Petopia, побудована на Django та Django REST Framework.

## Особливості

- 🔐 JWT автентифікація
- 🌐 Соціальна автентифікація через Google
- 🛒 Управління замовленнями та кошиком
- 💳 Інтеграція з платіжною системою LiqPay
- 📊 Адміністративна панель для управління товарами

## Встановлення

```bash
# Створення віртуального середовища
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Встановлення залежностей
pip install -r requirements.txt

# Запуск міграцій
python manage.py migrate

# Створення адміністратора
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver
```

## API Ендпоінти

| Маршрут | Метод | Опис |
|---------|-------|------|
| /api/login/ | POST | Автентифікація користувача |
| /api/register/ | POST | Реєстрація нового користувача |
| /api/token/refresh/ | POST | Оновлення JWT токена |
| /api/user/me/ | GET | Отримання даних поточного користувача |
| /api/products/ | GET | Отримання списку товарів |
| /api/animal_categories/ | GET | Отримання категорій тварин |
| /api/item_categories/ | GET | Отримання категорій товарів |
| /api/orders/ | POST | Створення нового замовлення |
| /api/get-orders/ | GET | Отримання історії замовлень |

## Моделі даних

- CustomUser - розширена модель користувача
- Product - товар
- AnimalCategory - категорія тварин
- ItemCategory - категорія товарів
- Order - замовлення
- OrderItem - елемент замовлення

## Змінні середовища

Необхідні змінні середовища вказані в файлі `.env.example` в корені проекту.
