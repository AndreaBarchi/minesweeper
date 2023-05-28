const mainCanvasId = "main-canvas";
const mainCanvas = document.getElementById(mainCanvasId) as HTMLCanvasElement;
const context = mainCanvas.getContext("2d");

// GAME VARS
const tileHeight = 32;
const tileWidth = 32;
let gameColumns = 9;
let gameRows = 9;
let gameBombs = 10;


interface Tile {
    col: number;
    row: number;
    value: number;
    isBomb: boolean;
    click(): any; 
}

function startGame(columns: number, rows: number, bombs: number) {
    gameColumns = columns;
    gameRows = rows;
    gameBombs = bombs;
    setup();
}

function setup() {
    if (mainCanvas == null) {
        console.log("No element with id: ", mainCanvasId);
    }

    const canvasHeight = gameColumns*tileHeight;
    const canvasWidth = gameRows*tileWidth;

    mainCanvas.height = canvasHeight;
    mainCanvas.width = canvasWidth;
    
    let tiles = new Map<string,Tile>;
    
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
                    console.log("Test click method on tile: " + (col)+"-"+(row));
                }
            }
            tiles.set((col)+"-"+(row), tile);
            fillTile(tcol, trow, tile.isBomb);
        }
    }
    console.log(tiles);

    mainCanvas.addEventListener("click", (event)=> {
        let col = Math.floor(Math.abs(event.offsetX / tileWidth));
        let row = Math.floor(Math.abs(event.offsetY / tileHeight));
        tiles!.get(col+"-"+row)!.click();
    });
}

function fillTile(col:number, row:number, isBomb: boolean): void {
    context!.fillStyle = isBomb ? "red" : "green";
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
//            console.log("Checking tile: ", (topLeftTile[0]+i)+"-"+(topLeftTile[1]+j));
            if(bombArray.includes((topLeftTile[0]+i)+"-"+(topLeftTile[1]+j))){
                bombs += 1;
            }
        }
    }
    return bombs;
}
