import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, set, update, get, query, orderByChild, equalTo, limitToFirst } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

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

// Log user information upon authentication state change
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user); // Log entire user object
        console.log("User ID:", user.uid); // Log user's UID
        console.log("User Email:", user.email); // Log user's Email
    } else {
        console.log("No user is signed in."); // Log when no user is signed     in
    }
});

// Logout logic
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('User logged out.');
        window.location.href = 'login.html'; // Redirect to login page after logout
    }).catch((error) => {
        console.error('Logout Error:', error);
        alert('Logout failed: ' + error.message);
    });
});

document.getElementById('quickplay').addEventListener('click', function() {
    joinRandomRoom();
});

document.getElementById('enter-code').addEventListener('click', function() {
    const code = document.getElementById('room-code').value;
    joinRoom(code);
});

document.getElementById('host-game').addEventListener('click', function() {
    console.log("Host Game Button Clicked"); // Debug

    const userId = auth.currentUser ? auth.currentUser.uid : null; // Ensure auth.currentUser is not null
    const userEmail = auth.currentUser ? auth.currentUser.email : null; // Ensure auth.currentUser is not null

    console.log("User ID (currentUser):", userId); // Log user's UID
    console.log("User Email (currentUser):", userEmail); // Log user's email

    if (!userEmail) {
        console.error('User email not found.');
        return;
    }

    const roomCode = generateRoomCode();
    console.log("Generated Room Code:", roomCode); // Log generated room code

    set(ref(db, 'rooms/' + roomCode), {
        host: userId,
        players: { 
            [userId]: { 
                email: userEmail
            } 
        },
        status: 'waiting'
    }).then(() => {
        console.log("Room created successfully, redirecting to lobby..."); // Log success
        window.location.href = 'loby.html?roomCode=' + roomCode;
    }).catch(error => {
        console.error('Error creating room:', error);
    });
});


function generateRoomCode() {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function joinRoom(roomCode) {
    const userId = auth.currentUser.uid;
    const userEmail = auth.currentUser.email; // Get the user's email
    const roomRef = ref(db, 'rooms/' + roomCode);

    get(roomRef).then(snapshot => {
        if (snapshot.exists()) {
            const roomData = snapshot.val();
            const players = roomData.players || {};  // Use existing players or start with an empty object

            if (Object.keys(players).length < 4) { // Check if the room has fewer than 4 players
                // Add the new player to the players object
                players[userId] = {
                    email: userEmail,
                    ready: false
                };

                // Update the players list in the database
                update(roomRef, { players: players }).then(() => {
                    window.location.href = 'loby.html?roomCode=' + roomCode;
                }).catch(error => {
                    console.error('Failed to join room:', error);
                    alert('Failed to join room.');
                });
            } else {
                // Room is full
                alert('The room is full. Please choose another room.');
            }
        } else {
            console.error('Room not found:', roomCode);
            alert('Room not found.');
        }
    }).catch(error => {
        console.error('Error fetching room:', error);
    });
}

function joinRandomRoom() {
    const roomsRef = query(ref(db, 'rooms'), orderByChild('status'), equalTo('waiting'));
    
    get(roomsRef).then(snapshot => {
        const availableRooms = [];
        snapshot.forEach(roomSnapshot => {
            const roomData = roomSnapshot.val();
            const players = roomData.players || {};

            // Check if the room has less than 4 players
            if (Object.keys(players).length < 4) {
                availableRooms.push(roomSnapshot.key);
            }
        });

        if (availableRooms.length > 0) {
            // Join the first available room
            const roomCode = availableRooms[0];
            joinRoom(roomCode);
        } else {
            alert('No available rooms with slots.');
        }
    }).catch(error => {
        console.error('Error fetching rooms:', error);
        alert('Error finding available rooms.');
    });
}