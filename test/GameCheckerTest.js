import assertRevert from "./helpers/assertRevert";

let GameChecker = artifacts.require("./GameChecker.sol");

contract('GameChecker', function (accounts) {

    const COLUMN_COUNT = 6;
    const ROW_COUNT = 6;

    const DATA = [
        6, 8, 7, 0, 3, 0, //1, 16, 256, 4096, 65536, 1048576
        0, 3, 0, 0, 5, 0,
        0, 4, 1, 2, 4, 0,
        0, 6, 7, 0, 0, 0,
        0, 6, 8, 8, 0, 3,
        0, 0, 0, 0, 0, 4
    ];

    const SOLVED_LEVEL_DATA = [
        6, 8, 7, 0, 0, 0, //1, 16, 256, 4096, 65536, 1048576
        0, 3, 0, 0, 0, 0,
        0, 4, 0, 0, 1, 2,
        0, 6, 7, 0, 3, 0,
        0, 6, 8, 8, 4, 3,
        0, 0, 0, 0, 5, 4
    ];

    let gameChecker;

    before(async function () {
        gameChecker = await GameChecker.deployed();
    });

    beforeEach(async function () {
        // gameChecker = await GameChecker.new();
    });

    it("isMovePossible_OutOfTheBoard_Left", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, -1, 0, 1, 0));
    });

    it("isMovePossible_OutOfTheBoard_Right", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, COLUMN_COUNT, 0, 1, 0));
    });

    it("isMovePossible_OutOfTheBoard_Bottom", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 0, -1, 1, 0));
    });

    it("isMovePossible_OutOfTheBoard_Top", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 0, ROW_COUNT, 1, 0));
    });

    it("isMovePossible_DiagonalMove", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 0, 0, 1, 1));
    });

    it("isMovePossible_NothingToMove", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 3, 0, 1, 0));
    });

    it("isMovePossible_MoveIsNotDefined", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 0, 0, 0, 0));
    });

    it("isMovePossible_HorizontalMoveForVerticalBlock", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 1, 1, 1, 0));
    });

    it("isMovePossible_VerticalMoveForHorizontalBlock", async function () {
        await assertRevert(gameChecker.isMovePossible.call(DATA, 0, 0, 0, 1));
    });

    it("isMovePossible_Horizontal_Right_positive", async function () {
        assert.isTrue(await gameChecker.isMovePossible.call(DATA, 0, 0, 1, 0));
    });

    it("isMovePossible_Horizontal_Right_negative", async function () {
        assert.isNotTrue(await gameChecker.isMovePossible.call(DATA, 0, 0, 2, 0));
    });

    it("isMovePossible_Horizontal_Left_positive", async function () {
        assert.isTrue(await gameChecker.isMovePossible.call(DATA, 1, 4, -1, 0));
    });

    it("isMovePossible_Horizontal_Left_negative", async function () {
        assert.isNotTrue(await gameChecker.isMovePossible.call(DATA, 2, 2, -1, 0));
    });

    it("isMovePossible_Vertical_Bottom_positive", async function () {
        assert.isTrue(await gameChecker.isMovePossible.call(DATA, 4, 0, 0, 3));
    });

    it("isMovePossible_Vertical_Bottom_negative", async function () {
        assert.isNotTrue(await gameChecker.isMovePossible.call(DATA, 1, 1, 0, 1));
    });

    it("isMovePossible_Vertical_Top_positive", async function () {
        assert.isTrue(await gameChecker.isMovePossible.call(DATA, 5, 4, 0, -4));
    });

    it("isMovePossible_Vertical_Top_negative", async function () {
        assert.isNotTrue(await gameChecker.isMovePossible.call(DATA, 1, 1, 0, -1));
    });

    it("isLevelSolved_positive", async function () {
        assert.isTrue(await gameChecker.isLevelSolved.call(SOLVED_LEVEL_DATA));
    });

    it("isLevelSolved_negative", async function () {
        assert.isNotTrue(await gameChecker.isLevelSolved.call(DATA));
    });

});
