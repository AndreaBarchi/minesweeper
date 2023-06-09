"use strict";
const mainCanvas = document.getElementById("main-canvas");
const context = mainCanvas.getContext("2d");
const startButton = document.getElementById("start-button");
const flagsLabel = document.getElementById("flags-label");
const difficultySelect = document.getElementById("difficulty-select");
const customDifficultyDiv = document.getElementById("custom-difficulty-div");
const colsInput = document.getElementById("cols");
const rowsInput = document.getElementById("rows");
const bombsInput = document.getElementById("bombs");
const resultDiv = document.getElementById("result-div");
const resultP = document.getElementById("result-p");
// GAME VARS
const maxNumberOfCols = 40;
const maxNumberOfRows = 40;
const tileHeight = 32;
const tileWidth = 32;
let gameColumns = 9;
let gameRows = 9;
let gameBombs = 0;
let flags = 10;
let tiles = new Map;
let tilesCount = 0;
var State;
(function (State) {
    State[State["inProgress"] = 0] = "inProgress";
    State[State["gameOver"] = 1] = "gameOver";
})(State || (State = {}));
let gameState = State.gameOver;
if (customDifficultyDiv != undefined) {
    difficultySelect.addEventListener("change", () => {
        if (difficultySelect.value == "custom") {
            customDifficultyDiv.style.display = "flex";
        }
        else {
            customDifficultyDiv.style.display = "none";
        }
    });
}
function getGameParams() {
    let params = new Map;
    switch (difficultySelect.value) {
        case "easy":
            params.set("columns", 9);
            params.set("rows", 9);
            params.set("bombs", 10);
            break;
        case "intermediate":
            params.set("columns", 16);
            params.set("rows", 16);
            params.set("bombs", 40);
            break;
        case "hard":
            params.set("columns", 30);
            params.set("rows", 16);
            params.set("bombs", 99);
            break;
        case "custom":
            params.set("columns", 30);
            params.set("rows", 16);
            params.set("bombs", 99);
            break;
    }
    return params;
}
function startGame() {
    resultDiv.style.display = "none";
    difficultySelect.disabled = true;
    let gameParams = getGameParams();
    if (difficultySelect.value != "custom") {
        gameColumns = gameParams.get("columns");
        gameRows = gameParams.get("rows");
        gameBombs = gameParams.get("bombs");
    }
    else {
        if (colsInput.valueAsNumber < 0 || rowsInput.valueAsNumber < 0 || bombsInput.valueAsNumber < 0) {
            alert("You have set invalid parameters");
            return;
        }
        else if (colsInput.value == "" || rowsInput.value == "" || bombsInput.value == "") {
            alert("Parameters cannot be empty");
            return;
        }
        else if (colsInput.valueAsNumber > maxNumberOfCols || rowsInput.valueAsNumber > maxNumberOfRows || bombsInput.valueAsNumber > (colsInput.valueAsNumber * rowsInput.valueAsNumber) - 1) {
            alert("You have set invalid parameters");
            return;
        }
        else {
            gameColumns = colsInput.valueAsNumber;
            gameRows = rowsInput.valueAsNumber;
            gameBombs = bombsInput.valueAsNumber;
        }
    }
    startButton.innerText = "Restart";
    startButton.onclick = () => {
        if (confirm("Are you sure you want to restart the game?")) {
            difficultySelect.disabled = false;
            flagsLabel.innerText = "";
            mainCanvas.height = 9 * tileHeight;
            mainCanvas.width = 9 * tileWidth;
            mainCanvas.removeEventListener("click", tileClick);
            mainCanvas.removeEventListener("contextmenu", tileRightClick);
            context.fillStyle = "red";
            context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
            startButton.innerText = "Start new game!";
            startButton.onclick = () => {
                startGame();
            };
        }
    };
    flags = gameBombs;
    setup();
}
function setup() {
    gameState = State.inProgress;
    const canvasWidth = gameColumns * tileWidth;
    const canvasHeight = gameRows * tileHeight;
    mainCanvas.height = canvasHeight;
    mainCanvas.width = canvasWidth;
    flagsLabel.innerText = flags.toString();
    let bombArray = randomizeBombs();
    //    let canvasArea = (mainCanvas.height * mainCanvas.width);
    //    let tileArea = (tileHeight * tileWidth);
    //    const numberOfTiles = canvasArea / tileArea;
    for (let tcol = 0; tcol < mainCanvas.width; tcol += tileWidth) {
        for (let trow = 0; trow < mainCanvas.height; trow += tileHeight) {
            let col = tcol / tileWidth;
            let row = trow / tileHeight;
            let tile = {
                col: col,
                row: row,
                isBomb: bombArray.includes(col + "-" + row) ? true : false,
                value: calculateValues(col, row, bombArray),
                clicked: false,
                flagged: false,
                neighbors: calculateNeighbors(col, row),
                click: () => {
                    if (gameState != State.gameOver && !tile.flagged && !tile.clicked) {
                        if (tile.isBomb) {
                            context.fillStyle = "red";
                            context.fillRect(tcol, trow, tileWidth, tileHeight);
                            context.strokeRect(tcol, trow, tileWidth, tileHeight);
                            gameOver("lost");
                        }
                        else {
                            tile.clicked = true;
                            tilesCount -= 1;
                            if (tilesCount <= 0) {
                                gameOver("won");
                            }
                            fillTile(tcol, trow, "gray");
                            context.fillStyle = "black";
                            context.font = "25pt Arial";
                            context.textAlign = "center";
                            if (tile.value == 0) {
                                clickNeighbors(tile);
                            }
                            else {
                                context.fillText(tile.value.toString(), tcol + tileWidth / 2, trow + tileHeight - 4);
                            }
                        }
                    }
                },
                rightClick: () => {
                    if (gameState != State.gameOver && !tile.clicked) {
                        if (tile.flagged) {
                            tile.flagged = false;
                            flags += 1;
                            flagsLabel.innerText = flags.toString();
                            fillTile(tcol, trow, "green");
                        }
                        else {
                            tile.flagged = true;
                            flags -= 1;
                            flagsLabel.innerText = flags.toString();
                            context.fillStyle = "orange";
                            context.font = "25pt Arial";
                            context.textAlign = "center";
                            context.fillText("?", tcol + tileWidth / 2, trow + tileHeight - 4);
                        }
                    }
                }
            };
            tiles.set((col) + "-" + (row), tile);
            fillTile(tcol, trow, "green");
            tilesCount += 1;
        }
    }
    console.log(tiles);
    mainCanvas.addEventListener("click", tileClick);
    mainCanvas.addEventListener("contextmenu", tileRightClick);
}
function tileClick(event) {
    let col = Math.floor(Math.abs(event.offsetX / tileWidth));
    let row = Math.floor(Math.abs(event.offsetY / tileHeight));
    tiles.get(col + "-" + row).click();
}
function tileRightClick(event) {
    event.preventDefault();
    let col = Math.floor(Math.abs(event.offsetX / tileWidth));
    let row = Math.floor(Math.abs(event.offsetY / tileHeight));
    tiles.get(col + "-" + row).rightClick();
}
function fillTile(col, row, color) {
    context.fillStyle = color;
    context.fillRect(col, row, tileWidth, tileHeight);
    context.strokeRect(col, row, tileWidth, tileHeight);
}
function randomizeBombs() {
    let bombArray = [];
    while (bombArray.length < gameBombs) {
        let tile = Math.round(Math.random() * (gameColumns - 1)) + "-" + Math.round(Math.random() * (gameRows - 1));
        if (!bombArray.includes(tile)) {
            bombArray.push(tile);
        }
    }
    return bombArray;
}
function calculateValues(col, row, bombArray) {
    let bombs = 0;
    let topLeftTile = [col - 1, row - 1];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (bombArray.includes((topLeftTile[0] + i) + "-" + (topLeftTile[1] + j))) {
                bombs += 1;
            }
        }
    }
    return bombs;
}
function calculateNeighbors(col, row) {
    let neighbors = [];
    if (col > 0) {
        neighbors.push((col - 1) + "-" + (row));
        if (row > 0)
            neighbors.push((col - 1) + "-" + (row - 1));
    }
    if (row < (gameRows - 1)) {
        neighbors.push((col) + "-" + (row + 1));
        if (col > 0)
            neighbors.push((col - 1) + "-" + (row + 1));
    }
    if (col < (gameColumns - 1)) {
        neighbors.push((col + 1) + "-" + (row));
        if (row < (gameRows - 1))
            neighbors.push((col + 1) + "-" + (row + 1));
    }
    if (row > 0) {
        neighbors.push((col) + "-" + (row - 1));
        if (col < (gameColumns - 1))
            neighbors.push((col + 1) + "-" + (row - 1));
    }
    return neighbors;
}
function clickNeighbors(tile) {
    for (let neighborTile of tile.neighbors) {
        let nTile = tiles.get(neighborTile);
        if (nTile.value == 0 && !(nTile === null || nTile === void 0 ? void 0 : nTile.clicked)) {
            nTile.click();
        }
    }
}
function gameOver(result) {
    console.log(result == "won" ? "You won!" : "You lost");
    gameState = State.gameOver;
    resultDiv.style.display = "flex";
    resultP.style.width = mainCanvas.width.toString() + "px";
    resultP.style.backgroundColor = result == "won" ? "green" : "red";
    resultP.innerText = result == "won" ? "You Won!" : "You Lost";
    startButton.innerText = "Start new Game";
    startButton.onclick = () => {
        mainCanvas.removeEventListener("click", tileClick);
        mainCanvas.removeEventListener("contextmenu", tileRightClick);
        startGame();
    };
}
