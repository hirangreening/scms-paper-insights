/**
 * Handles data visualisation and interactive table functionality for the
 * paper comparison page in the SCMS Paper Insights application.
 *
 * Features:
 * - Loads historical paper data via `getPaperHistory.php`
 * - Renders a sortable data table with pass rate colour coding
 * - Generates dynamic charts (line or bar) based on user-selected metrics
 * - Supports time-range filtering (3-year, 5-year, all)
 *
 * This page fulfils the project aim: "Creating a separate page for statistical
 * comparisons and data visualisation" (see Final Project Report, Section 2).
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

document.addEventListener('DOMContentLoaded', function () {
    // --- INITIAL SETUP ---

    // Extract paper ID and code from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('paper_id');
    const paperCode = urlParams.get('paper_code');

    // Update page title dynamically
    const paperTitle = document.getElementById('paperTitle');
    if (paperCode) {
        paperTitle.textContent = `Paper Comparison: ${paperCode}`;
    }

    // Chart instance and raw data storage
    let chart = null;
    let rawData = null;

    // Fetch historical paper data from backend
    fetch(`../php/getPaperHistory.php?paper_id=${paperId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Paper History API Response:', data);

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format from server');
            }

            // Sort chronologically (newest first)
            data.sort((a, b) => b.year - a.year);
            rawData = data;

            // Render initial table and chart
            populateDataTable(data);
            generateChart(data);
        })
        .catch(error => {
            console.error('Error loading paper data:', error);
            alert('Error loading paper data: ' + error.message);
        });

    // --- CHART CONTROLS ---

    // Regenerate chart when user changes settings
    document.getElementById('generateChart')?.addEventListener('click', function () {
        const comparisonType = document.getElementById('comparisonType').value;
        const timeRange = document.getElementById('timeRange').value;

        // Filter data by selected time window
        let filteredData = rawData;
        const currentYear = new Date().getFullYear();

        if (timeRange === '5') {
            filteredData = rawData.filter(occ => occ.year >= currentYear - 4);
        } else if (timeRange === '3') {
            filteredData = rawData.filter(occ => occ.year >= currentYear - 2);
        }

        generateChart(filteredData);
    });

    // --- SORTABLE TABLE LOGIC ---

    // Track current sort state
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

    /**
     * Populates the data table with occurrence records and enables column sorting.
     *
     * @param {Array<Object>} data - Array of paper occurrence objects
     * @param {boolean} resetSortState - Whether to reset header click listeners (true on first load)
     */
    function populateDataTable(data, resetSortState = true) {
        const dataTable = document.getElementById('dataTable');
        const tableBody = dataTable.querySelector('tbody');
        const tableHead = dataTable.querySelector('thead tr');

        // Clear and rebuild table body
        tableBody.innerHTML = '';
        data.forEach(occurrence => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${occurrence.year}</td>
                <td>${occurrence.trimester}</td>
                <td>${occurrence.num_students}</td>
                <td style="color: ${getPassRateColor(occurrence.pass_rate || 0, true)}">${occurrence.pass_rate || 'N/A'}%</td>
                <td>${occurrence.staff || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });

        // Initialise sortable headers only once
        if (resetSortState && !dataTable.dataset.headersInitialized) {
            const headerMapping = [
                { property: 'year', text: 'Year' },
                { property: 'trimester', text: 'Trimester' },
                { property: 'num_students', text: 'Students' },
                { property: 'pass_rate', text: 'Pass Rate' },
                { property: 'staff', text: 'Staff' }
            ];

            tableHead.innerHTML = '';
            headerMapping.forEach(col => {
                const th = document.createElement('th');
                th.scope = 'col';
                th.style.cursor = 'pointer';
                th.setAttribute('data-sort-property', col.property);

                const wrapper = document.createElement('span');
                wrapper.className = 'sortable-header';
                wrapper.textContent = col.text;

                const icon = document.createElement('span');
                icon.className = 'sort-indicator';
                icon.setAttribute('aria-hidden', 'true');
                wrapper.appendChild(icon);
                th.appendChild(wrapper);

                th.addEventListener('click', () => handleTableHeaderClick(col.property));
                tableHead.appendChild(th);
            });

            dataTable.dataset.headersInitialized = 'true';
            currentSortColumn = null;
            currentSortDirection = 'asc';
        }

        // Update sort indicators to reflect current state
        updateSortIndicators(tableHead);
    }

    /**
     * Handles user clicks on table headers to trigger sorting.
     *
     * @param {string} sortProperty - Data property to sort by (e.g., 'year', 'pass_rate')
     */
    function handleTableHeaderClick(sortProperty) {
        if (currentSortColumn === sortProperty) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = sortProperty;
            currentSortDirection = 'asc';
        }

        if (rawData && Array.isArray(rawData)) {
            rawData.sort((a, b) => {
                let aValue = a[sortProperty] ?? '';
                let bValue = b[sortProperty] ?? '';

                // Numeric conversion for relevant fields
                if (['year', 'num_students', 'pass_rate'].includes(sortProperty)) {
                    const numA = parseFloat(aValue);
                    const numB = parseFloat(bValue);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        aValue = numA;
                        bValue = numB;
                    }
                }

                // Pass rate cleanup (in case stored as string with '%')
                if (sortProperty === 'pass_rate') {
                    if (typeof aValue === 'string') aValue = parseFloat(aValue.replace('%', '')) || 0;
                    if (typeof bValue === 'string') bValue = parseFloat(bValue.replace('%', '')) || 0;
                }

                // Comparison logic
                let comparison = 0;
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
                } else {
                    comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                }

                return currentSortDirection === 'desc' ? -comparison : comparison;
            });

            populateDataTable(rawData, false); // Re-render without re-initialising headers
        }
    }

    /**
     * Updates visual sort indicators (▲/▼) on table headers.
     *
     * @param {HTMLTableRowElement} tableHead - The table header row element
     */
    function updateSortIndicators(tableHead) {
        tableHead.querySelectorAll('th').forEach(th => {
            const sortProperty = th.getAttribute('data-sort-property');
            const iconSpan = th.querySelector('.sort-indicator');

            if (iconSpan) {
                iconSpan.textContent = '';
                iconSpan.className = 'sort-indicator';

                if (sortProperty === currentSortColumn) {
                    iconSpan.textContent = currentSortDirection === 'asc' ? ' ▲' : ' ▼';
                    iconSpan.classList.add(currentSortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                    th.classList.add('sorted');
                } else {
                    th.classList.remove('sorted');
                }
            }
        });
    }

    // --- CHART GENERATION ---

    /**
     * Generates a Chart.js visualisation based on selected metric and data.
     *
     * Supports:
     * - Line chart: pass rate or student count over time
     * - Bar chart: average pass rate by trimester
     *
     * @param {Array<Object>} data - Filtered paper occurrence data
     */
    function generateChart(data) {
        const comparisonType = document.getElementById('comparisonType').value;
        const ctx = document.getElementById('comparisonChart')?.getContext('2d');

        if (!ctx) return;

        // Clean up existing chart
        if (chart) chart.destroy();

        // Handle trimester-based bar chart separately
        if (comparisonType === 'trimester') {
            const trimesterData = {};

            data.forEach(occ => {
                if (occ.pass_rate != null && !isNaN(parseFloat(occ.pass_rate))) {
                    const term = occ.trimester || 'Unknown';
                    if (!trimesterData[term]) {
                        trimesterData[term] = { total: 0, count: 0 };
                    }
                    trimesterData[term].total += parseFloat(occ.pass_rate);
                    trimesterData[term].count++;
                }
            });

            const labels = Object.keys(trimesterData);
            const values = labels.map(term => {
                const avg = trimesterData[term].count > 0
                    ? trimesterData[term].total / trimesterData[term].count
                    : 0;
                return Math.round(avg * 100) / 100; // Round to 2 decimals
            });

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Average Pass Rate (%)',
                        data: values,
                        backgroundColor: '#4CAF50',
                        borderColor: '#45a049',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { callback: v => v + '%' },
                            title: { display: true, text: 'Average Pass Rate' }
                        },
                        x: { title: { display: true, text: 'Trimester' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#333' } },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
                            }
                        }
                    }
                }
            });
            return;
        }

        // Default: line chart over time
        const labels = data.map(occ => `${occ.year} - ${occ.trimester}`);
        const values = data.map(occ =>
            comparisonType === 'passRate' ? (occ.pass_rate || 0) : (occ.num_students || 0)
        );

        const isPassRate = comparisonType === 'passRate';
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: isPassRate ? 'Pass Rate (%)' : 'Student Count',
                    data: values,
                    fill: false,
                    borderColor: isPassRate ? '#4CAF50' : '#E4010B',
                    tension: 0.1,
                    pointBackgroundColor: isPassRate ? '#4CAF50' : '#E4010B',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: v => isPassRate ? v + '%' : v
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => isPassRate
                                ? `${ctx.parsed.y}%`
                                : `${ctx.parsed.y} students`
                        }
                    }
                }
            }
        });
    }
});