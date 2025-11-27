document.addEventListener('DOMContentLoaded', function() {
  initHorizontalScrollAnimation();
});

function initHorizontalScrollAnimation() {
  // Get all horizontal scroll sections (supports multiple on page)
  const horizontalWrappers = document.querySelectorAll('.horizontal-blocks-wrapper');

  horizontalWrappers.forEach(function(horizontalWrapper) {
    const blocksList = horizontalWrapper.querySelector('.horizontal-blocks-list');
    if (!blocksList) return;

    // Store reference for scroll handler
    horizontalWrapper._blocksList = blocksList;
  });

  // Single scroll listener for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial update
  handleScroll();
}

function handleScroll() {
  const horizontalWrappers = document.querySelectorAll('.horizontal-blocks-wrapper');

  horizontalWrappers.forEach(function(horizontalWrapper) {
    const blocksList = horizontalWrapper._blocksList;
    if (!blocksList) return;

    // Calculate scroll progress within this section
    const progress = calculateProgress(horizontalWrapper);
    // Calculate how far to translate
    const translateX = calculateTranslateX(blocksList, progress);

    // Apply transform
    blocksList.style.transform = 'translateX(' + translateX + 'px)';
  });
}


function calculateProgress(section) {
  const rect = section.getBoundingClientRect();
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;

  // Buffer zones (matches your CSS: contain 10% exit -90%)
  const startBuffer = 0.20; // 10% - first block stays visible
  const endBuffer = 0.20;   // 10% - last block stays visible

  // How far the section top is from viewport top
  const scrolled = -rect.top;

  // Total scrollable distance within this section
  const scrollableDistance = sectionHeight - viewportHeight;

  // Calculate raw progress (0 to 1)
  let rawProgress = scrolled / scrollableDistance;

  // Apply buffer zones:
  // - Before startBuffer: progress = 0 (first block visible)
  // - After (1 - endBuffer): progress = 1 (last block visible)
  // - Between: scale from 0 to 1
  let progress;
  if (rawProgress <= startBuffer) {
    progress = 0;
  } else if (rawProgress >= 1 - endBuffer) {
    progress = 1;
  } else {
    // Scale the middle portion (startBuffer to 1-endBuffer) to 0-1
    progress = (rawProgress - startBuffer) / (1 - startBuffer - endBuffer);
  }

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
