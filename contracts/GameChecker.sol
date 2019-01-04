pragma solidity ^0.4.24;
import "./GameLevels.sol";

contract GameChecker is GameLevels {

    uint8 internal constant LEVEL_EXIT_X = 5;
    uint8 internal constant LEVEL_EXIT_Y = 2;

    function isMovePossible(uint8[CELL_COUNT] inputData, uint8 x, uint8 y, int8 dx, int8 dy) public pure returns (bool) {
        uint8[ROW_COUNT][COLUMN_COUNT] memory data = convertArray(inputData);
        return isMovePossible(data, x, y, dx, dy);
    }

    function isMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] inputData, uint8 x, uint8 y, int8 dx, int8 dy) internal pure returns (bool) {
        validate(inputData, x, y, dx, dy);
        if (dx != 0) {
            return isHorizontalMovePossible(inputData, x, y, dx);
        } else { //dy != 0
            return isVerticalMovePossible(inputData, x, y, dy);
        }
    }

    function isLevelSolved(uint8[ROW_COUNT][COLUMN_COUNT] data) internal pure returns (bool) {
        uint8 point = data[LEVEL_EXIT_Y][LEVEL_EXIT_X];
        return point == MOUSE_RIGHT;
    }

    function isLevelSolved(uint8[CELL_COUNT] inputData) public pure returns (bool) {
        uint8[ROW_COUNT][COLUMN_COUNT] memory data = convertArray(inputData);
        return isLevelSolved(data);
    }

    function convertArray(uint8[CELL_COUNT] inputData) internal pure returns (uint8[ROW_COUNT][COLUMN_COUNT]) {
        uint8[ROW_COUNT][COLUMN_COUNT] memory data;
        for (uint i = 0; i < CELL_COUNT; i++) {
            uint x = i % COLUMN_COUNT;
            uint y = i / COLUMN_COUNT;
            data[y][x] = inputData[i];
        }
        return data;
    }

    function convertArray(uint8[ROW_COUNT][COLUMN_COUNT] inputData) internal pure returns (uint8[CELL_COUNT]) {
        uint8[CELL_COUNT] memory data;
        uint i = 0;
        for (uint y = 0; y < ROW_COUNT; y++) {
            for (uint x = 0; x < COLUMN_COUNT; x++) {
                data[i] = inputData[y][x];
                i++;
            }
        }
        return data;
    }

    function validate(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx, int8 dy) private pure {
        require(x < COLUMN_COUNT);
        require(y < ROW_COUNT);
        require((dx != 0 && dy == 0) || (dx == 0 && dy != 0));

        uint8 point = data[y][x];
        require(point != EMPTY);
        require(point <= MAX_CELL_VALUE);
    }

    function isHorizontalMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx) private pure returns (bool) {
        uint8 point = data[y][x];
        require(point != VERTICAL_TOP);
        require(point != VERTICAL_CENTER);
        require(point != VERTICAL_BOTTOM);

        uint8 startX;
        if (dx > 0) {
            startX = getStartForRightMove(data, x, y);
            return isRightMovePossible(data, startX, y, dx);
        } else {
            startX = getStartForLeftMove(data, x, y);
            return isLeftMovePossible(data, startX, y, dx);
        }
    }

    function isVerticalMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dy) private pure returns (bool) {
        uint8 point = data[y][x];
        require(point != MOUSE_LEFT);
        require(point != MOUSE_RIGHT);
        require(point != HORIZONTAL_LEFT);
        require(point != HORIZONTAL_CENTER);
        require(point != HORIZONTAL_RIGHT);

        uint8 startY;
        if (dy > 0) {
            startY = getStartForBottomMove(data, x, y);
            return isBottomMovePossible(data, x, startY, dy);
        } else {
            startY = getStartForTopMove(data, x, y);
            return isTopMovePossible(data, x, startY, dy);
        }
    }

    function isRightMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx) private pure returns (bool) {
        for (int i = 1; i <= dx; i++) {
            uint endX = uint(x + i);
            if (endX >= COLUMN_COUNT) {
                return false;
            }
            if (data[y][endX] != EMPTY) {
                return false;
            }
        }
        return true;
    }

    function isLeftMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dx) private pure returns (bool) {
        for (int i = -1; i >= dx; i--) {
            uint endX = uint(x + i);
            if (endX < 0) {
                return false;
            }
            if (data[y][endX] != EMPTY) {
                return false;
            }
        }
        return true;
    }

    function isBottomMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dy) private pure returns (bool) {
        for (int j = 1; j <= dy; j++) {
            uint endY = uint(y + j);
            if (endY >= ROW_COUNT) {
                return false;
            }
            if (data[endY][x] != EMPTY) {
                return false;
            }
        }
        return true;
    }

    function isTopMovePossible(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y, int8 dy) private pure returns (bool) {
        for (int j = -1; j >= dy; j--) {
            uint endY = uint(y + j);
            if (endY < 0) {
                return false;
            }
            if (data[endY][x] != EMPTY) {
                return false;
            }
        }
        return true;
    }

    function getStartForRightMove(uint8[ROW_COUNT][COLUMN_COUNT]  data, uint8 x, uint8 y) private pure returns (uint8) {
        uint8 point = data[y][x];
        uint8 startX;
        if (point == MOUSE_LEFT || point == HORIZONTAL_CENTER) {
            startX = x + 1;
        } else if (point == MOUSE_RIGHT || point == HORIZONTAL_RIGHT) {
            startX = x;
        } else { //point == HORIZONTAL_LEFT
            if (data[y][x + 1] == HORIZONTAL_CENTER) {
                startX = x + 2;
            } else{
                startX = x + 1;
            }
        }
        return startX;
    }

    function getStartForLeftMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y) private pure returns (uint8) {
        uint8 point = data[y][x];
        uint8 startX;
        if (point == MOUSE_RIGHT || point == HORIZONTAL_CENTER) {
            startX = x - 1;
        } else if (point == MOUSE_LEFT || point == HORIZONTAL_LEFT) {
            startX = x;
        } else { //point == HORIZONTAL_RIGHT
            if (data[y][x - 1] == HORIZONTAL_CENTER) {
                startX = x - 2;
            } else{
                startX = x - 1;
            }
        }
        return startX;
    }

    function getStartForBottomMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y) private pure returns (uint8) {
        uint8 point = data[y][x];
        uint8 startY;
        if (point == VERTICAL_BOTTOM) {
            startY = y;
        } else if (point == VERTICAL_CENTER) {
            startY = y + 1;
        } else { //point == VERTICAL_TOP
            if (data[y + 1][x] == VERTICAL_CENTER) {
                startY = y + 2;
            } else{
                startY = y + 1;
            }
        }
        return startY;
    }

    function getStartForTopMove(uint8[ROW_COUNT][COLUMN_COUNT] data, uint8 x, uint8 y) private pure returns (uint8) {
        uint8 point = data[y][x];
        uint8 startY;
        if (point == VERTICAL_TOP) {
            startY = y;
        } else if (point == VERTICAL_CENTER) {
            startY = y - 1;
        } else { //point == VERTICAL_BOTTOM
            if (data[y - 1][x] == VERTICAL_CENTER) {
                startY = y - 2;
            } else{
                startY = y - 1;
            }
        }
        return startY;
    }

}
