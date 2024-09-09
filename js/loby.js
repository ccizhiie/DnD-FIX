import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, onValue, update, get, remove } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

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

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode');
const code = document.getElementById('code');
code.appendChild(roomCode);

if (roomCode) {
    const roomRef = ref(db, 'rooms/' + roomCode);

    onValue(roomRef, (snapshot) => {
        const roomData = snapshot.val();
        const players = roomData.players || {};
        const hostId = roomData.host;

        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';

        const sortedPlayers = Object.entries(players).sort(([idA], [idB]) => (idA === hostId ? -1 : 1));

        for (const [playerId, playerData] of sortedPlayers) {
            const playerItem = document.createElement('div');
            playerItem.textContent = `${playerData.email || 'No email'} ${playerId === hostId ? '(Room Master)' : `(${playerData.ready ? 'Ready' : 'Not Ready'})`}`;
            playerList.appendChild(playerItem);
        }

        const startGameBtn = document.getElementById('start-game');
        const readyBtn = document.getElementById('ready-btn');
        const unreadyBtn = document.getElementById('unready-btn');
        const leaveBtn = document.getElementById('leave-btn');

        const currentUserId = auth.currentUser.uid;

        if (currentUserId === roomData.host) {
            startGameBtn.style.display = 'block';
        } else {
            startGameBtn.style.display = 'none';
        }

        if (roomData.status === 'started') {
            window.location.href = 'character.html?roomCode=' + roomCode;
        }

        if (currentUserId !== roomData.host) {
            if (players[currentUserId] && players[currentUserId].ready) {
                readyBtn.style.display = 'none';
                unreadyBtn.style.display = 'block';
            } else {
                readyBtn.style.display = 'block';
                unreadyBtn.style.display = 'none';
            }
        } else {
            readyBtn.style.display = 'none';
            unreadyBtn.style.display = 'none';
        }

        readyBtn.addEventListener('click', handleReadyClick);
        unreadyBtn.addEventListener('click', handleUnreadyClick);
        leaveBtn.addEventListener('click', handleLeaveClick);

        if (startGameBtn.style.display === 'block') {
            startGameBtn.addEventListener('click', handleStartGameClick);
        }
    });
}

document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = 'login.html'; // Redirect to login page after logout
    }).catch((error) => {
        // An error happened.
        console.error('Logout Error:', error);
        alert('Logout failed: ' + error.message);
    });
});

function handleReadyClick() {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
    const userId = auth.currentUser.uid;
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + userId);
    update(roomRef, { ready: true }).catch(error => console.error('Failed to update ready status:', error));
}

function handleUnreadyClick() {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
    const userId = auth.currentUser.uid;
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + userId);
    update(roomRef, { ready: false }).catch(error => console.error('Failed to update unready status:', error));
}

function handleLeaveClick() {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
    const userId = auth.currentUser.uid;
    const roomRef = ref(db, 'rooms/' + roomCode + '/players/' + userId);
    remove(roomRef).then(() => {
        console.log('Player removed successfully.');
        checkAndDeleteRoomIfEmpty(roomCode);
    }).catch(error => console.error('Failed to leave room:', error));
}

function checkAndDeleteRoomIfEmpty(roomCode) {
    const roomRef = ref(db, 'rooms/' + roomCode);
    get(roomRef).then(snapshot => {
        const roomData = snapshot.val();
        const players = roomData.players || {};
        if (Object.keys(players).length === 0) {
            remove(roomRef)
                .then(() => {
                    console.log('Room deleted successfully.');
                    window.location.href = 'main.html';
                })
                .catch(error => console.error('Error deleting room:', error));
        }
    }).catch(error => console.error('Error fetching room data:', error));
}

function handleStartGameClick() {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
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
