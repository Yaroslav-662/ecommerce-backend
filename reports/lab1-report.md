# Звіт з лабораторної роботи 1

## Тема роботи: Розроблення backend архітектури та основного функціоналу

Здобувач освіти: Поліщук Ярослав Анатолійович
Група: ІПЗ-42
GitHub репозиторій: https://github.com/Yaroslav-662/ecommerce-backend.git

## Виконання роботи

### Налаштування проєкту
- Створено Git репозиторій ecommerce-backend.

- Ініціалізовано Node.js проєкт (npm init -y).

- Встановлено необхідні залежності:
express, mongoose, dotenv, jsonwebtoken, bcryptjs, nodemon, cors, body-parser.

- Створено структуру директорій відповідно до патерну MVC.

- Налаштовано .env з параметрами:
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/cosmetics_shop
    JWT_SECRET=secretkey

### База даних
- Налаштовано MongoDB (локально, через mongod).

Створено базу cosmetics_shop.

- Описано Mongoose-схеми для:

- User — ім’я, email, пароль, роль;

- Category — назва, опис;

- Product — назва, опис, ціна, категорія, залишок;

- Order — користувач, товари, загальна сума.

### Backend архітектура
- Реалізовано Express.js сервер (app.js).

- Впроваджено архітектуру MVC:

- /models — Mongoose-моделі;

- /controllers — логіка роботи з даними;

- /routes — API маршрути;

- /utils — валідація та обробка помилок.

- Підключено middleware для:

- парсингу JSON (body-parser);

- авторизації через JWT;

- обробки помилок;

- CORS.

### API endpoints
Категорії

POST /api/categories

{
  "name": "Тональні креми",
  "description": "Для всіх типів шкіри"
}

GET /api/categories — отримати всі категорії.
DELETE /api/categories/:id — видалити категорію.

Для авторизації використовується токен у Headers:
Authorization: Bearer <JWT_TOKEN>

Продукти

POST /api/products

{
  "name": "Тональний крем Light",
  "description": "Легкий тон для щоденного використання",
  "price": 350,
  "category": "<CategoryID>",
  "stock": 20
}

GET /api/products — отримати всі товари.
PUT /api/products/:id — оновити товар.
DELETE /api/products/:id — видалити товар.

Користувачі

POST /api/users/register

{
  "name": "Ярослав",
  "email": "yaroslav@example.com",
  "password": "123456"
}

POST /api/users/login

{
  "email": "yaroslav@example.com",
  "password": "123456"
}

Після логіну у відповіді приходить JWT-токен:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Цей токен використовується для захищених запитів (наприклад, DELETE категорії).

Замовлення

POST /api/orders

{
  "user": "<UserID>",
  "items": [
    { "product": "<ProductID>", "quantity": 2, "price": 350 }
  ],
  "totalPrice": 700
}

GET /api/orders — перегляд усіх замовлень (адмін або користувач).

## Структура проєкту

ecommerce-backend/
│
├── src/
│ ├── controllers/
│ │ ├── productController.js
│ │ ├── categoryController.js
│ │ ├── userController.js
│ │ └── orderController.js
│ │
│ ├── models/
│ │ ├── Product.js
│ │ ├── Category.js
│ │ ├── User.js
│ │ └── Order.js
│ │
│ ├── routes/
│ │ ├── productRoutes.js
│ │ ├── categoryRoutes.js
│ │ ├── userRoutes.js
│ │ └── orderRoutes.js
│ │
│ ├── utils/
│ │ ├── errorHandler.js
│ │ └── validation.js
│ │
│ └── app.js
│
├── .env
├── package.json
├── README.md
└── reports/
└── lab1-report.md

## Скріншоти тестування
 
 
 
 
 
 
 
 
 

## Висновки
У ході лабораторної роботи створено серверну частину системи електронної комерції з підтримкою CRUD-операцій, JWT-авторизацією та підключенням до MongoDB.
Тестування проводилось у Postman на порту 5001.
Всі запити успішно виконані, структура відповідає вимогам MVC.

Самооцінка: 5 / 5
Обґрунтування: система повністю функціонує, всі маршрути протестовані, реалізовано авторизацію, робота виконана на високому рівні.