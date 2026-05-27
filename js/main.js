/**
 * Main client-side controller for the SCMS Paper Insights web application.
 *
 * Orchestrates UI initialization, event binding, and user interactions
 * for the paper search and filtering interface. Coordinates with backend
 * endpoints (e.g., searchPapers.php) via AJAX to dynamically update content.
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

/**
 * Initializes the application once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Populate the year dropdown with available academic years
    populateYearDropdown();

    // Display the current date and time in the header/footer (if element exists)
    updateCurrentDateTime();

    // Initialize filter state management (e.g., level, subject)
    // Result is stored globally for access by search functions
    window.additionalFilters = initFilters();

    // Get references to key UI elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const yearSelect = document.getElementById('yearSelect');
    const levelSelect = document.getElementById('levelSelect');
    const subjectSelect = document.getElementById('subjectSelect');

    // Hide the paper detail section on initial load (shown only after selection)
    const paperDetailSection = document.getElementById('paperDetailSection');
    if (paperDetailSection) {
        paperDetailSection.style.display = 'none';
    }

    // Hide the results section until a search is performed
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    // Bind search execution to the search button click
    if (searchButton) {
        searchButton.addEventListener('click', function (e) {
            e.preventDefault();
            searchPapers();
        });
    }

    // Allow search execution via Enter key in the search input
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchPapers();
            }
        });
    }

    // Trigger search automatically when any filter is changed
    if (yearSelect) {
        yearSelect.addEventListener('change', searchPapers);
    }
    if (levelSelect) {
        levelSelect.addEventListener('change', searchPapers);
    }
    if (subjectSelect) {
        subjectSelect.addEventListener('change', searchPapers);
    }

    // Set initial placeholder state in the paper grid
    const paperGrid = document.getElementById('paperGrid');
    if (paperGrid) {
        paperGrid.innerHTML = '<div class="no-results">Enter a search term or apply filters to see papers.</div>';
    }
});