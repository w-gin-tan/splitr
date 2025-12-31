# Perth Split 🧾💰

A bill-splitting app for Perth, Australia - inspired by VibeSplit. Scan receipts, assign items to friends, and settle up with Australian payment methods.

## 🎯 Features

- **📸 Scan or Upload Receipts** - Use your camera or upload receipt images
- **🔍 Automatic Item Detection** - AI-powered OCR extracts items and prices
- **👆 Tap to Assign Items** - Easily assign items to people or mark as shared
- **🔗 Share Payment Links** - Generate shareable links for friends to see their share
- **💵 Australian Payment Options** - PayID, PayPal, Beem It, bank transfer support
- **📊 Track Payments** - See who's paid and who still owes
- **🇦🇺 Perth/Australia Focused** - AUD currency, GST handling, local receipt formats

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Supabase or Neon)
- **NextAuth.js** - Authentication

### OCR & AI
- **Google Cloud Vision API** or **Tesseract.js** - Receipt text extraction
- **OpenAI GPT-4** (optional) - Intelligent item parsing

### Payments
- **PayID** - Australian instant payment system
- **PayPal SDK** - Online payments
- **Stripe** - Card payments (optional)

### Deployment
- **Vercel** - Frontend & API hosting
- **Supabase** or **Neon** - Managed PostgreSQL

---

## 📁 Project Structure

```
perth-split/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── receipts/      # Receipt CRUD
│   │   │   ├── ocr/           # OCR processing
│   │   │   └── splits/        # Bill splitting logic
│   │   ├── split/[id]/        # Public split view page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── receipt/           # Receipt-related components
│   │   │   ├── ReceiptScanner.tsx
│   │   │   ├── ReceiptPreview.tsx
│   │   │   └── ItemList.tsx
│   │   ├── split/             # Split-related components
│   │   │   ├── PersonAssignment.tsx
│   │   │   ├── SplitSummary.tsx
│   │   │   └── ShareLink.tsx
│   │   └── payment/           # Payment components
│   │       ├── PaymentOptions.tsx
│   │       ├── PayIDDisplay.tsx
│   │       └── PaymentTracker.tsx
│   ├── lib/
│   │   ├── ocr/               # OCR utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth configuration
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Setup & Development Workflow

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (or use Supabase/Neon free tier)
- Google Cloud account (for Vision API) or use Tesseract.js for free OCR

### Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd perth-split
npm install
```

### Step 2: Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OCR (choose one)
GOOGLE_CLOUD_VISION_API_KEY="your-api-key"
# OR use Tesseract.js (no API key needed)

# Optional: OpenAI for smart parsing
OPENAI_API_KEY="your-api-key"

# PayPal (optional)
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-secret"
```

### Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with test data
npx prisma db seed
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Development Workflow

### Phase 1: Core MVP (Week 1-2)
1. ✅ Project setup with Next.js, TypeScript, Tailwind
2. ✅ Database schema design
3. ✅ Basic UI components (receipt upload, item list)
4. ✅ Manual item entry (before OCR)
5. ✅ Person assignment UI
6. ✅ Split calculation logic
7. ✅ Shareable link generation

### Phase 2: OCR Integration (Week 2-3)
1. ⬜ Integrate Tesseract.js for client-side OCR
2. ⬜ Or integrate Google Cloud Vision API
3. ⬜ Receipt parsing logic (extract items, prices, GST)
4. ⬜ Handle Australian receipt formats

### Phase 3: Payments & Tracking (Week 3-4)
1. ⬜ PayID display and copy functionality
2. ⬜ PayPal payment links
3. ⬜ Manual payment confirmation
4. ⬜ Payment status tracking
5. ⬜ Email/SMS notifications (optional)

### Phase 4: Polish & Deploy (Week 4-5)
1. ⬜ Authentication (email/Google sign-in)
2. ⬜ Mobile responsiveness
3. ⬜ PWA support (installable app)
4. ⬜ Error handling & loading states
5. ⬜ Deploy to Vercel
6. ⬜ Set up production database

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📱 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Database Options

**Option 1: Supabase (Recommended for beginners)**
- Free tier available
- Built-in auth (optional)
- Easy setup

**Option 2: Neon**
- Serverless PostgreSQL
- Free tier available
- Great for Vercel

**Option 3: Railway**
- Simple deployment
- $5/month after trial

---

## 🇦🇺 Australian-Specific Features

### Payment Methods
1. **PayID** - Display PayID for instant bank transfers
2. **Beem It** - Deep link to Beem It app
3. **PayPal.me** - PayPal payment links
4. **Bank Transfer** - Display BSB/Account details

### Receipt Handling
- GST extraction (10% in Australia)
- Australian date formats (DD/MM/YYYY)
- AUD currency formatting ($XX.XX)

### Local Considerations
- Perth timezone (AWST/UTC+8)
- Australian phone number validation
- Local restaurant/venue recognition (future)

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts` | Upload new receipt |
| GET | `/api/receipts/[id]` | Get receipt details |
| POST | `/api/ocr` | Process receipt image |
| POST | `/api/splits` | Create new split |
| GET | `/api/splits/[id]` | Get split details (public) |
| PATCH | `/api/splits/[id]/pay` | Mark payment as complete |

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

---

**Built with ❤️ in Perth, Australia**
