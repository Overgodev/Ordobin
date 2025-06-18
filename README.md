# Ordobin

*Personal Drawer & Inventory Management System*

Ordobin is a self‑hosted platform that helps you keep track of everything that lives in your cabinets and drawers—down to the last screw. Built on a **full‑stack Next.js** code‑base (React + Tailwind UI with API routes) and **PostgreSQL + Prisma**, it shows you **what you have, where it lives, and how much is left**—in real time.

---

## ✨ Key Features

| Area                           | Highlights                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| **Full‑stack Next.js**         | Single repo: React + Tailwind frontend & API routes powered by Prisma ORM.          |
| **Hierarchical Storage Model** | Cabinet → Drawer → Compartment → Item; variable‑depth layouts match real furniture. |
| **Human‑readable HEX IDs**     | `XX-XXXX` codes encode data type & serial—ideal for QR / NFC labels.                |
| **Weight‑based Quantity**      | One weight station logs mass; Ordobin converts it to item count automatically.      |
| **Print‑farm Friendly**        | Track filament spools, nozzle wear, and print queues alongside ordinary inventory.  |

---

## 🏗️ Architecture

```
┌────────────────────┐  HTTP / WS  ┌──────────────────────┐
│  Next.js App       │───────────▶│ PostgreSQL + Prisma  │
│  (UI + API routes) │◀───────────│   (Docker container) │
└────────────────────┘            └──────────────────────┘
        ▲
   QR / NFC 📱
        │
Weight Station ⚖️
```

*All services are managed within a single unified repository—no external service dependency required.*

---

## 🗄️ Database Schema Snapshot

* **cabinet** (`id`, `name`, `location`)
* **drawer** (`id`, `cabinet_id`, `label`, `max_load_g`)
* **compartment** (`id`, `drawer_id`, `label`, `hex_id`)
* **item** (`id`, `compartment_id`, `name`, `unit_weight_g`, `hex_id`)
* **weight\_log** (`id`, `compartment_id`, `measured_g`, `measured_at`)

Migration files live in `/prisma/migrations`.

---

## 🚀 Quick Start (Dev)

```bash
# 1 – Clone
 git clone https://github.com/YourUser/ordobin.git
 cd ordobin

# 2 – Start PostgreSQL
 docker compose up -d db

# 3 – Install deps & run migrations
 pnpm install
 pnpm prisma migrate dev --name init

# 4 – Launch dev server
 pnpm dev          # http://localhost:3000
```

Need Windows? See `docs/windows.md`.

---

## 📅 Roadmap

* [ ] Drawer capacity auto‑calibration
* [ ] Companion mobile app (Flutter)
* [ ] Role‑based access & sharing
* [ ] Hardware reference design for ESP32 weight bridge

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes. Read our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📜 License

Ordobin is released under the MIT License. See `LICENSE` for details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
