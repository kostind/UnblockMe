pragma solidity ^0.4.24;

contract GamePacker {

    int8 internal constant COLUMN_COUNT = 6;
    uint8 internal constant CELL_COUNT = 6 * 6;

    uint8 private constant MULTIPLIER_STEP = 16;
    uint private constant MAX_DIVIDER = 16 ** (6 * 6 - 1);

    uint8 internal constant MOVE_NUMBERS = 4;
    uint private constant MAX_MOVE_DIVIDER = 16 ** 3;

    function getMaxDivider() public pure returns (uint) {
        return MAX_DIVIDER;
    }

    function packLevel(uint8[CELL_COUNT] data) public pure returns (uint144) {
        uint packedData = 0;
        uint multiplier = 1;
        for (uint i = 0; i < CELL_COUNT; i++) {
            packedData += multiplier * data[i];
            multiplier = multiplier * MULTIPLIER_STEP;
        }
        return uint144(packedData);
    }

    function unpackLevel(uint144 packedData) public pure returns (uint8[CELL_COUNT]) {
        uint8[CELL_COUNT] memory data;
        uint divider = MAX_DIVIDER;
        uint inputData = packedData;
        for (int i = CELL_COUNT-1; i >= 0; i--) {
            uint8 value = uint8(inputData / divider);
            data[uint(i)] = value;
            inputData -= value * divider;
            divider = divider / MULTIPLIER_STEP;
        }
        return data;
    }

    function packMove(uint8 x, uint8 y, int8 dx, int8 dy) public pure returns (uint16) {
        int8[MOVE_NUMBERS] memory move;
        move[0] = int8(x);
        move[1] = int8(y);
        move[2] = dx;
        move[3] = dy;
        return packMove(move);
    }

    function packMove(int8[MOVE_NUMBERS] data) public pure returns (uint16) {
        uint packedData = 0;
        uint multiplier = 1;
        for (uint i = 0; i < MOVE_NUMBERS; i++) {
            int value = data[i];
            if (value < 0) {
                value += MULTIPLIER_STEP;
            }
            packedData += multiplier * uint(value);
            multiplier = multiplier * MULTIPLIER_STEP;
        }
        return uint16(packedData);
    }

    function unpackMove(uint16 packedData) public pure returns (int8[MOVE_NUMBERS]) {
        int8[MOVE_NUMBERS] memory data;
        uint divider = MAX_MOVE_DIVIDER;
        uint inputData = packedData;
        for (int i = MOVE_NUMBERS - 1; i >= 0; i--) {
            uint value = inputData / divider;
            data[uint(i)] = int8(value);
            if (data[uint(i)] > COLUMN_COUNT) {
                data[uint(i)] -= int8(MULTIPLIER_STEP);
            }
            inputData -= value * divider;
            divider = divider / MULTIPLIER_STEP;
        }
        return data;
    }

}
