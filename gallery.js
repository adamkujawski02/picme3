const box = document.querySelector(".gallery__box");
const cards = Array.from(box.querySelectorAll(".card"));

if (cards.length === 3) {
  const positions = ["front", "middle", "back"];

  // Początkowy stan
  cards.forEach((card, i) => {
    card.className = `card ${positions[i]}`;
  });

  setInterval(() => {
    // Krok 1: wszystkie karty dostają klasę disappearing (znikają)
    cards.forEach((card) => card.classList.add("disappearing"));

    setTimeout(() => {
      // Krok 2: po ~500 ms zmieniamy pozycje (już niewidoczne)
      const prevClasses = cards.map((card) =>
        card.className.replace(" disappearing", ""),
      );

      // Rotacja:  front → back, middle → front, back → middle
      cards[0].className = `card disappearing ${prevClasses[2].split(" ")[1]}`; // stara back → nowa front (ale wciąż znika)
      cards[1].className = `card disappearing ${prevClasses[0].split(" ")[1]}`; // stara front → nowa middle
      cards[2].className = `card disappearing ${prevClasses[1].split(" ")[1]}`; // stara middle → nowa back

      // Krok 3: po bardzo krótkim czasie usuwamy disappearing i dodajemy appearing
      setTimeout(() => {
        cards.forEach((card) => {
          card.classList.remove("disappearing");
          card.classList.add("appearing");
        });

        // Krok 4: po 50–150 ms kończymy animację wejścia
        setTimeout(() => {
          cards.forEach((card) => {
            card.classList.remove("appearing");
            // klasa pozycji już jest ustawiona wcześniej – appearing tylko pomaga w starcie animacji
          });
        }, 80); // krótki delay na „wejście”
      }, 50); // minimalny delay przed pojawieniem
    }, 500); // czas znikania – dostosuj do transition w CSS (tu 0.5s)

    // Opcjonalny puls na kontenerze
    box.classList.add("tick");
    setTimeout(() => box.classList.remove("tick"), 900);
  }, 1800); // cały cykl co ~1.8 s – możesz zmniejszyć do 1400–1600 ms
}
