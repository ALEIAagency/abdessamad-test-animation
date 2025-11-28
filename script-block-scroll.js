document.addEventListener('DOMContentLoaded', function() {
  initHorizontalScrollAnimation();
});

// Track scroll lock state
let isScrollLocked = false;
let scrollLockTimeout = null;
let lastLockPosition = 0;
let scrollLockDuration = 600;

function lockScroll(scrollY) {
  if (isScrollLocked) return;

  isScrollLocked = true;
  lastLockPosition = scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = -scrollY + 'px';
  document.body.style.width = '100%';
}

function unlockScroll(delay) {
  if (!isScrollLocked) return;

  clearTimeout(scrollLockTimeout);
  scrollLockTimeout = setTimeout(function() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, lastLockPosition);
    isScrollLocked = false;
  }, delay);
}

function initHorizontalScrollAnimation() {
  // Get all horizontal scroll sections (supports multiple on page)
  const horizontalWrappers = document.querySelectorAll('.horizontal-blocks-wrapper');

  horizontalWrappers.forEach(function(horizontalWrapper) {
    const blocksList = horizontalWrapper.querySelector('.horizontal-blocks-list');
    if (!blocksList) return;

    // Store reference for scroll handler
    horizontalWrapper._blocksList = blocksList;
    // Track lock states per wrapper
    horizontalWrapper._startLocked = false;
    horizontalWrapper._endLocked = false;
  });

  // Single scroll listener for performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial update
  handleScroll();
}

function handleScroll() {
  const horizontalWrappers = document.querySelectorAll('.horizontal-blocks-wrapper');
  const currentScrollY = window.scrollY;

  horizontalWrappers.forEach(function(horizontalWrapper) {
    const blocksList = horizontalWrapper._blocksList;
    if (!blocksList) return;

    const rect = horizontalWrapper.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Check if section is in viewport
    const isInViewport = rect.top < viewportHeight && rect.bottom > 0;

    if (isInViewport) {
      // Calculate scroll progress within this section
      const progressData = calculateProgress(horizontalWrapper);
      // Calculate how far to translate
      const translateX = calculateTranslateX(blocksList, progressData.progress);

    
      // Apply transform
      blocksList.style.transform = 'translateX(' + translateX + 'px)';
      // Lock scroll at animation start (when first block fills viewport)
      if (progressData.atStart && !horizontalWrapper._startLocked) {
        horizontalWrapper._startLocked = true;
        lockScroll(currentScrollY);
        unlockScroll(scrollLockDuration); // Unlock after 300ms
      }

      // Lock scroll at animation end (when last block fills viewport)
      if (progressData.atEnd && !horizontalWrapper._endLocked) {
        horizontalWrapper._endLocked = true;
        lockScroll(currentScrollY);
        unlockScroll(scrollLockDuration); // Unlock after 300ms
      }

      // Reset lock flags when user scrolls back into middle of animation
      if (!progressData.atStart && !progressData.atEnd) {
        horizontalWrapper._startLocked = false;
        horizontalWrapper._endLocked = false;
      }
      
    } else {
      // Reset lock flags when section is out of viewport
      horizontalWrapper._startLocked = false;
      horizontalWrapper._endLocked = false;
    }
  });
}


function calculateProgress(section) {
  const rect = section.getBoundingClientRect();
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;

  // How far the section top is from viewport top
  const scrolled = -rect.top;

  // Total scrollable distance within this section
  const scrollableDistance = sectionHeight - viewportHeight;

  // Calculate raw progress (0 to 1)
  let rawProgress = scrolled / scrollableDistance;

  // Clamp progress between 0 and 1
  let progress = Math.max(0, Math.min(1, rawProgress));

  // Detect when animation reaches start or end
  // atStart: section just entered full viewport (progress near 0)
  // atEnd: animation complete, last block visible (progress near 1)
  const threshold = 0.01; // Small threshold for detection
  const atStart = rawProgress >= 0 && rawProgress < threshold;
  const atEnd = rawProgress > (1 - threshold) && rawProgress <= 1;
  console.log("atStart",atStart)
  console.log("atEnd",atEnd)
  return {
    progress: progress,
    atStart: atStart,
    atEnd: atEnd
  };
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