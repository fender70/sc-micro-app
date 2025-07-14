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

## 2024-04-20 — Project Tracker Dashboard Integration

### Challenge: Work Orders vs Projects Data Relationship
- Users wanted to see both work orders and projects data in an integrated way.
- Needed to show how individual work orders relate to broader customer projects.
- Solution: Created a tabbed dashboard with Overview, Projects, and Work Orders views.
- Learned: Business users think in terms of projects, not just individual work orders.

### Challenge: Enhanced Data Visualization
- Simple stats weren't enough - needed project tracking metrics and status breakdowns.
- Solution: Added project-specific metrics (active projects, completed projects, revenue tracking).
- Created visual status breakdown charts with color-coded progress bars.
- Learned: Visual data representation is crucial for business dashboards.

### Challenge: Customer-Centric Project View
- Users wanted to see all projects grouped by customer.
- Needed to show project relationships and customer context.
- Solution: Created a "Projects by Customer" view with customer cards containing related work orders.
- Added project count and status indicators for each customer.
- Learned: Grouping data by business relationships (customers) is often more useful than chronological order.

### Challenge: Responsive Tab Interface
- Needed to maintain good UX across different screen sizes.
- Solution: Created responsive tab navigation with proper mobile handling.
- Used CSS Grid for flexible layouts that adapt to content.
- Learned: Tab interfaces need careful mobile consideration.

### Challenge: Performance with useMemo
- Dashboard calculations were running on every render with large datasets.
- Solution: Implemented useMemo for expensive calculations (stats, filtering, grouping).
- Learned: React performance optimization is crucial for data-heavy dashboards.

### Challenge: Status Color Coding
- Needed consistent color scheme across different status types.
- Solution: Created a centralized status color mapping function.
- Applied colors consistently across stats, charts, and project items.
- Learned: Design systems need centralized color and status management.

### General Lessons
- Business dashboards need both high-level overview and detailed drill-down capabilities.
- Data relationships (customer → projects → work orders) are key to user understanding.
- Visual hierarchy and color coding help users quickly understand data.
- Performance optimization is essential for good user experience with large datasets.

---

## Next Steps
- Add more tracker rows to seed data if needed
- Continue to test with real CSVs from users
- Consider adding project timeline/calendar view
- Add export functionality for project reports
- Keep DEVJOURNAL updated with new challenges and solutions 