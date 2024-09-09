document.addEventListener("DOMContentLoaded", function () {
  const gridSize = 45; // Ukuran grid dalam pixel
  const gridContainer = document.querySelector(".grid-container");
  const gridRect = gridContainer.getBoundingClientRect();

  const players = document.querySelectorAll(".circle-player__in-map");

  // Memuat posisi karakter dari localStorage
  players.forEach((player, index) => {
    const storedPosition = localStorage.getItem(`playerPosition${index}`);
    if (storedPosition) {
      const { left, top } = JSON.parse(storedPosition);
      player.style.left = `${left}px`;
      player.style.top = `${top}px`;
    }

    player.addEventListener("mousedown", startDrag);
  });

  function startDrag(e) {
    e.preventDefault();
    const player = e.target;
    player.classList.add("dragging");

    const startX = e.clientX;
    const startY = e.clientY;

    const rect = player.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    function onMouseMove(e) {
      let newLeft = e.clientX - gridRect.left - offsetX;
      let newTop = e.clientY - gridRect.top - offsetY;

      newLeft = Math.max(0, Math.min(newLeft, gridContainer.clientWidth - player.clientWidth));
      newTop = Math.max(0, Math.min(newTop, gridContainer.clientHeight - player.clientHeight));

      player.style.left = `${newLeft}px`;
      player.style.top = `${newTop}px`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      player.classList.remove("dragging");

      // Snap ke grid
      const finalLeft = parseInt(player.style.left, 10);
      const finalTop = parseInt(player.style.top, 10);

      const snappedLeft = Math.round(finalLeft / gridSize) * gridSize;
      const snappedTop = Math.round(finalTop / gridSize) * gridSize;

      player.style.left = `${snappedLeft}px`;
      player.style.top = `${snappedTop}px`;

      // Simpan posisi ke localStorage
      const playerIndex = Array.from(players).indexOf(player);
      const position = {
        left: snappedLeft,
        top: snappedTop
      };
      localStorage.setItem(`playerPosition${playerIndex}`, JSON.stringify(position));
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  players.forEach(player => {
    player.ondragstart = function () {
      return false;
    };
  });
});
