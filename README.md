**GitHub:** https://github.com/hirangreening/scms-paper-insights

# SCMS Paper Insights

A web application for exploring and analyzing paper data from the School of Computing and Mathematical Sciences (SCMS) at the University of Waikato. This tool provides insights into paper offerings, staff involvement, student numbers, and pass rates across multiple years and trimesters.

## Features

* **Search & Filter:** Find papers by code, title, keyword, or lecturer name. Filter results by year, level, subject, and additional criteria (paper type, trimester, location).
* **Paper Overview:** View a summary card for each unique paper, displaying average metrics like pass rate and student count.
* **Detailed Paper History:** Click on a paper card to see a modal with a complete history of its occurrences (offerings across different years/trimesters) in a navigable carousel format.
* **Historical Analysis & Comparison:** Access detailed statistical views and charts for a specific paper to analyze trends over time (e.g., pass rate fluctuations, student enrollment changes).
* **Responsive Design:** Optimized for viewing on desktops, tablets, and mobile devices, matching the University of Waikato's visual identity.

## Tech Stack

* **Frontend:** HTML, CSS, JavaScript (modular structure)
* **Backend:** PHP (running on XAMPP local server)
* **Database:** MySQL (managed via phpMyAdmin)

## Data Flow

`SQL Database` → `PHP Scripts` → `JSON` → `JavaScript (Fetch API)` → `Dynamic HTML/CSS`

## Database Schema

The database follows a normalized many-to-many relationship:

- **Paper** (1) -----< (M) **Occurrence** (M) >----- (1) **Staff**
                                  |
                            Occurrence_Staff
                            (junction table)

A Paper can have many Occurrences (offerings across years/trimesters).
A Staff member can teach many Occurrences.
An Occurrence can have multiple Staff members.
The Occurrence_Staff table links them together.

## Prerequisites

* XAMPP (or equivalent local server environment with Apache, MySQL, and PHP)
* phpMyAdmin (usually bundled with XAMPP)
* A modern web browser

## How to Run Locally

1. **Set Up Database:**
   * Start MySQL service in XAMPP.
   * Open phpMyAdmin (usually `http://localhost/phpmyadmin`).
   * Create a new database called `paper_insights_db`.
   * Import the SQL files **in this order**:
     1. `SQL/schema.sql` - Creates all tables
     2. `SQL/data.sql` - Inserts all data (83 papers, 37 staff, 723 occurences)
     3. `SQL/constraints.sql` - Add foreign keys, indexes, and constraints

2. **Configure Database Connection:**
   - Edit `php/config.php` with your database credentials:
     - `$dbname = 'paper_insights_db';`
     - `$username = 'root';`
     - `$password = '';` (default for XAMPP)

3. **Deploy Application:**
   - Place the project folder into the XAMPP `htdocs` directory.

4. **Start Server:**
   - Start the Apache service in XAMPP.

5. **Access Application:**
   - Open your browser and navigate to `http://localhost/scms-paper-insights`   

## Key Directories & Files

* `index.html`: Main dashboard/search page.
* `comparisons/paper-comparison.html`: Detailed statistical analysis page with Chart.js visualizations.
* `assets/css/`: Contains `styles.css` for overall styling and `comparison-styles.css` for the comparison page.
* `assets/img/`: Stores images like the Waikato logo.
* `JavaScript/`: Client-side logic.
  * `main.js`: Initializes the application, sets up event listeners.
  * `search.js`: Handles the search and filter logic, calls backend APIs.
  * `display.js`: Manages the display of search results and paper details modals.
  * `filters.js`: Logic for the "More Filters" modal and filter state management.
  * `utils.js`: Utility functions (e.g., `getPassRateColor`, date formatting).
  * `comparison.js`: Chart generation and data visualization for comparison page.
  * `carousel.js`: Paper history navigation in modals.
* `php/`: Server-side scripts.
  * `config.php`: Database connection configuration.
  * `searchPapers.php`: Primary API endpoint for searching/filtering papers (returns unique papers with aggregated data).
  * `getPaperHistory.php`: API endpoint to fetch all occurrences for a specific paper.
  * `getPapers.php`: Fetches basic paper list.
  * `db.php`: Database utility functions.
* `comparisons/`: Contains `paper-comparison.html` and related scripts for detailed analysis.
* `SQL/`: Database schema and data files.
  * `schema.sql`: Creates all 4 tables (Paper, Staff, Occurrence, Occurrence_Staff)
  * `data.sql`: Inserts all data (83 papers, 37 staff, 723 occurrences)
  * `constraints.sql`: Adds foreign keys, indexes, and unique constraints
  * `README.md`: Database setup instructions
* `test/`: Contains test scripts for database connection, API endpoints, data integrity, and JavaScript functions.

## API Endpoints

* `searchPapers.php` - Main search with filtering (`q`, `year`, `level`, `subject`, `trimesters`, `paperTypes`, `locations`)
* `getPaperHistory.php` - Fetch all historical occurrences for a paper (`paper_id`)
* `getPapers.php` - Retrieve complete paper list

## Recent Enhancements

* **Aggregated Search Results:** The main search now returns unique papers with calculated average metrics (pass rate, student count) instead of listing every single occurrence.
* **Enhanced Search:** Searching now includes lecturer names associated with papers.
* **Comprehensive Data:** Full 5-year dataset (2021-2025) with realistic enrollment patterns and staff assignments.
* **Statistical Analysis Page:** Dedicated comparison page with Chart.js visualizations and sortable data tables.
* **Testing Framework:** Comprehensive test suite for backend endpoints, data integrity, and frontend functionality.

## Next Steps / Future Improvements

* Implement interactive Chart.js visualizations for comparisons and trends between papers
* Add comprehensive error handling throughout the application
* Implement data export functionality (CSV, PDF reports)
* Expand the test suite with more unit and integration tests
* Further refine UI/UX based on user feedback

---
**Developed as part of COMPX397 (Final Year Project) at the University of Waikato**
*Supervisor: Associate Professor Judy Bowen (Client Representative for SCMS)*
