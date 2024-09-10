import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, update, get, remove } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Initialize Firebase
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

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode');
const code = document.getElementById('code');

if (roomCode) {
    const roomRef = ref(db, 'rooms/' + roomCode);

    onValue(roomRef, (snapshot) => {
        code.textContent = roomCode;
        const roomData = snapshot.val();
        const players = roomData.players || {};
        const hostId = roomData.host;
        const currentUserId = auth.currentUser.uid;

        // Redirect if the current player is not in the room
        if (!players[currentUserId]) {
            window.location.href = 'main.html';
            return;
        }

        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';

        const sortedPlayers = Object.entries(players).sort(([idA], [idB]) => (idA === hostId ? -1 : 1));
        sortedPlayers.forEach(([playerId, playerData]) => {
            const playerItem = document.createElement('div');
            let playerContent = `${playerData.email || 'No email'}`;

            // Check if the player is the host
            if (playerId === hostId) {
                playerContent += '<img src="assets/hostt.svg" alt="Room Master" class="room-master-img">';
            } else {
                // Display "Ready" or "Not Ready" status
                playerContent += ` (${playerData.ready ? 'Ready' : 'Not Ready'})`;

                // Show the kick button only for the host
                if (currentUserId === hostId) {
                    playerContent += `<img src="assets/2x.svg" id="kick-${playerId}" class="kick-btn">`;
                }
            }

            playerItem.innerHTML = playerContent;
            playerList.appendChild(playerItem);

            // Attach event listener for the kick button
            if (currentUserId === hostId && playerId !== hostId) {
                const kickButton = document.getElementById(`kick-${playerId}`);
                kickButton.addEventListener('click', () => handleKick(playerId));
            }
        });

        const startGameBtn = document.getElementById('start-btn');
        const readyBtn = document.getElementById('ready-btn');
        const unreadyBtn = document.getElementById('unready-btn');
        const leaveBtn = document.getElementById('leave-btn');

        // Button visibility logic
        if (currentUserId === hostId) {
            startGameBtn.style.display = 'block';
            readyBtn.style.display = 'none';
            unreadyBtn.style.display = 'none';
        } else {
            startGameBtn.style.display = 'none';
            if (players[currentUserId].ready) {
                readyBtn.style.display = 'none';
                unreadyBtn.style.display = 'block';
            } else {
                readyBtn.style.display = 'block';
                unreadyBtn.style.display = 'none';
            }
        }

        if (roomData.status === 'started') {
            window.location.href = 'character.html?roomCode=' + roomCode;
        }

        // Attach event listeners
        readyBtn.addEventListener('click', handleReadyClick);
        unreadyBtn.addEventListener('click', handleUnreadyClick);
        leaveBtn.addEventListener('click', handleLeaveClick);
        startGameBtn.addEventListener('click', handleStartGameClick);
    });
}

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout Error:', error);
        alert('Logout failed: ' + error.message);
    });
});

function handleReadyClick() {
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + auth.currentUser.uid);
    update(roomRef, { ready: true }).catch(error => console.error('Failed to update ready status:', error));
}

function handleUnreadyClick() {
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + auth.currentUser.uid);
    update(roomRef, { ready: false }).catch(error => console.error('Failed to update unready status:', error));
}

function handleLeaveClick() {
    const userId = auth.currentUser.uid;
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + userId);
    remove(roomRef).then(() => {
        console.log('Player removed successfully.');
        checkAndDeleteRoomIfEmpty(roomCode);
    }).catch(error => console.error('Failed to leave room:', error));
}

function handleKick(playerId) {
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + playerId);
    remove(roomRef).then(() => {
        console.log('Player kicked successfully.');
        checkAndDeleteRoomIfEmpty(roomCode);
    }).catch(error => console.error('Failed to kick player:', error));
}

function checkAndDeleteRoomIfEmpty(roomCode) {
    const roomRef = ref(db, 'rooms/' + roomCode);
    get(roomRef).then(snapshot => {
        const roomData = snapshot.val();
        const players = roomData.players || {};
        if (Object.keys(players).length === 0) {
            remove(roomRef).then(() => {
                console.log('Room deleted successfully.');
                window.location.href = 'main.html';
            }).catch(error => console.error('Error deleting room:', error));
        }
    }).catch(error => console.error('Error fetching room data:', error));
}

function handleStartGameClick() {
    const roomRef = ref(db, 'rooms/' + roomCode);
    get(roomRef).then(snapshot => {
        const roomData = snapshot.val();
        const players = roomData.players || {};
        const readyPlayers = Object.values(players).filter(player => player.ready).length;
        if (readyPlayers < 3) {
            alert('Not enough players ready to start the game.');
        } else {
            update(roomRef, { status: 'started' }).catch(error => console.error('Failed to update game status:', error));
        }
    }).catch(error => console.error('Error fetching room data:', error));
}
