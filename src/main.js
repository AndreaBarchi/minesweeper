"use strict";
const mainCanvasId = "main-canvas";
const mainCanvas = document.getElementById(mainCanvasId);
const canvasHeight = 800;
const canvasWidth = 800;
const tileHeight = 32;
const tileWidth = 32;
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
let tiles = new Map;
for (let col = 0; col < mainCanvas.width; col += tileWidth) {
    for (let row = 0; row < mainCanvas.height; row += tileHeight) {
        let tile = {
            col: col / tileWidth,
            row: row / tileHeight,
            value: 0,
            click: () => {
                console.log("Test click method on tile: " + (col / tileWidth) + "-" + (row / tileHeight));
            }
        };
        tiles.set((col / tileWidth) + "-" + (row / tileHeight), tile);
        fillTile(col, row);
        ;
    }
}
console.log(tiles);
mainCanvas.addEventListener("click", (event) => {
    let col = Math.floor(Math.abs(event.offsetX / tileWidth));
    let row = Math.floor(Math.abs(event.offsetY / tileHeight));
    tiles.get(col + "-" + row).click();
});
function fillTile(col, row) {
    context.fillStyle = "green";
    context.fillRect(col, row, tileWidth, tileHeight);
    context.strokeRect(col, row, tileWidth, tileHeight);
}
