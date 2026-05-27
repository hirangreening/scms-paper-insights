# SCMS Paper Insights

Web application for analyzing SCMS paper data at the University of Waikato. Client-approved proof-of-concept for the School of Computing and Mathematical Sciences.

**COMPX397 Final Project** | **Supervisor: Assoc. Prof. Judy Bowen**

🔗 https://github.com/hirangreening/scms-paper-insights

## Features

- Search by code, title, keyword, or lecturer
- Filter by year, level, subject, trimester
- Paper cards with avg. pass rate and student count
- Modal with historical offering carousel
- Comparison page with charts and sortable tables
- Responsive, university-aligned design

## Tech Stack

Frontend: HTML, CSS, JavaScript (modular) | Backend: PHP | Database: MySQL

## Data Flow

SQL → PHP → JSON → JavaScript → Dynamic UI

## Database Schema

Paper (1) ---< (M) Occurrence (M) >--- (1) Staff
                    |
              Occurrence_Staff (junction table)

## Setup

1. Create database: `paper_insights_db`
2. Import in this order:
   - `SQL/schema.sql`
   - `SQL/data.sql`
   - `SQL/constraints.sql`
3. Update `php/config.php` with your credentials *(XAMPP defaults: `root` / empty password)*   
5. Place folder in `htdocs` and access via browser

## Directory Structure

- `index.html` - Main dashboard
- `comparisons/` - Stats page with Chart.js
- `assets/css/` - Stylesheets
- `js/` - All JavaScript modules
- `php/` - API endpoints
- `SQL/` - Schema, data, constraints

## API Endpoints

- `searchPapers.php` - Search with filters
- `getPaperHistory.php` - Full paper history
- `getPapers.php` - All papers list

---
*University of Waikato | COMPX397*
