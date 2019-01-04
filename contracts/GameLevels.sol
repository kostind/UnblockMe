pragma solidity ^0.4.24;

import "./Ownable.sol";
import "./GamePacker.sol";

contract GameLevels is GamePacker, Ownable {

    uint8 internal constant COLUMN_COUNT = 6;
    uint8 internal constant ROW_COUNT = 6;

    uint16 internal constant EMPTY = 0;

    uint16 internal constant MOUSE_LEFT = 1;
    uint16 internal constant MOUSE_RIGHT = 2;

    uint16 internal constant VERTICAL_TOP = 3;
    uint16 internal constant VERTICAL_CENTER = 5;
    uint16 internal constant VERTICAL_BOTTOM = 4;

    uint16 internal constant HORIZONTAL_LEFT = 6;
    uint16 internal constant HORIZONTAL_CENTER = 8;
    uint16 internal constant HORIZONTAL_RIGHT = 7;

    uint16 internal constant MAX_CELL_VALUE = HORIZONTAL_CENTER;

    mapping(uint16 => uint144) private levels;
    uint16 internal levelCount = 0;

    function addLevel(uint144 data) public onlyOwner {
        require(isLevelNotExists(data));
        require(isLevelCorrectlyPacked(data));

        levelCount++;
        levels[levelCount] = data;
    }

    function addLevels(uint144[] data) public onlyOwner {
        for (uint i = 0; i < data.length; i++) {
            addLevel(data[i]);
        }
    }

    function getPackedLevel(uint16 levelNumber) internal view returns (uint144) {
        require(levelNumber > 0 && levelNumber <= levelCount);

        return levels[levelNumber];
    }

    function getLevelCount() public view onlyOwner returns (uint16) {
        return levelCount;
    }

    function getLevel(uint16 levelNumber) public view returns (uint8[CELL_COUNT]) {
        require(levelNumber > 0 && levelNumber <= levelCount);

        return unpackLevel(levels[levelNumber]);
    }

    /**
     * @dev Checks that level has not been added yet.
     */
    function isLevelNotExists(uint144 data) private view returns (bool) {
        for (uint16 i = 0; i < levelCount; i++) {
            if (levels[i+1] == data) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Checks that level correctly packed.
     */
    function isLevelCorrectlyPacked(uint144 data) private pure returns (bool) {
        uint8[CELL_COUNT] memory unpackedData = unpackLevel(data);
        for (uint i = 0; i < CELL_COUNT; i++) {
            if (unpackedData[i] > MAX_CELL_VALUE) {
                return false;
            }
        }
        return true;
    }

}
