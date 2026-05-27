/**
 * Renders paper search results and detailed paper history modals
 * for the SCMS Paper Insights web application.
 *
 * This module handles:
 * - Displaying aggregated paper cards with pass rate visualisation
 * - Opening a modal with historical occurrence data (carousel UI)
 * - Client-side utilities like pass rate colour coding and date formatting
 *
 * It integrates with backend endpoints:
 * - `php/searchPapers.php` (via `search.js`)
 * - `php/getPaperHistory.php` (for modal details)
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

/**
 * Renders a list of papers as interactive cards in the main results grid.
 *
 * Each card displays key metrics (avg. pass rate, students, level) and supports
 * click-to-view detailed history via modal.
 *
 * @param {Array<Object>} papers - Array of paper objects from searchPapers.php
 * @returns {void}
 */
function displayResults(papers) {
    // Refresh the current date/time in the UI header/footer
    updateCurrentDateTime();

    // Show the results section container
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }

    // Update the count of matching papers
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.textContent = `${papers.length} paper${papers.length !== 1 ? 's' : ''} found`;
    }

    // Handle empty results
    if (!papers || papers.length === 0) {
        const paperGrid = document.getElementById('paperGrid');
        if (paperGrid) {
            paperGrid.innerHTML = '<div class="no-results">No papers found matching your criteria.</div>';
        }
        return;
    }

    // Render paper cards
    const paperGrid = document.getElementById('paperGrid');
    if (!paperGrid) return; // Guard clause: exit if container missing

    paperGrid.innerHTML = ''; // Clear previous results

    papers.forEach(paper => {
        // Determine visual pass rate colour using unified utility
        const passRate = paper.avg_pass_rate !== null ? paper.avg_pass_rate : 0;
        const color = getPassRateColor(passRate, false); // Use hex colors for paper cards

        // Infer paper level from code (e.g., COMPX202 → "200 Level")
        const paperLevel = paper.paper_code
            ? `${paper.paper_code.replace(/\D/g, '').charAt(0)}00 Level`
            : 'N/A';

        // Prepare lecturer display string
        const lecturersDisplay = paper.lecturers || 'N/A';

        // Create and populate paper card element
        const paperCard = document.createElement('div');
        paperCard.className = 'paper-card';

        const avgStudents = paper.avg_num_students !== null ? paper.avg_num_students : 'N/A';

        paperCard.innerHTML = `
            <div class="paper-header">
                <div class="paper-code">${paper.paper_code || 'N/A'}</div>
                <div class="paper-name">${paper.paper_name || 'N/A'}</div>
                <div class="paper-level">${paperLevel}</div>
            </div>
            <div class="paper-body">
                <div class="paper-detail">
                    <span class="detail-label">Most Recent Offering:</span>
                    <span>${paper.year || 'N/A'} - ${paper.trimester || 'N/A'}</span>
                </div>
                <div class="paper-detail">
                    <span class="detail-label">Lecturer(s):</span>
                    <span>${lecturersDisplay}</span>
                </div>
                
                <div class="paper-metrics">
                    <div class="metric">
                        <span class="metric-value">${avgStudents}</span>
                        <span class="metric-label">Avg. Students</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">15</span>
                        <span class="metric-label">Points</span>
                    </div>
                </div>
                
                <div class="pass-rate">
                    <span class="pass-rate-value" style="color: ${color};">${passRate !== null ? passRate.toFixed(2) : 'N/A'}%</span>
                    <span class="metric-label">Avg. Pass Rate</span>
                    <div class="pass-rate-wheel" style="--percentage: ${passRate}; --color: ${color};"></div>
                </div>
            </div>
        `;

        // Enable modal view on card click
        paperCard.addEventListener('click', () => {
            showPaperDetailsInModal(paper);
        });

        paperGrid.appendChild(paperCard);
    });
}

/**
 * Opens a modal and loads full historical data for a selected paper.
 *
 * Fetches detailed occurrence records from `getPaperHistory.php` and passes
 * them to `displayPaperDetailsInModal()` for rendering.
 *
 * @param {Object} paper - Paper object containing at least `paper_id`
 * @returns {void}
 */
