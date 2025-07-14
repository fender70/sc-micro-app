# SC Micro App

A light enterprise MERN app for managing work requests, customers, and project tracking.

## Features
- Dashboard with flexbox grid for work requests
- Customer and work request management (CRUD)
- CSV upload for bulk work order data
- Downloadable CSV template
- Realistic seed data based on actual tracker
- Modern React frontend
- Express/MongoDB backend

## CSV Upload
- **Now supports the Work Order Tracker format** (columns: Date Entered, Company Name, Contact, Status, Quote #, QTY, PO#, Invoice #, Amt Invoiced ($), Status2)
- Smart status mapping (pending, in-progress, completed, shipped, quoted, po-received, payment, cancelled)
- Multi-line notes and project details supported
- Template download matches tracker format

## Seed Data
- Example data in the database now matches the real tracker (see `seed-data.js`)
- Realistic companies, contacts, and project notes

## Developer Notes
- See `DEVJOURNAL.md` for a running log of challenges, solutions, and lessons learned during development

## Getting Started
1. Install dependencies: `npm install`
2. Start MongoDB
3. Seed the database: `node seed-data.js`
4. Start the app: `npm run dev`

---

For more details, see the DEVJOURNAL. 