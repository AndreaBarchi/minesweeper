const mainCanvasId = "main-canvas";
const mainCanvas = document.getElementById(mainCanvasId) as HTMLCanvasElement;
const canvasHeight = 800;
const canvasWidth = 800;
const tileHeight = 32;
const tileWidth = 32;

interface Tile {
    col: number;
    row: number;
    value: number;
}

if (mainCanvas == null) {
    console.log("No element with id: ", mainCanvasId);
}

mainCanvas.height = canvasHeight;
mainCanvas.width = canvasWidth;

const context = mainCanvas.getContext("2d");
console.log(context);

let canvasArea = (mainCanvas.height * mainCanvas.width);
let tileArea = (tileHeight * tileWidth);
const numberOfTiles = canvasArea / tileArea;
console.log("Number of tiles: ", numberOfTiles);
console.log("Tile area: ", tileArea);

let tiles = new Map<String,Tile>;
// tiles.fill({value: 0});
// console.log(tiles);

for(let col = 0; col < mainCanvas.width; col += tileWidth) {
    for(let row = 0; row < mainCanvas.height; row += tileHeight) {
        let tile: Tile = {
            col: col/tileWidth,
            row: row/tileHeight,
            value: 0
        }
        tiles.set(col+"-"+row, tile);
        fillTile(col, row);
    }
}
console.log(tiles);

mainCanvas.addEventListener("click", (event)=> {
    let col = Math.floor(Math.abs(event.offsetX / tileWidth));
    let row = Math.floor(Math.abs(event.offsetY / tileHeight));
    // console.log("Clicked at: ", event.offsetX + " : " + event.offsetY);
    console.log("Clicked tile at col: " + col + " and row: " + row);
});

function fillTile(col:number, row:number): void {
    context!.fillStyle = "green";
    context!.fillRect(col, row, tileWidth, tileHeight);
}
