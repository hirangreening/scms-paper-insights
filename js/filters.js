/**
 * Manages filtering functionality for the SCMS Paper Insights application.
 *
 * This module handles:
 * - State tracking for additional filters (trimester only - others are coming soon)
 * - Modal UI for "More Filters" (open/close, apply/reset)
 * - Integration with main search via global `additionalFilters` object
 *
 * Note: Paper Type and Location filters are disabled (design preview only)
 * as those data points don't exist in the current database schema.
 *
 * @author Hiran Greening
 * @version 2.1
 * @since 2025-10-24
 */

// Initialize global additionalFilters
window.additionalFilters = window.additionalFilters || {
    trimester: []
};

/**
 * Initialises event listeners and behaviour for the advanced filters modal.
 *
 * Sets up:
 * - Modal open/close (via button, click outside, or Escape key)
 * - Apply/Reset buttons inside modal (only trimester filters work)
 * - "Clear All Filters" button on main page
 *
 * @function initFilters
 * @returns {Object} Reference to the global `additionalFilters` state object
 */
function initFilters() {
    console.log('initFilters called - initializing filter system');
    
    // Get references to key UI elements
    const moreFiltersButton = document.getElementById('moreFiltersButton');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const moreFiltersModal = document.getElementById('moreFiltersModal');
    const closeBtn = moreFiltersModal ? moreFiltersModal.querySelector('.close-button') : null;
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const resetFiltersButton = document.getElementById('resetFiltersButton');

    /**
     * Helper function to clear the active filters display
     */
    function clearActiveFiltersDisplay() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (activeFiltersContainer) {
            activeFiltersContainer.innerHTML = '';
        }
    }

    /**
     * Helper function to update filter badge and clear button visibility
     */
    function updateFilterUI() {
        if (typeof updateFilterBadge === 'function') {
            updateFilterBadge();
        }
        if (typeof updateClearButtonVisibility === 'function') {
            updateClearButtonVisibility();
        }
    }

    /**
     * Closes the "More Filters" modal and restores body scroll.
     */
    function closeMoreFiltersModal() {
        if (moreFiltersModal) {
            moreFiltersModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Open modal when "More Filters" button is clicked
    if (moreFiltersButton && moreFiltersModal) {
        moreFiltersButton.addEventListener('click', function () {
            moreFiltersModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal via X button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMoreFiltersModal);
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
        if (event.target === moreFiltersModal) {
            closeMoreFiltersModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && moreFiltersModal && moreFiltersModal.style.display === 'block') {
            closeMoreFiltersModal();
        }
    });

    // Apply selected filters - ONLY trimester filters work
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', function () {
            console.log('Apply filters button clicked');
            
            // Read trimester checkboxes and convert "A Trimester" → "A"
            const selectedTrimesters = Array.from(
                document.querySelectorAll('input[name="trimester"]:checked')
            ).map(el => {
                const value = el.value;
                // Extract just the first letter from "A Trimester", "B Trimester", etc.
                if (value.includes('Trimester')) {
                    return value.charAt(0); // Returns 'A', 'B', or 'C'
                }
                return value;
            });
            
            // Update the global window.additionalFilters object
            window.additionalFilters.trimester = selectedTrimesters;
            
            console.log('Applied trimester filters:', window.additionalFilters.trimester);

            // Close modal after applying
            closeMoreFiltersModal();

            // Re-run search to reflect new filters
            if (typeof window.searchPapers === 'function') {
                window.searchPapers();
            } else {
                console.warn('searchPapers function not found');
            }
        });
    }

    // Reset only trimester checkboxes (other filter groups are disabled)
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', function () {
            console.log('Reset filters button clicked');
            
            // Uncheck trimester checkboxes only
            document.querySelectorAll('input[name="trimester"]').forEach(cb => {
                cb.checked = false;
            });
            
            // Reset the filter state object
            window.additionalFilters.trimester = [];
            
            // Clear the active filters display
            clearActiveFiltersDisplay();
            
            // Update filter badge and clear button visibility
            updateFilterUI();
            
            console.log('Reset filters - trimester:', window.additionalFilters.trimester);
        });
    }

    // Clear ALL filters (main + advanced) and reset the UI
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', function () {
            console.log('Clear filters button clicked - before:', window.additionalFilters.trimester);
            
            // Clear main search input
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';

            // Reset dropdown filters
            const yearSelect = document.getElementById('yearSelect');
            const levelSelect = document.getElementById('levelSelect');
            const subjectSelect = document.getElementById('subjectSelect');
            if (yearSelect) yearSelect.value = '';
            if (levelSelect) levelSelect.value = '';
            if (subjectSelect) subjectSelect.value = '';

            // Reset advanced filter state
            window.additionalFilters.trimester = [];

            // Uncheck trimester checkboxes in the modal
            document.querySelectorAll('input[name="trimester"]').forEach(cb => {
                cb.checked = false;
            });

            // Clear the active filters display
            clearActiveFiltersDisplay();

            // Update filter badge and clear button visibility
            updateFilterUI();
            
            console.log('Clear filters button clicked - after:', window.additionalFilters.trimester);

            // Re-run search to show unfiltered results
            if (typeof window.searchPapers === 'function') {
                window.searchPapers();
            } else {
                console.warn('searchPapers function not found');
            }
        });
    }

    console.log('initFilters completed successfully');
    return window.additionalFilters;
}

// Expose function globally
window.initFilters = initFilters;

console.log('filters.js loaded, initFilters is available:', typeof initFilters);