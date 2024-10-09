document.addEventListener('DOMContentLoaded', function () {
  const cells = document.querySelectorAll('.grid-map td');
  let draggedElement = null; // To store the dragged element
  let draggedElementId = ''; // To store the ID of the dragged element (for storage purposes)
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Function to save position in localStorage
  function savePositionToLocalStorage(elementId, row, col) {
    const position = { row, col };
    localStorage.setItem(elementId, JSON.stringify(position));
  }

  // Function to restore position from localStorage
  function restorePositionFromLocalStorage() {
    const elements = document.querySelectorAll('.grid-map td img'); // Assuming images are inside table cells

    elements.forEach((element) => {
      const elementId = element.id; // Make sure each image has a unique ID

      // Get the saved position from localStorage
      const savedPosition = localStorage.getItem(elementId);

      if (savedPosition) {
        const { row, col } = JSON.parse(savedPosition);

        // Find the correct cell and move the image there
        const targetCell = document.querySelector(`.grid-map tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);

        if (targetCell && !targetCell.querySelector('img')) {
          targetCell.appendChild(element); // Move the image to the correct cell
        }
      }
    });
  }

  // Restore positions on page load
  restorePositionFromLocalStorage();

  // Function to handle drag and drop (desktop)
  function handleDragDrop() {
    cells.forEach((cell) => {
      const row = cell.parentElement.rowIndex; // Get the row index of the cell
      const col = cell.cellIndex; // Get the column index of the cell

      // When dragging starts
      cell.addEventListener('dragstart', (event) => {
        if (event.target.tagName === 'IMG') {
          draggedElement = event.target; // Store the image being dragged
          draggedElementId = draggedElement.id; // Store the element ID for localStorage
        }
      });

      // When dragging over a cell (required to allow dropping)
      cell.addEventListener('dragover', (event) => {
        event.preventDefault(); // Necessary to allow a drop
      });

      // When the image is dropped on a new cell
      cell.addEventListener('drop', (event) => {
        event.preventDefault(); // Prevent the default behavior

        // Check if the cell is empty and draggedElement is not null
        if (draggedElement && !cell.querySelector('img')) {
          cell.appendChild(draggedElement); // Append the image to the new cell
          savePositionToLocalStorage(draggedElementId, row, col); // Save the new position
          draggedElement = null; // Reset the dragged element
          draggedElementId = ''; // Reset the dragged element ID
        }
      });
    });
  }

  // Function to handle touch-based drag and drop (mobile)
  function handleTouchDragDrop() {
    cells.forEach((cell) => {
      const row = cell.parentElement.rowIndex;
      const col = cell.cellIndex;

      // Handle touch start
      cell.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

        if (target.tagName === 'IMG') {
          draggedElement = target;
          draggedElementId = draggedElement.id;
        }
      });

      // Handle touch move
      cell.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Prevent scrolling

        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetRow = target.parentElement.rowIndex;
        const targetCol = target.cellIndex;

        if (target.tagName === 'TD' && draggedElement && !target.querySelector('img')) {
          target.appendChild(draggedElement);
          savePositionToLocalStorage(draggedElementId, targetRow, targetCol);
        }
      });

      // Handle touch end
      cell.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target.tagName === 'TD' && draggedElement && !target.querySelector('img')) {
          target.appendChild(draggedElement);
          savePositionToLocalStorage(draggedElementId, row, col);
          draggedElement = null;
          draggedElementId = '';
        }
      });
    });
  }

  // Detect if it's a touch device or not, and call the appropriate function
  if (isTouchDevice) {
    handleTouchDragDrop();
  } else {
    handleDragDrop();
  }
});

// document.addEventListener('DOMContentLoaded', function () {
//   const cells = document.querySelectorAll('.grid-map td');
//   let draggedElement = null; // To store the dragged element
//   let draggedElementId = ''; // To store the ID of the dragged element (for storage purposes)

//   // Function to save position in localStorage
//   function savePositionToLocalStorage(elementId, row, col) {
//     const position = { row, col };
//     localStorage.setItem(elementId, JSON.stringify(position));
//   }

//   // Function to restore position from localStorage
//   function restorePositionFromLocalStorage() {
//     const elements = document.querySelectorAll('.grid-map td img'); // Assuming images are inside table cells

//     elements.forEach((element) => {
//       const elementId = element.id; // Make sure each image has a unique ID

//       // Get the saved position from localStorage
//       const savedPosition = localStorage.getItem(elementId);

//       if (savedPosition) {
//         const { row, col } = JSON.parse(savedPosition);

//         // Find the correct cell and move the image there
//         const targetCell = document.querySelector(`.grid-map tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);

//         if (targetCell && !targetCell.querySelector('img')) {
//           targetCell.appendChild(element); // Move the image to the correct cell
//         }
//       }
//     });
//   }

//   // Restore positions on page load
//   restorePositionFromLocalStorage();

//   // Add drag and drop event listeners to each cell
//   cells.forEach((cell) => {
//     const row = cell.parentElement.rowIndex; // Get the row index of the cell
//     const col = cell.cellIndex; // Get the column index of the cell

//     // When dragging starts
//     cell.addEventListener('dragstart', (event) => {
//       if (event.target.tagName === 'IMG') {
//         draggedElement = event.target; // Store the image being dragged
//         console.log(draggedElement);
//         draggedElementId = draggedElement.id; // Store the element ID for localStorage
//       }
//     });

//     // When dragging over a cell (required to allow dropping)
//     cell.addEventListener('dragover', (event) => {
//       event.preventDefault(); // Necessary to allow a drop
//     });

//     // When the image is dropped on a new cell
//     cell.addEventListener('drop', (event) => {
//       event.preventDefault(); // Prevent the default behavior

//       // Check if the cell is empty and draggedElement is not null
//       if (draggedElement && !cell.querySelector('img')) {
//         cell.appendChild(draggedElement); // Append the image to the new cell
//         savePositionToLocalStorage(draggedElementId, row, col); // Save the new position
//         draggedElement = null; // Reset the dragged element
//         draggedElementId = ''; // Reset the dragged element ID
//       }
//     });
//   });
// });

// // document.addEventListener('DOMContentLoaded', function () {
// //   // const gridSize = 45; // Ukuran grid dalam pixel
// //   // const gridContainer = document.querySelector('.grid-container');
// //   // const gridRect = gridContainer.getBoundingClientRect();

// //   // const players = document.querySelectorAll('.circle-player__in-map');

// //   // // Memuat posisi karakter dari localStorage
// //   // players.forEach((player, index) => {
// //   //   const storedPosition = localStorage.getItem(`playerPosition${index}`);
// //   //   if (storedPosition) {
// //   //     const { left, top } = JSON.parse(storedPosition);
// //   //     player.style.left = `${left}px`;
// //   //     player.style.top = `${top}px`;
// //   //   }

// //   //   player.addEventListener('mousedown', startDrag);
// //   // });

// //   // function startDrag(e) {
// //   //   e.preventDefault();
// //   //   const player = e.target;
// //   //   player.classList.add('dragging');

// //   //   const startX = e.clientX;
// //   //   console.log(e);
// //   //   console.log('e.clientX', e.clientX);
// //   //   const startY = e.clientY;
// //   //   console.log('e.clientY', e.clientY);

// //   //   const rect = player.getBoundingClientRect();
// //   //   const offsetX = startX - rect.left;
// //   //   const offsetY = startY - rect.top;

// //   //   function onMouseMove(e) {
// //   //     let newLeft = e.clientX - gridRect.left - offsetX;
// //   //     let newTop = e.clientY - gridRect.top - offsetY;

// //   //     newLeft = Math.max(0, Math.min(newLeft, gridContainer.clientWidth - player.clientWidth));
// //   //     newTop = Math.max(0, Math.min(newTop, gridContainer.clientHeight - player.clientHeight));

// //   //     player.style.left = `${newLeft}px`;
// //   //     player.style.top = `${newTop}px`;
// //   //   }

// //   //   function onMouseUp() {
// //   //     document.removeEventListener('mousemove', onMouseMove);
// //   //     document.removeEventListener('mouseup', onMouseUp);

// //   //     player.classList.remove('dragging');

// //   //     // Snap ke grid
// //   //     const finalLeft = parseInt(player.style.left, 10);
// //   //     const finalTop = parseInt(player.style.top, 10);

// //   //     const snappedLeft = Math.round(finalLeft / gridSize) * gridSize;
// //   //     const snappedTop = Math.round(finalTop / gridSize) * gridSize;

// //   //     player.style.left = `${snappedLeft}px`;
// //   //     player.style.top = `${snappedTop}px`;

// //   //     // Simpan posisi ke localStorage
// //   //     const playerIndex = Array.from(players).indexOf(player);
// //   //     const position = {
// //   //       left: snappedLeft,
// //   //       top: snappedTop,
// //   //     };
// //   //     localStorage.setItem(`playerPosition${playerIndex}`, JSON.stringify(position));
// //   //   }

// //   //   document.addEventListener('mousemove', onMouseMove);
// //   //   document.addEventListener('mouseup', onMouseUp);
// //   // }

// //   // players.forEach((player) => {
// //   //   player.ondragstart = function () {
// //   //     return false;
// //   //   };
// //   // });

// //   //#region DRAG N DROP PLAYER

// //   // Get all the table cells
// //   const cells = document.querySelectorAll('.grid-map td');
// //   let draggedElement = null; // To store the dragged element
// //   let draggedElementId = ''; // To store the ID of the dragged element (for storage purposes)

// //   function savePositionToLocalStorage(elementId, row, col) {
// //     const position = { row, col };
// //     localStorage.setItem(elementId, JSON.stringify(position));
// //   }

// //   // Function to restore position from localStorage
// //   function restorePositionFromLocalStorage() {
// //     const elements = document.querySelectorAll('.grid-map td img'); // Assuming images are inside table cells

// //     elements.forEach((element) => {
// //       const elementId = element.id; // Make sure each image has a unique ID

// //       // Get the saved position from localStorage
// //       const savedPosition = localStorage.getItem(elementId);

// //       if (savedPosition) {
// //         const { row, col } = JSON.parse(savedPosition);

// //         // Find the correct cell and move the image there
// //         const targetCell = document.querySelector(`.grid-map tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);

// //         if (targetCell && !targetCell.querySelector('img')) {
// //           targetCell.appendChild(element); // Move the image to the correct cell
// //         }
// //       }
// //     });
// //   }

// //   restorePositionFromLocalStorage()

// //   // Add drag and drop event listeners to each cell
// //   cells.forEach((cell, index) => {
// //     const row = cell.parentElement.rowIndex; // Get the row index of the cell
// //     const col = cell.cellIndex; // Get the column index of the cell

// //     // When dragging starts
// //     cell.addEventListener('dragstart', (event) => {
// //       if (event.target.tagName === 'IMG') {
// //         draggedElement = event.target; // Store the image being dragged
// //       }
// //     });

// //     // When dragging over a cell (required to allow dropping)
// //     cell.addEventListener('dragover', (event) => {
// //       event.preventDefault(); // Necessary to allow a drop
// //     });

// //     // When the image is dropped on a new cell
// //     cell.addEventListener('drop', (event) => {
// //       event.preventDefault(); // Prevent the default behavior

// //       console.log(`Dropped in cell at row: ${row}, column: ${col}`);

// //       // Check if the cell is empty and draggedElement is not null
// //       if (draggedElement && !cell.querySelector('img')) {
// //         cell.appendChild(draggedElement); // Append the image to the new cell
// //         draggedElement = null; // Reset the dragged element
// //       }
// //     });
// //   });
// //   //#endregion
// // });
