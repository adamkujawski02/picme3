const track = document.querySelector(".carousel-track");
const slides = Array.from(track.children);
let currentIndex = 0;

if (slides.length === 0) {
  console.warn("Brak slajdow w karuzeli");
}

let startX = 0;
let startY = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;
let animationID = 0;
let directionLocked = false;
let isHorizontal = false;

const SNAP_DURATION = "0.55s";
const SNAP_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

function getSlideWidth() {
  return slides.length > 0 ? slides[0].offsetWidth + 16 : 0;
}

let slideWidth = getSlideWidth();

function setSliderPosition(animate = false) {
  track.style.transition = animate
    ? `transform ${SNAP_DURATION} ${SNAP_EASING}`
    : "none";
  track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
}

function startDrag(x, y) {
  isDragging = true;
  startX = x;
  startY = y;
  directionLocked = false;
  isHorizontal = false;

  // Zatrzymujemy ewentualną animację snapowania przy ponownym dotyku
  track.style.transition = "none";
  animationID = requestAnimationFrame(animation);
  track.style.cursor = "grabbing";
}

function animation() {
  if (isDragging) {
    setSliderPosition(false);
    requestAnimationFrame(animation);
  }
}

function moveDrag(x, y) {
  if (!isDragging) return;
  const diffX = x - startX;
  const diffY = y - startY;

  if (!directionLocked) {
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    if (absX > 10 || absY > 10) {
      directionLocked = true;
      isHorizontal = absX > absY;
    }
  }

  if (directionLocked && isHorizontal) {
    currentTranslate = prevTranslate + diffX;

    // Opór (rubber banding) na końcach
    const maxScroll = -(slides.length - 1) * slideWidth;
    if (currentTranslate > 0) currentTranslate *= 0.4;
    if (currentTranslate < maxScroll) {
      const overscroll = currentTranslate - maxScroll;
      currentTranslate = maxScroll + overscroll * 0.4;
    }
  }
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  cancelAnimationFrame(animationID);
  track.style.cursor = "grab";

  // Logika snapowania do najbliższego slajdu
  currentIndex = Math.round(Math.abs(currentTranslate / slideWidth));
  currentIndex = Math.max(0, Math.min(currentIndex, slides.length - 1));

  currentTranslate = currentIndex * -slideWidth;
  prevTranslate = currentTranslate;

  setSliderPosition(true);
}

// Obsługa Touch
track.addEventListener(
  "touchstart",
  (e) => {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true },
);

track.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    if (directionLocked && isHorizontal) {
      if (e.cancelable) e.preventDefault(); // Blokuje scroll pionowy strony tylko gdy przewijamy karuzelę
      moveDrag(currentX, currentY);
    } else if (!directionLocked) {
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      if (diffX > 8 || diffY > 8) {
        directionLocked = true;
        isHorizontal = diffX > diffY;
      }
    }
  },
  { passive: false },
);

track.addEventListener("touchend", endDrag);

// Obsługa Myszki
track.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startDrag(e.clientX, e.clientY);
});

window.addEventListener("mousemove", (e) => {
  if (isDragging) moveDrag(e.clientX, e.clientY);
});

window.addEventListener("mouseup", endDrag);

// Resizing
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    slideWidth = getSlideWidth();
    currentTranslate = currentIndex * -slideWidth;
    prevTranslate = currentTranslate;
    setSliderPosition(false);
  }, 150);
});

// Init
setSliderPosition(false);
