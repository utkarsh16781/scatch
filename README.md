# Scatch

Express + MongoDB shop with user accounts, a cart and an owner panel with image upload.

## Setup

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `JWT_KEY` (keep `NODE_ENV=development` while developing).
3. Start MongoDB locally (`mongodb://127.0.0.1:27017`).
4. Run `npm run dev` and open http://localhost:3000

## Create the owner (once)

Only works while `NODE_ENV=development`. In Postman: `POST http://localhost:3000/owners/create`, body raw JSON:

    { "fullname": "Your Name", "email": "owner@example.com", "password": "123456" }

Then log in at http://localhost:3000/owners/login and add products from the owner panel.

## Pages

| URL | Who | What |
| --- | --- | --- |
| `/` | anyone | Create account / log in |
| `/shop` | user | All products, add to cart |
| `/cart` | user | Quantities, remove, bill |
| `/owners/login` | owner | Owner login |
| `/owners/admin` | owner | Add and delete products |

`POST /users/register` and `POST /users/login` also accept JSON (Postman) and return `{ user, token }`.
