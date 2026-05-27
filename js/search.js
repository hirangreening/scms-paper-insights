/**
 * Handles paper search with state management and industry-standard UX.
 *
 * @author Hiran Greening  
 * @version 3.1
 * @since 2025-10-24
 */

// Use var instead of let to avoid redeclaration issues, or ensure it's only declared once
var searchTimeout;

function searchPapers() {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 300);
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const yearSelect = document.getElementById('yearSelect');
    const levelSelect = document.getElementById('levelSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const paperGrid = document.getElementById('paperGrid');

    // Use window.additionalFilters with default empty object
    const additionalFilters = window.additionalFilters || { trimester: [] };
    
    // Ensure properties exist to avoid undefined errors
    const paperTypes = additionalFilters.paperType || [];
    const trimesters = additionalFilters.trimester || [];
    const locations = additionalFilters.location || [];

    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const year = yearSelect ? yearSelect.value : '';
    const level = levelSelect ? levelSelect.value : '';
    const subject = subjectSelect ? subjectSelect.value : '';

    console.log('=== PERFORMING SEARCH ===', {
        searchTerm,
        year,
        level,
        subject,
        additionalFilters
    });

    // Update URL state before search (makes URLs shareable)
    if (typeof updateURLState === 'function') {
        updateURLState();
    }

    // Show loading state
    if (paperGrid) {
        paperGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">Searching papers...</div>
            </div>
        `;
    }

    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }

    // Build query URL
    let url = `php/searchPapers.php?q=${encodeURIComponent(searchTerm)}`;
    if (year) url += `&year=${encodeURIComponent(year)}`;
    if (level) url += `&level=${encodeURIComponent(level)}`;
    if (subject) url += `&subject=${encodeURIComponent(subject)}`;
    
    // Only add filters if they have values
    if (paperTypes.length > 0) {
        url += `&paperTypes=${encodeURIComponent(paperTypes.join(','))}`;
    }
    if (trimesters.length > 0) {
        url += `&trimesters=${encodeURIComponent(trimesters.join(','))}`;
    }
    if (locations.length > 0) {
        url += `&locations=${encodeURIComponent(locations.join(','))}`;
    }

    console.log('API Request URL:', url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);

            if (!Array.isArray(data)) {
                if (data?.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error('Invalid data format from server');
                }
            }

            // Update all UI states
            updateActiveFiltersDisplay();
            updateFilterBadge();
            updateClearButtonVisibility();

            if (typeof displayResults === 'function') {
                displayResults(data);
            } else {
                console.error('displayResults function is not defined');
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            if (paperGrid) {
                paperGrid.innerHTML = `<div class="error">Error searching papers: ${error.message}</div>`;
            }
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Still update UI states even on error
            updateActiveFiltersDisplay();
            updateFilterBadge();
            updateClearButtonVisibility();
        });
}

function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;
    
    activeFiltersContainer.innerHTML = '';
    
    const additionalFilters = window.additionalFilters || {
        trimester: []
    };
    
    // Search term chip
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        createFilterChip('Search', `"${searchInput.value}"`, () => {
            searchInput.value = '';
            if (typeof updateURLState === 'function') updateURLState();
            searchPapers();
        });
    }
    
    // Year filter chip
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect && yearSelect.value) {
        createFilterChip('Year', yearSelect.value, () => {
            yearSelect.value = '';
            if (typeof updateURLState === 'function') updateURLState();
            searchPapers();
        });
    }
    
    // Level filter chip  
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect && levelSelect.value) {
        createFilterChip('Level', levelSelect.value, () => {
            levelSelect.value = '';
            if (typeof updateURLState === 'function') updateURLState();
            searchPapers();
        });
    }
    
    // Subject filter chip
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect && subjectSelect.value) {
        createFilterChip('Subject', subjectSelect.value, () => {
            subjectSelect.value = '';
            if (typeof updateURLState === 'function') updateURLState();
            searchPapers();
        });
    }
    
    // Trimester filters chips (only filter that exists)
    if (additionalFilters.trimester && additionalFilters.trimester.length > 0) {
        additionalFilters.trimester.forEach(value => {
            const displayName = value === 'A' ? 'A Trimester' : (value === 'B' ? 'B Trimester' : 'C Trimester');
            createFilterChip('Trimester', displayName, () => {
                // Remove this specific filter
                additionalFilters.trimester = additionalFilters.trimester.filter(v => v !== value);
                // Update checkboxes in modal
                document.querySelectorAll('input[name="trimester"]').forEach(cb => {
                    const cbValue = cb.value.charAt(0);
                    if (cbValue === value) {
                        cb.checked = false;
                    }
                });
                if (typeof updateURLState === 'function') updateURLState();
                searchPapers();
            });
        });
    }
}

function createFilterChip(type, value, onRemove) {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.innerHTML = `
        ${type}: ${value}
        <button class="remove-btn" aria-label="Remove filter">×</button>
    `;
    
    const removeBtn = chip.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        onRemove();
    });
    
    chip.addEventListener('click', function(e) {
        if (e.target !== removeBtn) {
            onRemove();
        }
    });
    
    container.appendChild(chip);
}

function getFilterDisplayName(type, value) {
    const displayNames = {
        trimester: {
            'A': 'A Trimester',
            'B': 'B Trimester',
            'C': 'C Trimester'
        }
    };
    
    return displayNames[type]?.[value] || value;
}

function updateFilterBadge() {
    const moreFiltersButton = document.getElementById('moreFiltersButton');
    if (!moreFiltersButton) return;
    
    const additionalFilters = window.additionalFilters || {
        trimester: []
    };
    
    let activeCount = 0;
    
    if (additionalFilters.trimester) {
        activeCount += additionalFilters.trimester.length;
    }
    
    const existingBadge = moreFiltersButton.querySelector('.filter-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    if (activeCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'filter-badge';
        badge.textContent = activeCount;
        moreFiltersButton.style.position = 'relative';
        moreFiltersButton.appendChild(badge);
    }
}

function updateClearButtonVisibility() {
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    if (!clearFiltersButton) return;
    
    const searchInput = document.getElementById('searchInput');
    const yearSelect = document.getElementById('yearSelect');
    const levelSelect = document.getElementById('levelSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    
    const additionalFilters = window.additionalFilters || {
        trimester: []
    };
    
    const hasFilters = 
        (searchInput?.value.trim()) ||
        (yearSelect?.value) ||
        (levelSelect?.value) ||
        (subjectSelect?.value) ||
        (additionalFilters.trimester && additionalFilters.trimester.length > 0);
    
    clearFiltersButton.style.display = hasFilters ? 'inline-flex' : 'none';
}

// Set up real-time search on input - use DOMContentLoaded to avoid duplicate listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchPapers);
        }
    });
} else {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchPapers);
    }
}