let GamePacker = artifacts.require("./GamePacker.sol");

contract('GamePacker', function (accounts) {

    const CELL_COUNT = 6 * 6;

    const PACKED_DATA = "5615339870601424230596297733338991268398982";
    const DATA = [
        6, 8, 7, 0, 3, 0, //1, 16, 256, 4096 65536 1048576
        0, 0, 0, 0, 4, 3,
        0, 0, 1, 2, 0, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];

    const MOVE = [5, 4, -1, 2];

    let gamePacker;

    before(async function () {
        gamePacker = await GamePacker.deployed();
    });

    beforeEach(async function () {
        // gamePacker = await GamePacker.new();
    });

    it("packAndUnpackLevel", async function () {
        let packedData = await gamePacker.packLevel(DATA);
        let unpackedData = await gamePacker.unpackLevel.call(packedData);
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], unpackedData[i],"Each cell value should be the same");
        }
    });

    it("unpackLevel", async function () {
        let unpackedData = await gamePacker.unpackLevel.call(PACKED_DATA);
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], unpackedData[i],"Each cell value should be the same");
        }
    });

    it("packAndUnpackMove", async function () {
        let packedMove = await gamePacker.packMove.call(MOVE);
        let unpackedMove = await gamePacker.unpackMove.call(packedMove);
        for (let i = 0; i < MOVE.length; i++) {
            assert.equal(MOVE[i], unpackedMove[i],"Each element of the array should be the same");
        }
    });

});
