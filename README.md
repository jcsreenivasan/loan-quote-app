# Loan Quote Tool

Mortgage loan quoting tool for loan officers. Browser-only — no backend, no login, no database.

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

```bash
npx vercel
```

## Deploy to Netlify

```bash
npx netlify deploy --build
```

## Customise branding

Edit `lib/brand.ts` — broker name, NMLS, loan officer info, colors, logo path.

## Customise fee defaults

Edit `lib/rules.ts` — default line items, VA funding fee tiers, APR inclusion rules, validation bounds.

## Project structure

```
lib/
  types.ts          Data model interfaces
  rules.ts          All business rules & fee tables (config-driven)
  calculations.ts   Pure calculation functions (P&I, funding fee, escrow, totals)
  ruleEngine.ts     Field visibility, labels, validation
  defaults.ts       Default quote state, localStorage helpers, formatters
  brand.ts          Broker / officer branding

components/
  ui/               Primitive inputs (Currency, Percent, Toggle, Select, etc.)
  form/             Form sections (Property, Loan Parameters, Amounts, etc.)
  closing-costs/    Closing cost sections, line item lists, Add Config modal
  layout/           Sidebar, TopNav

app/
  page.tsx                    Main quote form
  preview/loan-quote/         3-page printable Loan Quote (PDF via browser print)
```
