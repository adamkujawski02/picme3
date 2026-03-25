document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  if (!track) {
    console.warn("Brak .carousel-track");
    return;
  }

  const slides = Array.from(track.children);
  if (slides.length === 0) {
    console.warn("Brak slajdów");
    return;
  }

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  let slideWidth = 0; // używane tylko do granic
  let containerWidth = 0;
  let minTranslate = 0;
  let maxTranslate = 0;

  function updateSizes() {
    if (slides.length === 0) return;

    slideWidth = slides[0].offsetWidth + 16; // + gap, dostosuj jeśli masz inny gap
    containerWidth = track.parentElement.offsetWidth || window.innerWidth;

    // Bardzo luźne granice – możesz przewijać aż ostatni slajd zniknie prawie całkowicie
    maxTranslate = 0; // nie pozwalamy na zbyt duży pull w prawo
    minTranslate = containerWidth - slides.length * slideWidth - 100; // -100 = możesz "wyciągnąć" trochę dalej

    // Jeśli chcesz jeszcze luźniej → zmień -100 na -300 lub nawet usuń ograniczenie minTranslate
  }

  function setPosition() {
    track.style.transition = "none";
    track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
  }

  function startDrag(x) {
    isDragging = true;
    startX = x;
    prevTranslate = currentTranslate;
    track.style.cursor = "grabbing";
    track.style.transition = "none";
    cancelAnimationFrame(animationID);
    animationID = requestAnimationFrame(tick);
  }

  function tick() {
    if (isDragging) {
      setPosition();
      animationID = requestAnimationFrame(tick);
    }
  }

  function moveDrag(x) {
    if (!isDragging) return;
    const diff = x - startX;
    currentTranslate = prevTranslate + diff;

    // luźne ograniczenie – możesz je całkowicie usunąć jeśli chcesz infinite feel
    currentTranslate = Math.max(
      minTranslate,
      Math.min(maxTranslate, currentTranslate),
    );
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);
    track.style.cursor = "grab";
    // NIC nie robimy – zostaje tam gdzie puściłeś
  }

  // ─── TOUCH ────────────────────────────────
  track.addEventListener(
    "touchstart",
    (e) => {
      startDrag(e.touches[0].clientX);
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault(); // blokuje scroll strony
      moveDrag(e.touches[0].clientX);
    },
    { passive: false },
  );

  track.addEventListener("touchend", endDrag);
  track.addEventListener("touchcancel", endDrag);

  // ─── MOUSE ────────────────────────────────
  track.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(e.clientX);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) moveDrag(e.clientX);
  });

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("mouseleave", endDrag);

  // ─── RESIZE ───────────────────────────────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateSizes();
      // nie centrować, zostaje gdzie jest
      setPosition();
    }, 120);
  });

  // START
  updateSizes();
  setPosition();
});
