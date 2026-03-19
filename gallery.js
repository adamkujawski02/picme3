const box = document.querySelector(".gallery__box");
const cards = Array.from(box.querySelectorAll(".card"));

if (cards.length === 5) {
  const positions = ["front", "middle", "back"];

  // Początkowy stan – tylko 3 pierwsze karty są widoczne
  cards.forEach((card, i) => {
    card.classList.remove("front", "middle", "back");
    if (i < 3) {
      card.classList.add(positions[i]);
    } else {
      // pozostałe na razie schowane
      card.style.opacity = "0";
      card.style.transform = "translate(-50%, -50%) scale(0.7)";
    }
  });

  setInterval(() => {
    // 1. Zapamiętujemy aktualny stan klas widocznych kart
    const current = [
      cards[0].className, // front
      cards[1].className, // middle
      cards[2].className, // back
    ];

    // 2. Przesuwamy w lewo (pierwsza znika)
    // cards[0] → znika
    // cards[1] → staje się front
    // cards[2] → staje się middle
    // cards[3] → staje się back     (jeśli była ukryta → pokazuje się)
    // cards[4] → czeka w kolejce

    // Najpierw chowamy pierwszą kartę (można też zostawić opacity 0 i scale)
    cards[0].classList.remove("front", "middle", "back");
    cards[0].style.opacity = "0";
    cards[0].style.transform = "translate(-50%, -50%) scale(0.6)";

    // Przesunięcie w lewo
    cards[1].className = "card front";
    cards[2].className = "card middle";

    // Nowa karta wchodzi z prawej (zaczyna od back)
    const nextCard = cards[3];
    nextCard.className = "card back";
    nextCard.style.opacity = "";
    nextCard.style.transform = "";

    // Przesuwamy tablicę – usuwamy pierwszą, dokładamy na koniec tę która wyszła
    cards.push(cards.shift());

    // Mały puls / tick (opcjonalne)
    box.classList.add("tick");
    setTimeout(() => box.classList.remove("tick"), 800);
  }, 1600); // możesz zmienić na 1200–2000 ms
}
