const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

//const socket = io('https://quiet-sea-74691.herokuapp.com/');
//const socket = io('https://quiet-sea-74691.herokuapp.com/', {transports: ['polling']});


const socket = io('https://quiet-sea-74691.herokuapp.com',{transports: ['polling']});



socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('playersList', handlePlayersList);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const searchGameBtn = document.getElementById('searchGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');


newGameBtn.addEventListener('click', newGame);
searchGameBtn.addEventListener('click', searchGame);

function newGame() {
  if(testInput(gameCodeInput.value))
  {
    socket.emit('newGame', gameCodeInput.value);
    init();
  }
  else{
    alert('Numbers and special characters not allowed');
  }
}

function testInput(value){
  if(gameCodeInput.value){
    if(/^[a-zA-Z]*$/.test(gameCodeInput.value)){
      if(gameCodeInput.value.length <= 18 ){
        return true;
      }  
    }
  }
  return false;
}

function joinGame(data) {
  const code = data;
  socket.emit('joinGame', code);
  init();
}

function searchGame() {
  socket.emit('searchGame');
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function handlePlayersList(playersList) {
  reset();
  populateTable(playersList);
}

function populateTable(playersList) {
  deleteOldRows();
  var t = "";
  for (var i = 0; i < playersList.length; i++){
      var tr = "<tr>";
      tr += "<td>"+playersList[i].room+"</td>";
      tr += "<td>"+"<button onClick=joinGame('"+ playersList[i].room +"') id='btnEnterRoom'value='"+playersList[i].room+"'>"+"Enter to room"+"</button>"+"</td>";
      tr += "</tr>";
      t += tr;
  }
  document.getElementById("roomsAvailables").innerHTML += t;
}


function reset() {
  playerNumber = null;
  //gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

function deleteOldRows(){
  document.getElementById("roomsAvailables").innerHTML = "<tr><th>Host Name</th><th>Selection</th></tr>";
}

