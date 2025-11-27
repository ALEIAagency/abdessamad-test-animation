/**
 * Horizontal Scroll Animation
 * Works on Chrome, Safari, and iOS
 *
 * HOW IT WORKS:
 * 1. Each .horizontal-blocks-wrapper has a tall height (500vh) to create scroll space
 * 2. The inner content is sticky so it stays visible while scrolling
 * 3. As you scroll through the wrapper, the blocks slide horizontally
 */

document.addEventListener('DOMContentLoaded', function() {
  initHorizontalScrollAnimation();
});

function initHorizontalScrollAnimation() {
  // Get all horizontal scroll sections (supports multiple on page)
  const sections = document.querySelectorAll('.horizontal-blocks-wrapper');

  sections.forEach(function(section) {
    const blocksList = section.querySelector('.horizontal-blocks-list');
    if (!blocksList) return;

    // Store reference for scroll handler
    section._blocksList = blocksList;
  });

  // Single scroll listener for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial update
  handleScroll();
}

function handleScroll() {
  const sections = document.querySelectorAll('.horizontal-blocks-wrapper');

  sections.forEach(function(section) {
    const blocksList = section._blocksList;
    if (!blocksList) return;

    // Calculate scroll progress within this section
    const progress = calculateProgress(section);

    // Calculate how far to translate
    const translateX = calculateTranslateX(blocksList, progress);

    // Apply transform
    blocksList.style.transform = 'translateX(' + translateX + 'px)';
  });
}

/**
 * Calculate scroll progress (0 to 1) within a section
 * 0 = section just entered viewport from bottom
 * 1 = section about to leave viewport from top
 */
function calculateProgress(section) {
  const rect = section.getBoundingClientRect();
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;

  // How far the section top is from viewport top
  // Positive = section top is below viewport top
  // Negative = section top is above viewport top
  const scrolled = -rect.top;

  // Total scrollable distance within this section
  // (section height minus one viewport height, since content is sticky)
  const scrollableDistance = sectionHeight - viewportHeight;

  // Calculate progress (clamped between 0 and 1)
  let progress = scrolled / scrollableDistance;
  progress = Math.max(0, Math.min(1, progress));

  return progress;
}

/**
 * Calculate horizontal translation based on progress
 * At progress=0: translateX = 0 (start position)
 * At progress=1: translateX = -(listWidth - viewportWidth + padding)
 */
function calculateTranslateX(blocksList, progress) {
  const listWidth = blocksList.scrollWidth;
  const viewportWidth = window.innerWidth;
  const padding = 32 + 24; // 2rem padding + 1.5rem gap (adjust as needed)

  // Maximum translation (negative value to slide left)
  const maxTranslate = listWidth - viewportWidth + padding;

  // Calculate current translation
  const translateX = -maxTranslate * progress;

  return translateX;
}
