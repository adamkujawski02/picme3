const track = document.querySelector(".slider-track");
if (!track) {
  console.warn("Slider track not found");
  // można tu rzucić early return jeśli chcesz
} else {
  const slides = Array.from(track.children);

  if (slides.length === 0) {
    console.warn("Brak slajdów w sliderze");
  }

  let currentIndex = 0;
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;
  let animationID = 0;
  let directionLocked = false;
  let isHorizontal = false;

  let slideWidth = 0;
  let gap = 0;
  let offsetToCenter = 0;

  const SNAP_DURATION = "0.6s";
  const SNAP_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

  function updateMetrics() {
    if (slides.length === 0) return;

    const firstSlideRect = slides[0].getBoundingClientRect();
    slideWidth = firstSlideRect.width;
    gap = parseFloat(window.getComputedStyle(track).gap) || 24;

    const containerWidth = track.parentElement.offsetWidth;
    offsetToCenter = (containerWidth - slideWidth) / 2;
  }

  function getPositionByIndex(index) {
    return offsetToCenter - index * (slideWidth + gap);
  }

  function setPosition(animate = false) {
    track.style.transition = animate
      ? `transform ${SNAP_DURATION} ${SNAP_EASING}`
      : "none";

    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

    // podświetlenie centralnego slajdu
    const centerOffset = Math.abs(currentTranslate - offsetToCenter);
    const targetIndex = Math.round(centerOffset / (slideWidth + gap));
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === targetIndex);
    });
  }

  function startDrag(x, y) {
    isDragging = true;
    startX = x;
    startY = y;
    directionLocked = false;
    isHorizontal = false;

    prevTranslate = currentTranslate;
    track.style.transition = "none";
    track.style.cursor = "grabbing";

    animationID = requestAnimationFrame(dragAnimation);
  }

  function dragAnimation() {
    if (isDragging) {
      setPosition(false);
      animationID = requestAnimationFrame(dragAnimation);
    }
  }

  function moveDrag(x, y) {
    if (!isDragging) return;

    const diffX = x - startX;
    const diffY = y - startY;

    if (!directionLocked) {
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);
      if (absX > 8 || absY > 8) {
        directionLocked = true;
        isHorizontal = absX > absY;
      }
    }

    if (directionLocked && isHorizontal) {
      currentTranslate = prevTranslate + diffX;

      // twarde ograniczenia
      const minTranslate = getPositionByIndex(slides.length - 1);
      if (currentTranslate > offsetToCenter) currentTranslate = offsetToCenter;
      if (currentTranslate < minTranslate) currentTranslate = minTranslate;
    }
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);
    track.style.cursor = "grab";

    // snap do najbliższego
    const moved = currentTranslate - prevTranslate;
    const movedInSlides = moved / (slideWidth + gap);

    if (Math.abs(movedInSlides) > 0.18) {
      // próg czułości
      currentIndex -= Math.round(movedInSlides);
    }

    currentIndex = Math.max(0, Math.min(currentIndex, slides.length - 1));
    currentTranslate = getPositionByIndex(currentIndex);
    prevTranslate = currentTranslate;

    setPosition(true);
  }

  // ─── TOUCH ───────────────────────────────────────
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

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      if (directionLocked && isHorizontal) {
        if (e.cancelable) e.preventDefault();
        moveDrag(x, y);
      } else if (!directionLocked) {
        const diffX = Math.abs(x - startX);
        const diffY = Math.abs(y - startY);
        if (diffX > 8 || diffY > 8) {
          directionLocked = true;
          isHorizontal = diffX > diffY;
        }
      }
    },
    { passive: false },
  );

  track.addEventListener("touchend", endDrag);
  track.addEventListener("touchcancel", endDrag);

  // ─── MOUSE ───────────────────────────────────────
  track.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });

  const onMouseMove = (e) => {
    if (isDragging) moveDrag(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    endDrag();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // ─── RESIZE ─────────────────────────────────────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateMetrics();
      currentTranslate = getPositionByIndex(currentIndex);
      prevTranslate = currentTranslate;
      setPosition(false);
    }, 120);
  });

  // ─── INIT ───────────────────────────────────────
  updateMetrics();
  currentTranslate = getPositionByIndex(0);
  prevTranslate = currentTranslate;
  setPosition(false);
}
