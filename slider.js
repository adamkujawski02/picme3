const track = document.querySelector(".slider-track");
if (!track) {
  console.warn("Slider track not found");
} else {
  const slides = Array.from(track.children);

  if (slides.length === 0) {
    console.warn("Brak slajdów w sliderze");
  } else {
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

    const SNAP_DURATION = "0.55s";
    const SNAP_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";

    function updateMetrics() {
      if (slides.length === 0) return;

      const firstSlide = slides[0];
      const rect = firstSlide.getBoundingClientRect();
      slideWidth = rect.width;

      const computedStyle = window.getComputedStyle(track);
      gap = parseFloat(computedStyle.gap) || 24; // px fallback

      const container = track.parentElement;
      const containerWidth = container.offsetWidth || window.innerWidth;
      offsetToCenter = (containerWidth - slideWidth) / 2;

      console.log("Metrics:", {
        slideWidth,
        gap,
        containerWidth,
        offsetToCenter,
      });
    }

    function getPositionByIndex(idx) {
      return offsetToCenter - idx * (slideWidth + gap);
    }

    function setPosition(animate = false) {
      track.style.transition = animate
        ? `transform ${SNAP_DURATION} ${SNAP_EASING}`
        : "none";

      track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;

      // Poprawione wyznaczanie aktywnego slajdu
      const position = -currentTranslate + offsetToCenter;
      const targetIndex = Math.round(position / (slideWidth + gap));
      const clamped = Math.max(0, Math.min(targetIndex, slides.length - 1));

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === clamped);
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

      cancelAnimationFrame(animationID);
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
        if (absX > 6 || absY > 6) {
          // obniżony próg
          directionLocked = true;
          isHorizontal = absX > absY;
        }
      }

      if (directionLocked && isHorizontal) {
        currentTranslate = prevTranslate + diffX;

        // Ograniczenia
        const minTranslate = getPositionByIndex(slides.length - 1);
        currentTranslate = Math.max(
          minTranslate,
          Math.min(offsetToCenter, currentTranslate),
        );
      }
    }

    function endDrag() {
      if (!isDragging) return;

      isDragging = false;
      cancelAnimationFrame(animationID);
      track.style.cursor = "grab";

      // ❌ brak snapowania
      prevTranslate = currentTranslate;

      setPosition(false); // brak animacji
    }
    // TOUCH EVENTS
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
          const dx = Math.abs(x - startX);
          const dy = Math.abs(y - startY);
          if (dx > 6 || dy > 6) {
            directionLocked = true;
            isHorizontal = dx > dy;
          }
        }
      },
      { passive: false },
    );

    track.addEventListener("touchend", endDrag);
    track.addEventListener("touchcancel", endDrag);

    // MOUSE EVENTS
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

    // RESIZE
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateMetrics();
        currentTranslate = getPositionByIndex(currentIndex);
        prevTranslate = currentTranslate;
        setPosition(false);
      }, 150);
    });

    // INIT
    updateMetrics();
    currentTranslate = getPositionByIndex(0);
    prevTranslate = currentTranslate;
    setPosition(false);
  }
}
