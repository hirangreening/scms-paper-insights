/**
 * Utility functions for the SCMS Paper Insights web application.
 *
 * Provides shared helper functionality used across multiple modules, including:
 * - Pass rate visualisation logic
 * - Dynamic date/time updates
 * - Year dropdown population for filters
 *
 * These utilities support consistent UI behaviour and reduce code duplication.
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

/**
 * Determines the appropriate CSS colour variable for a given pass rate.
 *
 * Returns semantic colour tokens (via CSS custom properties) based on performance thresholds:
 * - ≥80%: success (green)
 * - 60–79%: warning (orange)
 * - <60%: danger (red)
 * - Invalid/missing data: neutral gray
 *
 * @param {string|number|null|undefined} passRate - The pass rate value (may be a string or number)
 * @param {boolean} useCssVars - Whether to return CSS variables (true) or hex colors (false)
 * @returns {string} CSS custom property name or hex color code
 */
function getPassRateColor(passRate, useCssVars = true) {
    // Handle explicitly invalid or missing data
    if (passRate === null || passRate === undefined || passRate === '') {
        return useCssVars ? 'var(--uow-dark-gray)' : '#4A4A4A';
    }
    
    // Convert to number if passed as a string (e.g., from JSON)
    const rate = parseFloat(passRate);
    if (isNaN(rate)) {
        return useCssVars ? 'var(--uow-dark-gray)' : '#4A4A4A';
    }
    
    // Apply performance thresholds
    if (rate >= 80) return useCssVars ? 'var(--success-color)' : '#4CAF50';
    if (rate >= 60) return useCssVars ? 'var(--warning-color)' : '#FF9800';
    return useCssVars ? 'var(--danger-color)' : '#F44336';
}

/**
 * Updates the current date and time in the UI element with ID 'currentDateTime'.
 *
 * Formats the timestamp using New Zealand locale conventions (24-hour time,
 * short month names) for consistency with University of Waikato styling.
 *
 * @returns {void}
 */
function updateCurrentDateTime() {
    const now = new Date();
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleDateString('en-NZ', options);
    }
}

/**
 * Dynamically populates the year filter dropdown with the current year and two prior years.
 *
 * Used in the main search interface to provide relevant academic year options
 * without hardcoding values. Supports responsive filtering as described in the project report.
 *
 * @returns {void}
 */
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const maxYear = Math.min(currentYear, 2025); // Don't exceed your data
    
    for (let year = maxYear; year >= 2021; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}