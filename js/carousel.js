/**
 * Implements horizontal carousel navigation for the paper grid on the main page.
 *
 * Uses smooth scrolling to navigate between paper cards in a responsive,
 * horizontally scrollable container. Navigation arrows are automatically
 * hidden when content fits within the viewport (no overflow).
 *
 * This replaces the initial carousel concept (see Final Project Report, Figure 2)
 * with a more usable, responsive grid-based approach (Figure 4).
 *
 * @author Hiran Greening
 * @version 1.0
 * @since 2025-10-24
 */

/**
 * Initialises horizontal carousel controls once the DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    // Get references to key carousel elements
    const wrapper = document.querySelector('.paper-grid-wrapper'); // Scrollable container
    const prevBtn = document.querySelector('.carousel-prev');      // Left navigation button
    const nextBtn = document.querySelector('.carousel-next');      // Right navigation button

    // Exit early if required elements are missing
    if (!wrapper || !prevBtn || !nextBtn) return;

    // Define scroll step: matches card width + gap from CSS
    // These values must stay in sync with .paper-card styles in CSS
    const cardWidth = 360; // Matches min-width: 360px in CSS
    const gap = 24;        // Matches gap: 1.5rem (~24px) in CSS

    /**
     * Scrolls the paper grid one card to the right with smooth animation.
     */
    nextBtn.addEventListener('click', () => {
        wrapper.scrollBy({
            left: cardWidth + gap,
            behavior: 'smooth'
        });
    });

    /**
     * Scrolls the paper grid one card to the left with smooth animation.
     */
    prevBtn.addEventListener('click', () => {
        wrapper.scrollBy({
            left: -(cardWidth + gap),
            behavior: 'smooth'
        });
    });

    /**
     * Toggles visibility of navigation arrows based on content overflow.
     * Arrows are hidden if all cards fit within the visible area.
     */
    function updateArrowVisibility() {
        if (wrapper.scrollWidth <= wrapper.clientWidth) {
            // No overflow: hide both arrows
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            // Overflow exists: show arrows
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }

    // Initialise arrow visibility on load
    updateArrowVisibility();

    // Re-check on window resize (e.g., device rotation, browser resize)
    window.addEventListener('resize', updateArrowVisibility);
});