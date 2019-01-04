pragma solidity ^0.4.24;

import "./GameChecker.sol";

contract GameBoard is GameChecker {

    uint16 internal constant FIRST_LEVEL = 1;
    uint8 internal constant MAX_MOVE_COUNT = 255;

    uint8 internal constant MOVE_DATA_LENGTH = 4;

    uint16 internal constant FREE_LEVEL_COUNT = 10;
    uint internal constant LEVEL_FEE = 10 ** 15;

    struct Game {
        uint16 level;
        uint8 moveCount;
        mapping(uint8 => uint16) moves;
    }

    mapping(address => Game) private games;
    address[] private players;

    event onGameStarted(address player);
    event onLevelStarted(address player, uint16 level);
    event onLevelRestarted(address player, uint16 level);
    event onLevelSolved(address player, uint16 level);

    //==================================================================================================================

    function startGame() public {
        if (!isGameStarted()) {
            Game memory game = Game({
                level: FIRST_LEVEL,
                moveCount: 0
            });
            games[msg.sender] = game;
            players.push(msg.sender);

            emit onGameStarted(msg.sender);
        }

        emit onLevelStarted(msg.sender, FIRST_LEVEL);
    }

    function getPlayerAddress() public view returns (address) {
        require(isGameStarted());

        return msg.sender;
    }

    function getPlayerLevel() public view returns (uint16) {
        require(isGameStarted());

        return games[msg.sender].level;
    }

    function getPlayerBoard() public view returns (uint8[CELL_COUNT]) {
        require(isGameStarted());

        uint8 moveCount = games[msg.sender].moveCount;
        uint16 level = games[msg.sender].level;
        uint144 board = getPackedLevel(level);
        if (moveCount == 0) {
            return unpackLevel(board);
        }

        uint8[CELL_COUNT] memory inputData = unpackLevel(board);
        uint8[ROW_COUNT][COLUMN_COUNT] memory data = convertArray(inputData);

        for (uint8 i = 0; i < moveCount; i++) {
            uint16 packedMove = games[msg.sender].moves[i];
            int8[MOVE_NUMBERS] memory move = unpackMove(packedMove);
            makeMove(data, move);
        }

        return convertArray(data);
    }

    function restartLevel() public {
        require(isGameStarted());

        restart();

        uint16 level = games[msg.sender].level;
        emit onLevelRestarted(msg.sender, level);
    }

    function revertMove() public {
        require(isGameStarted());
        require(games[msg.sender].moveCount > 0);

        games[msg.sender].moveCount--;
    }

    function getMoveCount() public view returns (uint8) {
        require(isGameStarted());

        return games[msg.sender].moveCount;
    }

    function move(uint8 x, uint8 y, int8 dx, int8 dy) public {
        require(isGameStarted());
        require(games[msg.sender].moveCount < MAX_MOVE_COUNT);

        uint8[CELL_COUNT] memory inputData = getPlayerBoard();
        require(isMovePossible(inputData, x, y, dx, dy));

        uint8[ROW_COUNT][COLUMN_COUNT] memory data = convertArray(inputData);
        makeMove(data, x, y, dx, dy);
        if (isLevelSolved(data)) {
            startNextLevel();
        } else {
            uint16 packedMove = packMove(x, y, dx, dy);
            uint8 moveCount = games[msg.sender].moveCount;
            games[msg.sender].moves[moveCount] = packedMove;
            games[msg.sender].moveCount++;
        }
    }

    function applyMoves(int8[] moves) payable public {
        require(isGameStarted());
        require(moves.length % MOVE_DATA_LENGTH == 0);

        uint16 playerLevel = getPlayerLevel();
        if (playerLevel >= FREE_LEVEL_COUNT) {
            require(msg.value >= LEVEL_FEE);
        }

        uint8[CELL_COUNT] memory inputData = getPlayerBoard();
        uint8[ROW_COUNT][COLUMN_COUNT] memory data = convertArray(inputData);
        for (uint i = 0; i < moves.length / MOVE_DATA_LENGTH; i++) {
            uint8 x = uint8(moves[i * MOVE_DATA_LENGTH]);
            uint8 y = uint8(moves[i * MOVE_DATA_LENGTH + 1]);
            int8 dx = moves[i * MOVE_DATA_LENGTH + 2];
            int8 dy = moves[i * MOVE_DATA_LENGTH + 3];

            require(isMovePossible(data, x, y, dx, dy));
            makeMove(data, x, y, dx, dy);
        }
        if (isLevelSolved(data)) {
            startNextLevel();
        }
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    //==================================================================================================================
    //onlyOwner
    //==================================================================================================================

    function getGameBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function transferToOwner() public onlyOwner {
        owner.transfer(address(this).balance);
    }

    function getPlayerAddresses() public view onlyOwner returns (address[]) {
        return players;
    }

    function getAddressLevel(address player) public view onlyOwner returns (uint16) {
        return games[player].level;
    }

    function nextLevelForPlayer(address player) public onlyOwner {
        uint16 level = games[player].level;
        if (level < levelCount) {
            level++;
            games[player].level = level;
            games[player].moveCount = 0;
        }
    }

    //==================================================================================================================

    function makeMove(uint8[ROW_COUNT][COLUMN_COUNT] data, int8[MOVE_NUMBERS] memory move) private pure {
        uint8 x = uint8(move[0]);
        uint8 y = uint8(move[1]);
        int8 dx = move[2];
        int8 dy = move[3];
        makeMove(data, x, y, dx, dy);
    }

    function makeMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx, int8 dy) private pure {
        if (dx != 0) {
            makeHorizontalMove(data, x, y, dx);
        } else if (dy != 0) {
            makeVerticalMove(data, x, y, dy);
        }
    }

    function makeHorizontalMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx) private pure {
        uint8 x1;
        uint8 x2;
        (x1, x2) = getHorizontalBlockRange(data, x, y);
        if (dx > 0) {
            makeRightMove(data, x1, x2, y, dx);
        } else {
            makeLeftMove(data, x1, x2, y, dx);
        }
    }

    function makeRightMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x1, uint8 x2, uint8 y, int8 dx) private pure {
        for (int i = x2; i >= x1; i--) {
            data[y][uint(i + dx)] = data[y][uint(i)];
            data[y][uint(i)] = 0;
        }
    }

    function makeLeftMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x1, uint8 x2, uint8 y, int8 dx) private pure {
        for (int i = x1; i <= x2; i++) {
            //dx < 0
            data[y][uint(i + dx)] = data[y][uint(i)];
            data[y][uint(i)] = 0;
        }
    }

    function getHorizontalBlockRange(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y) private pure returns (uint8, uint8) {
        uint8 x1;
        uint8 x2;
        uint8 point = data[y][x];
        if (point == MOUSE_LEFT) {
            x1 = x;
            x2 = x + 1;
        } else if (point == MOUSE_RIGHT) {
            x1 = x - 1;
            x2 = x;
        } else if (point == HORIZONTAL_LEFT) {
            x1 = x;
            if (data[y][x + 1] == HORIZONTAL_CENTER) {
                x2 = x + 2;
            } else {
                x2 = x + 1;
            }
        } else if (point == HORIZONTAL_CENTER) {
            x1 = x - 1;
            x2 = x + 1;
        } else if (point == HORIZONTAL_RIGHT) {
            if (data[y][x - 1] == HORIZONTAL_CENTER) {
                x1 = x - 2;
            } else {
                x1 = x - 1;
            }
            x2 = x;
        }
        return (x1, x2);
    }

    function makeVerticalMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dy) private pure {
        uint8 y1;
        uint8 y2;
        (y1, y2) = getVerticalBlockRange(data, x, y);
        if (dy > 0) {
            makeBottomMove(data, x, y1, y2, dy);
        } else {
            makeTopMove(data, x, y1, y2, dy);
        }
    }

    function makeBottomMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y1, uint8 y2, int8 dy) private pure {
        for (int j = y2; j >= y1; j--) {
            data[uint(j + dy)][x] = data[uint(j)][x];
            data[uint(j)][x] = 0;
        }
    }

    function makeTopMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y1, uint8 y2, int8 dy) private pure {
        for (int j = y1; j <= y2; j++) {
            //dy < 0
            data[uint(j + dy)][x] = data[uint(j)][x];
            data[uint(j)][x] = 0;
        }
    }

    function getVerticalBlockRange(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y) private pure returns (uint8, uint8) {
        uint8 y1;
        uint8 y2;
        uint8 point = data[y][x];
        if (point == VERTICAL_TOP) {
            y1 = y;
            if (data[y + 1][x] == VERTICAL_CENTER) {
                y2 = y + 2;
            } else {
                y2 = y + 1;
            }
        } else if (point == VERTICAL_CENTER) {
            y1 = y - 1;
            y2 = y + 1;
        } else if (point == VERTICAL_BOTTOM) {
            if (data[y - 1][x] == VERTICAL_CENTER) {
                y1 = y - 2;
            } else {
                y1 = y - 1;
            }
            y2 = y;
        }
        return (y1, y2);
    }

    function startNextLevel() private {
        uint16 level = games[msg.sender].level;
        emit onLevelSolved(msg.sender, level);

        if (level < levelCount) {
            level++;
            games[msg.sender].level = level;
        }
        restart();

        emit onLevelStarted(msg.sender, level);
    }

    function restart() private {
        games[msg.sender].moveCount = 0;
    }

    function isGameStarted() private view returns (bool) {
        return games[msg.sender].level != 0;
    }

}