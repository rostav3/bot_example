const DIRECTIONS = [[0,1],[0,-1],[1,1],[1,-1],[1,0],[-1,1],[-1,-1],[-1,0]];
let socket = io.connect('http://192.168.0.254:7000');
let user = findGetParameter("name");
let board;
let moves;

socket.on('turn-' + user, function (board) {
    moves = [];

    spread(board);
    socket.emit("finish-turn", {"user":user, "moves":moves});
});

socket.emit("connect-game", user);


function spread(board) {
    let cells = findImportantCells(board);
    for (let j = 0; j < cells.length; j++) {
        let directions = geDirections(board, cells[j].x, cells[j].y);

        let numSoldiersToMove = Math.floor((cells[j].val - 1) / directions.length);
        if (numSoldiersToMove !== 0) {

            for (let i = 0; i < directions.length; i++) {
                let direction = directions[i];
                moves.push({
                    "num": numSoldiersToMove,
                    "prev_x": cells[j].x,
                    "prev_y": cells[j].y,
                    "next_x": cells[j].x + direction[0],
                    "next_y": cells[j].y + direction[1]
                });
            }
        }
    }
}

function findCells(board) {
    let cells = [];

    for (let i=0; i<board.length; i++){
        for (let j=0; j<board.length; j++){
            if ((board[i][j]>0)){
                cells.push({"x":i,"y":j,"val":board[i][j]});
            }
        }
    }
    return cells;
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
            (board[x + direction[0]][y + direction[1]]!==null) && (board[x + direction[0]][y + direction[1]] <= 0)) {
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
            (board[x + direction[0]][y + direction[1]]!==null) && (board[x + direction[0]][y + direction[1]] <= 0)) {
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
