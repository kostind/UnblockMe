pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/GamePacker.sol";

contract GamePackerTest {

    uint8 private constant CELL_COUNT = 6 * 6;

    uint private constant MAX_DIVIDER = 16 ** (6 * 6 - 1);

    uint144 private constant PACKED_DATA = 5575186551628955132900715312964515223766918;

    uint8[CELL_COUNT] private DATA = [
        6, 8, 7, 0, 3, 0, //1, 16, 256, 4096, 65536, 1048576
        0, 3, 0, 0, 5, 0,
        0, 4, 1, 2, 4, 0,
        0, 6, 7, 0, 6, 7,
        0, 6, 8, 8, 0, 3,
        0, 0, 0, 0, 0, 4
    ];

    GamePacker private packer = GamePacker(DeployedAddresses.GamePacker());

    function testGetMaxDivider() public {
        uint maxDivider = packer.getMaxDivider();
        Assert.equal(maxDivider, MAX_DIVIDER, "Should be 1393796574908163946345982392040522594123776");
    }

    function testPack() public {
        uint packedData = packer.packLevel(DATA);
        Assert.equal(packedData, uint(PACKED_DATA), "Packed levels data should be the same.");
    }

    function testUnpack() public {
        uint8[CELL_COUNT] memory unpackedData = packer.unpackLevel(PACKED_DATA);
        for (uint i = 0; i < CELL_COUNT; i++) {
            Assert.equal(uint(unpackedData[i]), uint(DATA[i]), "Each cell value should be the same.");
        }
    }

    function testUnpackAndPack() public {
        uint8[CELL_COUNT] memory unpackedData = packer.unpackLevel(PACKED_DATA);
        uint packedData = packer.packLevel(unpackedData);
        Assert.equal(packedData, uint(PACKED_DATA), "Packed levels data should be the same.");
    }

}
