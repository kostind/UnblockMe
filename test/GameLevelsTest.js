import assertRevert from "./helpers/assertRevert";

let GameLevels = artifacts.require("./GameLevels.sol");

contract('GameLevels', function (accounts) {

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

    const PACKED_DATA_SECOND_LEVEL = "21778685147526267686727850216284288943616";
    const DATA_SECOND_LEVEL = [
        0, 0, 6, 8, 7, 0,
        0, 0, 0, 0, 3, 0,
        1, 2, 0, 0, 5, 0,
        0, 0, 0, 0, 4, 0,
        0, 0, 0, 3, 6, 7,
        0, 0, 0, 4, 0, 0
    ];

    const PACKED_DATA_THIRD_LEVEL = "351009252424166746894458531260664564942726";
    const DATA_THIRD_LEVEL = [
        6, 8, 7, 0, 0, 3,
        0, 0, 3, 0, 0, 5,
        1, 2, 5, 0, 0, 4,
        3, 0, 4, 0, 6, 7,
        4, 0, 0, 0, 3, 0,
        6, 8, 7, 0, 4, 0
    ];

    const PACKED_DATA_LEVELS = [PACKED_DATA, PACKED_DATA_SECOND_LEVEL, PACKED_DATA_THIRD_LEVEL];
    const DATA_LEVELS = [DATA, DATA_SECOND_LEVEL, DATA_THIRD_LEVEL];

    let gameLevels;

    before(async function () {
        // gameLevels = await GameLevels.deployed();
    });

    beforeEach(async function () {
        gameLevels = await GameLevels.new();
    });

    it("Only owner should be able to add level.", async function () {
        await assertRevert(gameLevels.addLevel(PACKED_DATA, {from: accounts[1]}));
    });

    it("Only owner should be able to add levels.", async function () {
        await assertRevert(gameLevels.addLevels([PACKED_DATA], {from: accounts[1]}));
    });

    it("Level should be added only once.", async function () {
        await gameLevels.addLevel(PACKED_DATA, {from: accounts[0]});
        await assertRevert(gameLevels.addLevel(PACKED_DATA, {from: accounts[0]}));
    });

    it("Only correctly packed level can be add.", async function () {
        await assertRevert(gameLevels.addLevel("999", {from: accounts[0]}));
    });

    it("addLevel: Data for level 1 should be equal.", async function () {
        await gameLevels.addLevel(PACKED_DATA, {from: accounts[0]});
        let loadedLevel = await gameLevels.getLevel.call(1);
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("addLevels: Data for level 1 should be equal.", async function () {
        await gameLevels.addLevels(PACKED_DATA_LEVELS, {from: accounts[0]});
        for (let j = 0; j < DATA_LEVELS.length; j++) {
            let data = DATA_LEVELS[j];
            let loadedLevel = await gameLevels.getLevel.call(j + 1);
            for (let i = 0; i < CELL_COUNT; i++) {
                assert.equal(data[i], loadedLevel[i].toNumber(), "Each cell value should be the same");
            }
        }
    });

    it("Level 1 shouldn't be exist.", async function () {
        await assertRevert(gameLevels.getLevel.call(1));
    });

    it("Only owner should be able to get level count.", async function () {
        await assertRevert(gameLevels.getLevelCount.call({from: accounts[1]}));
    });

});
