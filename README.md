# Torque Block Trade

**A B2B Motorcycle Tyre Trading Platform**

Torque Block Trade is a business-focused motorcycle tyre trading platform designed to help customers explore motorcycle tyre products, check stock availability, discover brands, access business pricing, and place orders online.

The platform is built to simplify the tyre purchasing experience for business customers through a responsive interface and API-driven product catalogue.

**Live Website:** https://torque-block-trade.vercel.app/

**GitHub Repository:** https://github.com/jitendratb/TorqueBlock-Trade

---

## Key Features

- **Product Catalogue:** Browse motorcycle tyres available in the stock catalogue.
- **Brand Discovery:** Explore products from different motorcycle tyre brands.
- **Product Search:** Find products using the search functionality.
- **Product Filtering:** Discover products through brand and category filters.
- **Stock Availability:** View available stock information.
- **Business Pricing:** Access business-focused product pricing.
- **Customer Login:** Login interface for customer access.
- **Order Management:** Order drawer interface for managing the ordering experience.
- **Online Payments:** Razorpay checkout integration.
- **Responsive Design:** Optimized interface for desktop and mobile devices.
- **API Integration:** Retrieve catalogue and stock information through API services.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework |
| React 19 | User interface |
| Tailwind CSS 4 | Styling and responsive layouts |
| Zustand | State management |
| Axios | API communication |
| React Icons | Interface icons |
| ESLint | Code quality |
| Vercel | Deployment platform |

## Project Structure

```text
TorqueBlock-Trade/
│
├── public/
│   └── Static assets and images
│
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── orders/
│   │   ├── site/
│   │   └── ui/
│   │
│   ├── constants/
│   ├── lib/
│   └── services/
│
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
└── README.md
```

*Note: This is a high-level overview of the project structure.*

## Getting Started

Follow these instructions to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/jitendratb/TorqueBlock-Trade.git
```

### 2. Navigate to the Project

```bash
cd TorqueBlock-Trade
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory.

Add your backend API URL:

```env
API_URL=https://your-api-domain.com
```

Replace the example URL with your actual backend API endpoint.

### 5. Start the Development Server

```bash
npm run dev
```

Open the following URL in your browser:

```text
http://localhost:3000
```

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

## Deployment

The application is configured for deployment on Vercel.

To deploy:

1. Push the latest code to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Deploy the application.
5. Verify the production website and API connectivity.

**Live Deployment:** https://torque-block-trade.vercel.app/

## Payment Integration

The application includes Razorpay Checkout script integration.

Payment processing and related backend configuration should be maintained using the appropriate secure backend credentials.

Never commit API secrets, payment keys, or private credentials to the repository.

## Development & Maintenance

For future development:

- Keep product catalogue data synchronized with the backend.
- Maintain accurate stock availability.
- Test product search and filtering.
- Verify customer login and ordering workflows.
- Test payment integration before production releases.
- Maintain responsive layouts across mobile, tablet, and desktop.
- Run linting and production builds before deployment.

## Security

- Keep sensitive credentials in environment variables.
- Never expose private API keys in frontend code.
- Do not commit `.env.local` or other secret configuration files.
- Validate important transactions on the backend.
- Follow secure authentication and payment integration practices.

## License

This project is maintained for Torque Block's business operations.

All rights reserved. Unauthorized copying, redistribution, or commercial use of proprietary project code is not permitted without permission from the project owner.

---

**Developed for Torque Block**

*Simplifying Motorcycle Tyre Trading Through Technology.*
