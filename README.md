# Luminar Capital

**Side - Front-end**

**Station - Office**

**Manager - Kateryna Syrota**

## Table of contents
- **[Introduction](#introduction)**
- **[Requirements](#requirements)**
- **[Installation](#installation)**
- **[Configuration](#configuration)**
- **[Getting Started](#getting-started)**

<h2 id="introduction">Introduction</h2>

The project is a corporate website. It provides flexible financing options for small businesses and offers partnerships for business growth.

<h2 id="requirements">Requirements</h2>

node version: 21.7.1

npm version: 10.5.0

<h2 id="installation">Installation</h2>

```bash
npm install
# or
yarn install
```

<h2 id="getting-started">Getting Started</h2>

For develop:

```bash
npm run dev
# or
yarn dev
```

Prepare for production:
```bash
npm run build
# or
yarn build
```

<h2 id="configuration">Configuration</h2>

Environment variables in ```.env```
* ``WORDPRESS_API_URL``
* ``SMTP_HOST``
* ``SMTP_PORT``
* ``SMTP_USER``
* ``SMTP_PASS``
* ``RECIPIENT_EMAIL``
* ``SENDER_EMAIL``
* ``SENDER_NAME``

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/**/*.ts](http://localhost:3000/api/**/*.ts). This endpoint can be edited in `pages/api/**/*.ts`.

The `app/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

<h2 id="getting-started">Getting Started</h2>

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Second, run the production server:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/page.tsx`. <br/>
The page auto-updates as you edit the file.