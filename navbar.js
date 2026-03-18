let lastScroll = 0;
const nav = document.querySelector(".nav");

window.addEventListener("scroll", () => {
  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScroll && currentScroll > 50) {
    // scroll w dół → chowamy navbar
    nav.classList.add("nav--hidden");
  } else {
    // scroll w górę → pokazujemy navbar
    nav.classList.remove("nav--hidden");
  }

  lastScroll = currentScroll <= 0 ? 0 : currentScroll; // zabezpieczenie przed ujemnym scroll
});
