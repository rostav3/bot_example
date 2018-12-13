const DIRECTIONS = [[0,1],[0,-1],[1,1],[1,-1],[1,0],[-1,1],[-1,-1],[-1,0]];
let socket = io.connect('http://localhost:7000');
let user = findGetParameter("name");
let board;
let moves;

socket.emit("connect-game", user);
socket.on('turn-' + user, function (data) {
    moves = [];
    let cells = findImportantCells(data.board);

    addSoliders(data, cells);
    spread(data.board, cells);
    socket.emit("finish-turn", {"user":user, "moves":moves});
});

function addSoliders(data, cells){

    let soldiers = data.soliders;
    board = data.board;
    let numSoldiers = Math.floor(soldiers/cells.length);
    for (let i=0; i<cells.length; i++){

        moves.push({"type":"set","num":numSoldiers,"x":cells[i].x,"y":cells[i].y});
        cells[i].val++;
        board[cells[i].x][cells[i].y]+= numSoldiers;
        soldiers -= numSoldiers;
    }
    if (soldiers > 0){
        moves.push({"type":"set","num":soldiers,"x":cells[0].x,"y":cells[0].y});
    }
}
function spread(board, cells) {
    for (let j = 0; j < cells.length; j++) {
        let directions = geDirections(board, cells[j].x, cells[j].y);

        let numSoldiersToMove = Math.floor((cells[j].val - 1) / directions.length);
        for (let i = 0; i < directions.length; i++) {
            let direction = directions[i];
            moves.push({
                "type": "move",
                "num": numSoldiersToMove,
                "past_x": cells[j].x,
                "past_y": cells[j].y,
                "x": cells[j].x + direction[0],
                "y": cells[j].y + direction[1]
            });
        }
    }
}

function findImportantCells(board) {
    let cells = [];

    for (let i=0; i<board.length; i++){
        for (let j=0; j<board.length; j++){
            if ((board[i][j]>0) && (canSpread(board, i, j))){
                cells.push({"x":i,"y":j,"val":board[i][j]});
            }
        }
    }
    return cells;
}

function geDirections(board, x, y) {
    let directions = [];
    for (let i=0; i<DIRECTIONS.length; i++) {
        let direction = DIRECTIONS[i];
        if ((x + direction[0] < board.length) && (x + direction[0] >= 0) &&
            (y + direction[1] < board.length) && (y + direction[1] >= 0) &&
            (!isNaN(board[x + direction[0]][y + direction[1]])) && (board[x + direction[0]][y + direction[1]] <= 0)) {
            directions.push(direction);
        }
    }
    return directions;
}

function canSpread(board, x, y) {
    for (let i=0; i<DIRECTIONS.length; i++) {
        let direction = DIRECTIONS[i];
        if ((x + direction[0] < board.length) && (x + direction[0] >= 0) &&
            (y + direction[1] < board.length) && (y + direction[1] >= 0) &&
            (!isNaN(board[x + direction[0]][y + direction[1]])) && (board[x + direction[0]][y + direction[1]] <= 0)) {
            return true;
        }
    }
    return false;
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}
