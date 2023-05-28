const mainCanvasId = "main-canvas";
const startButtonId = "start-button";
const mainCanvas = document.getElementById(mainCanvasId) as HTMLCanvasElement;
const context = mainCanvas.getContext("2d");
const startButton = document.getElementById(startButtonId) as HTMLButtonElement;

// GAME VARS
const tileHeight = 32;
const tileWidth = 32;
let gameColumns = 9;
let gameRows = 9;
let gameBombs = 10;
let isFirstClick = true;
let tiles = new Map<string,Tile>;

enum State {
    inProgress,
    gameOver
}

let gameState = State.gameOver;

interface Tile {
    col: number;
    row: number;
    value: number;
    isBomb: boolean;
    click(): any; 
}

function startGame(columns: number, rows: number, bombs: number) {
    console.log("Starting new game");
    isFirstClick = true;
    startButton.innerText = "Restart";
    startButton.onclick = () => {
        mainCanvas.removeEventListener("click", tileClick);
        startGame(9, 9, 10);
    }
    gameColumns = columns;
    gameRows = rows;
    gameBombs = bombs;
    setup();
}

function setup() {
    if (mainCanvas == null) {
        console.log("No element with id: ", mainCanvasId);
    }
    gameState = State.inProgress;

    const canvasHeight = gameColumns*tileHeight;
    const canvasWidth = gameRows*tileWidth;

    mainCanvas.height = canvasHeight;
    mainCanvas.width = canvasWidth;
    
    console.log("init tiles");
    console.log(tiles);
    
    // RANDOMIZING BOMBS
    let bombArray: Array<string> = randomizeBombs(); 
    console.log("Bomb array", bombArray);

    let canvasArea = (mainCanvas.height * mainCanvas.width);
    let tileArea = (tileHeight * tileWidth);
    const numberOfTiles = canvasArea / tileArea;
    console.log("Number of tiles: ", numberOfTiles);
    console.log("Tile area: ", tileArea);

    for(let tcol = 0; tcol < mainCanvas.width; tcol += tileWidth) {
        for(let trow = 0; trow < mainCanvas.height; trow += tileHeight) {
            let col = tcol/tileWidth;
            let row = trow/tileHeight;
            let tile: Tile = {
                col: col, 
                row: row,
                isBomb: bombArray.includes(col+"-"+row) ? true : false,
                value: calculateValues(col, row, bombArray), 
                click: () => {
                    if(gameState != State.gameOver){
                        console.log("Clicked on: " + col + "-" + row);
                        if(tile.isBomb){
                            console.log("Tile: " + col+"-"+row + " is bomb");
                            console.log(tile);
                            context!.fillStyle = "red";
                            context!.fillRect(tcol, trow, tileWidth, tileHeight);
                            context!.strokeRect(tcol, trow, tileWidth, tileHeight);
                            gameOver();
                        } else {
                            if(isFirstClick){
                                console.log("First Click");
                                isFirstClick = false;
                            } else {
                                context!.fillStyle = "black";
                                context!.font = "25pt Arial";
                                context!.textAlign = "center";
                                console.log(context!.measureText(tile.value.toString()));
                                console.log("Filling at: "+(tcol+tileWidth/2)+"-"+(trow));
                                context!.fillText(tile.value.toString(), tcol+tileWidth/2, trow+tileHeight-4);
                            }
                        }
                    }
                }
            }
            tiles.set((col)+"-"+(row), tile);
            fillTile(tcol, trow);
        }
    }
    console.log(tiles);
    mainCanvas.addEventListener("click", tileClick);
}

function tileClick(event: MouseEvent) {
    let col = Math.floor(Math.abs(event.offsetX / tileWidth));
    let row = Math.floor(Math.abs(event.offsetY / tileHeight));
    console.log("Real coords: "+ event.offsetX+"-"+event.offsetY);
    tiles!.get(col+"-"+row)!.click();
}

function fillTile(col:number, row:number): void {
    context!.fillStyle = "green";
    context!.fillRect(col, row, tileWidth, tileHeight);
    context!.strokeRect(col, row, tileWidth, tileHeight);
}

function randomizeBombs(): Array<string>{
    let bombArray: Array<string> = [];
    while(bombArray.length < gameBombs){
        let tile = Math.round(Math.random()*(gameColumns-1)) + "-" + Math.round(Math.random()*(gameRows-1));
        if(!bombArray.includes(tile)){
            bombArray.push(tile);
        }
    }
    return bombArray;
}

function calculateValues(col: number, row: number, bombArray: Array<string>): number {
    let bombs = 0;
    let topLeftTile: Array<number> = [col-1, row-1];
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            if(bombArray.includes((topLeftTile[0]+i)+"-"+(topLeftTile[1]+j))){
                bombs += 1;
            }
        }
    }
    return bombs;
}

function gameOver() {
    gameState = State.gameOver;
    startButton.innerText = "Start new Game";
    startButton.onclick = () => {
        mainCanvas.removeEventListener("click", tileClick);
        startGame(9, 9, 10);
    }
}
