const box = document.querySelector(".gallery__box");
const cards = Array.from(box.querySelectorAll(".card"));

if (cards.length === 5) {
  const positions = ["front", "middle", "back"];

  cards.forEach((card, i) => {
    card.classList.remove("front", "middle", "back");
    if (i < 3) {
      card.classList.add(positions[i]);
    } else {
      card.style.opacity = "0";
      card.style.transform = "translate(-50%, -50%) scale(0.7)";
    }
  });

  setInterval(() => {
    // 1. Schowaj obecną front i OD RAZU zresetuj jej style
    const outgoing = cards[0];
    outgoing.classList.remove("front", "middle", "back");
    outgoing.style.opacity = "0";
    outgoing.style.transform = "translate(-50%, -50%) scale(0.6)"; // ← animacja znikania

    // Natychmiastowy reset – zanim karta wróci jako "back"
    // (można też zrobić to w requestAnimationFrame, ale setTimeout 0 też wystarcza)
    setTimeout(() => {
      outgoing.style.transform = "translate(-50%, -50%) scale(1)"; // lub "" jeśli masz scale w CSS
      outgoing.style.opacity = "0"; // nadal ukryta
    }, 0); // albo 16–50 ms jeśli reset za szybko psuje animację znikania

    // 2. Przesunięcie istniejących kart
    cards[1].classList.remove("front", "middle", "back");
    cards[1].classList.add("front");

    cards[2].classList.remove("front", "middle", "back");
    cards[2].classList.add("middle");

    // 3. Nowa karta wchodzi jako back
    const incoming = cards[3];
    incoming.classList.remove("front", "middle", "back");
    incoming.classList.add("back");
    incoming.style.opacity = "";
    incoming.style.transform = ""; // ← tu musi być czysty stan!

    // 4. Rotacja tablicy
    cards.push(cards.shift());

    // 5. tick (opcjonalne)
    box.classList.add("tick");
    setTimeout(() => box.classList.remove("tick"), 800);
  }, 1600);
}
