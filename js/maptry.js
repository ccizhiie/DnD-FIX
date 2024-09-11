import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, update, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAijQZfI-UPIuxxYLIY7MQmHzKsdUHAkpc",
    authDomain: "dungeonanddragons-12ee8.firebaseapp.com",
    databaseURL: "https://dungeonanddragons-12ee8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dungeonanddragons-12ee8",
    storageBucket: "dungeonanddragons-12ee8.appspot.com",
    messagingSenderId: "1010963587070",
    appId: "1:1010963587070:web:bcb761dc0cba09a52d6aaf",
    measurementId: "G-9HVXKJ3NSZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function getRoomCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomCode');
}

document.addEventListener("DOMContentLoaded", function () {
    const gridSize = 45; // Size of each grid in pixels
    const gridContainer = document.querySelector(".grid-container");
    const gridRect = gridContainer.getBoundingClientRect();
  
    const players = document.querySelectorAll(".circle-player__in-map");
  
    // Mapping of classes to image paths
    const classToImagePath = {
      'fighter': 'assets/player-1.png',
      'rogue': 'assets/player-4.png',
      'wizard': 'assets/player-2.png',
      'cleric': 'assets/player-3.png'
    };
  
    // Load player data from Firebase and set image
    function loadPlayerData(roomCode, userId) {
      const playerRef = ref(db, `rooms/${roomCode}/players/${userId}`);
      onValue(playerRef, (snapshot) => {
        const playerData = snapshot.val();
        if (playerData && playerData.characters) {
          const playerClass = playerData.characters.class; // Retrieve the player's class
          setPlayerImage(playerClass); // Set the image based on the class
        }
      });
    }
  
    // Function to set player image based on class
    function setPlayerImage(playerClass) {
      const imagePath = classToImagePath[playerClass];
      players.forEach((player) => {
        if (imagePath) {
          player.src = imagePath;
        } else {
          console.error('Player image path is missing.');
        }
      });
    }
  
    // Get roomCode and userId to load player data
    const roomCode = getRoomCodeFromURL(); // Function to get room code from URL
    const userId = auth.currentUser.uid; // Example of getting user ID
    loadPlayerData(roomCode, userId);
  
    // Load positions from localStorage
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
  
        // Snap to grid
        const finalLeft = parseInt(player.style.left, 10);
        const finalTop = parseInt(player.style.top, 10);
  
        const snappedLeft = Math.round(finalLeft / gridSize) * gridSize;
        const snappedTop = Math.round(finalTop / gridSize) * gridSize;
  
        player.style.left = `${snappedLeft}px`;
        player.style.top = `${snappedTop}px`;
  
        // Save position to localStorage
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