function showPaperDetailsInModal(paper) {
    const paperDetailsModal = document.getElementById('paperDetailsModal');
    const paperDetailsContent = document.getElementById('paperDetailsContent');

    if (!paperDetailsModal || !paperDetailsContent) {
        console.error("Modal elements not found in DOM");
        return;
    }

    // Show loading state and lock body scroll
    paperDetailsContent.innerHTML = '<div class="loading">Loading paper details...</div>';
    paperDetailsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Fetch full paper history from backend
    fetch(`php/getPaperHistory.php?paper_id=${paper.paper_id}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Paper History API Response:', data);

            if (Array.isArray(data)) {
                displayPaperDetailsInModal(paper, data);
            } else {
                throw new Error(data?.error || 'Invalid data format from server');
            }
        })
        .catch(error => {
            console.error('Error loading paper history:', error);
            paperDetailsContent.innerHTML = `<div class="error">Error loading paper history: ${error.message}</div>`;
        });
}

/**
 * Renders the detailed paper history modal with a carousel UI.
 *
 * Displays summary statistics and an interactive carousel of all occurrences,
 * including navigation arrows and dot indicators.
 *
 * @param {Object} paper - Original paper object (for metadata)
 * @param {Array<Object>} occurrences - Full list of historical offerings
 * @returns {void}
 */
function displayPaperDetailsInModal(paper, occurrences) {
    if (!occurrences || occurrences.length === 0) {
        const content = document.getElementById('paperDetailsContent');
        if (content) content.innerHTML = '<div class="no-results">No history found for this paper.</div>';
        return;
    }

    // Store for carousel navigation (global state is acceptable here for simplicity)
    window.currentPaperOccurrences = occurrences;
    window.currentPaperIndex = 0;

    const firstOcc = occurrences[0];

    // Compute aggregate stats
    const totalStudents = occurrences.reduce((sum, occ) => sum + (parseInt(occ.num_students) || 0), 0);
    const validPassRates = occurrences.filter(occ => occ.pass_rate != null);
    const avgPassRate = validPassRates.length > 0
        ? (validPassRates.reduce((sum, occ) => sum + parseFloat(occ.pass_rate), 0) / validPassRates.length).toFixed(2)
        : 'N/A';

    // Build "Years Offered" summary string (e.g., "2024 (A, B), 2023 (A)")
    const yearTrimesterMap = {};
    occurrences.forEach(occ => {
        if (!yearTrimesterMap[occ.year]) yearTrimesterMap[occ.year] = [];
        if (!yearTrimesterMap[occ.year].includes(occ.trimester)) {
            yearTrimesterMap[occ.year].push(occ.trimester);
        }
    });
    const yearsOffered = Object.keys(yearTrimesterMap)
        .sort((a, b) => b - a)
        .map(year => `${year} (${yearTrimesterMap[year].sort().join(', ')})`)
        .join(', ');

    // Render modal content
    const paperDetailsContent = document.getElementById('paperDetailsContent');
    if (!paperDetailsContent) return;

    paperDetailsContent.innerHTML = `
        <div class="paper-detail-card">
            <div class="paper-header">
                <h2 class="paper-code">${firstOcc.paper_code || 'N/A'}</h2>
                <h3 class="paper-title">${firstOcc.paper_name || 'N/A'}</h3>
                <p class="occurrence-count-indicator">${occurrences.length} occurrence(s) found</p>
            </div>
            <div class="paper-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <h4>Average Pass Rate</h4>
                        <div class="summary-value" style="color: ${getPassRateColor(avgPassRate, false)}">${avgPassRate}%</div>
                    </div>
                    <div class="summary-item">
                        <h4>Total Students</h4>
                        <div class="summary-value">${totalStudents}</div>
                    </div>
                    <div class="summary-item">
                        <h4>Years Offered</h4>
                        <div class="summary-value">${yearsOffered}</div>
                    </div>
                </div>
            </div>

            <div class="carousel-outer-container">
                <button id="prevPanel" class="carousel-btn carousel-arrow left-arrow" aria-label="Previous Occurrence">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="carousel-inner-container">
                    <div class="carousel-content-area"></div>
                    <div class="carousel-dots">
                        ${occurrences.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                    </div>
                </div>

                <button id="nextPanel" class="carousel-btn carousel-arrow right-arrow" aria-label="Next Occurrence">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            </div>

            <div class="occurrence-explanation">
                <h5>About This Paper</h5>
                <p>Each occurrence represents a specific offering of this paper across different years and trimesters.</p>
                <p>Use the arrows or dots to navigate through the history. Click "View Full Stats & Comparisons" for detailed analytics.</p>
            </div>
        </div>
    `;

    // Set up "View Full Stats & Comparisons" button
    const viewFullStatsButton = paperDetailsModal.querySelector('#viewFullStatsButton');
    if (viewFullStatsButton) {
        viewFullStatsButton.addEventListener('click', function () {
            const url = `comparisons/paper-comparison.html?paper_id=${encodeURIComponent(paper.paper_id)}&paper_code=${encodeURIComponent(paper.paper_code)}`;
            window.location.href = url;
        });
    }

    // Wire up modal close behaviour
    const closeBtn = paperDetailsModal.querySelector('.close-button');
    const closeModal = () => {
        paperDetailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        delete window.currentPaperOccurrences;
        delete window.currentPaperIndex;
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    paperDetailsModal.onclick = (e) => {
        if (e.target === paperDetailsModal) closeModal();
    };

    // Set up interactive carousel
    setupSimpleCarousel(occurrences);
}

/**
 * Initialises navigation controls for the paper history carousel.
 *
 * Supports arrow buttons and dot indicators with event delegation.
 *
 * @param {Array<Object>} occurrences - List of paper occurrences to navigate
 * @returns {void}
 */
function setupSimpleCarousel(occurrences) {
    const prevBtn = document.getElementById('prevPanel');
    const nextBtn = document.getElementById('nextPanel');
    const carouselContentArea = document.querySelector('.carousel-content-area');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!prevBtn || !nextBtn || !carouselContentArea || !dotsContainer) {
        console.error("Carousel DOM elements missing");
        return;
    }

    let currentIndex = window.currentPaperIndex || 0;

    /**
     * Renders a single occurrence panel in the carousel.
     * @param {number} index - Index of occurrence to display
     */
    function renderPanel(index) {
        const occ = occurrences[index];
        if (!occ) return;

        // Generate short occurrence title (e.g., COMPX202-24A)
        let title = 'N/A';
        if (occ.paper_code && occ.year && occ.trimester) {
            const yearShort = occ.year.toString().slice(-2);
            title = `${occ.paper_code}-${yearShort}${occ.trimester}`;
        }

        const panel = document.createElement('div');
        panel.className = 'occurrence-panel';
        panel.dataset.index = index;
        panel.innerHTML = `
            <div class="occurrence-details-card">
                <h4 class="occurrence-title">${title}</h4>
                <div class="detail-item"><span class="detail-label">Year:</span> <span class="detail-value">${occ.year || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Trimester:</span> <span class="detail-value">${occ.trimester || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Students:</span> <span class="detail-value">${occ.num_students || 'N/A'}</span></div>
                <div class="detail-item">
                    <span class="detail-label">Pass Rate:</span>
                    <span class="detail-value pass-rate-value" style="color: ${getPassRateColor(occ.pass_rate || 0, false)}">
                        ${occ.pass_rate != null ? parseFloat(occ.pass_rate).toFixed(2) : 'N/A'}%
                    </span>
                </div>
                <div class="detail-item"><span class="detail-label">Staff:</span> <span class="detail-value">${occ.staff || 'N/A'}</span></div>
            </div>
        `;

        carouselContentArea.innerHTML = '';
        carouselContentArea.appendChild(panel);

        // Update active dot
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Navigation event handlers
    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + occurrences.length) % occurrences.length;
        window.currentPaperIndex = currentIndex;
        renderPanel(currentIndex);
    };

    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % occurrences.length;
        window.currentPaperIndex = currentIndex;
        renderPanel(currentIndex);
    };

    // Dot click delegation
    dotsContainer.onclick = (e) => {
        if (e.target.classList.contains('dot')) {
            const newIndex = parseInt(e.target.dataset.index);
            if (!isNaN(newIndex) && newIndex >= 0 && newIndex < occurrences.length) {
                currentIndex = newIndex;
                window.currentPaperIndex = currentIndex;
                renderPanel(currentIndex);
            }
        }
    };

    // Initial render
    renderPanel(currentIndex);
}

/**
 * Updates the current date and time in the UI (e.g., header or footer).
 * Uses New Zealand locale formatting.
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