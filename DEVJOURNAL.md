# Developer Journal: SC Micro App

## 2024-04-20 — Adapting to Real Work Order Tracker Format

### Challenge: Real-World CSV Format Mismatch
- The original app and seed data used a simplified schema and CSV format.
- The real tracker (Work Order Tracker 20Apr 25.csv) had different columns, multi-line notes, and more complex status values.
- Solution: Refactored the CSV upload backend to map the new columns, handle multi-line fields, and use smart status mapping.
- Learned: Always confirm the real data format with the user before finalizing import/export features.

### Challenge: Status Enum Expansion
- The WorkRequest model originally only supported: pending, in-progress, completed, shipped.
- The tracker used many more statuses (quoted, po-received, payment, cancelled, etc).
- Solution: Expanded the enum in the Mongoose schema and updated all mapping logic.
- Learned: When supporting real business processes, expect status/state complexity to grow.

### Challenge: Seed Data Realism
- The original seed data was generic and not useful for real testing.
- Solution: Replaced with realistic customer and work request data from the actual tracker.
- Learned: Realistic seed data is invaluable for UI/UX and integration testing.

### Challenge: Multi-line CSV Fields
- The tracker CSV had multi-line notes and project details, which can break naive CSV parsing.
- Solution: Ensured the backend and template use proper CSV quoting and parsing for multi-line fields.
- Learned: Always test CSV import/export with real multi-line and edge-case data.

### Challenge: Keeping Template and Upload in Sync
- The template download and upload format must always match.
- Solution: Updated both the backend template and the frontend to use the new format.
- Learned: Automate or document template/schema changes to avoid drift.

### General Lessons
- Real user data is always messier than you expect.
- Schema and status flexibility is key for business apps.
- Good documentation (like this journal) helps future devs and yourself.

---

## Next Steps
- Add more tracker rows to seed data if needed
- Continue to test with real CSVs from users
- Keep DEVJOURNAL updated with new challenges and solutions 