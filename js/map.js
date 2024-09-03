document.addEventListener("DOMContentLoaded", function () {
  const gridSize = 50; // Ukuran grid dalam pixel
  const gridContainer = document.querySelector(".grid-container");
  const gridRect = gridContainer.getBoundingClientRect();

  const players = document.querySelectorAll(".circle-player__in-map");

  players.forEach(player => {
    player.addEventListener("mousedown", startDrag);
  });

  function startDrag(e) {
    e.preventDefault();
    const player = e.target;

    player.classList.add("dragging");

    // Posisi awal mouse
    const startX = e.clientX;
    const startY = e.clientY;

    // Posisi awal elemen
    const rect = player.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    function onMouseMove(e) {
      // Hitung posisi baru
      let newLeft = e.clientX - gridRect.left - offsetX;
      let newTop = e.clientY - gridRect.top - offsetY;

      // Batasi agar tidak keluar dari grid
      newLeft = Math.max(0, Math.min(newLeft, gridContainer.clientWidth - player.clientWidth));
      newTop = Math.max(0, Math.min(newTop, gridContainer.clientHeight - player.clientHeight));

      // Sementara, posisikan elemen mengikuti mouse
      player.style.left = `${newLeft}px`;
      player.style.top = `${newTop}px`;
    }

    function onMouseUp(e) {
      // Lepas event listeners
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
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  // Menonaktifkan drag and drop bawaan browser
  players.forEach(player => {
    player.ondragstart = function () {
      return false;
    };
  });
});
