import assertRevert from "./helpers/assertRevert";
import assertVmException from "./helpers/assertVmException";
import {LEVEL_PRICE} from "../src/constants";

let GameBoard = artifacts.require("./GameBoard.sol");

contract('GameBoard', function (accounts) {

    const CELL_COUNT = 6 * 6;
    const FIRST_LEVEL = 1;
    const SECOND_LEVEL = 2;
    const THIRD_LEVEL = 3;

    const PACKED_DATA = "5615339870601424230596297733338991268398982";
    const DATA = [
        6, 8, 7, 0, 3, 0,
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

    const DATA_MOUSE_RIGHT = [
        6, 8, 7, 0, 3, 0,
        0, 0, 0, 0, 4, 3,
        0, 0, 0, 1, 2, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];
    const DATA_MOUSE_LEFT = [
        6, 8, 7, 0, 3, 0,
        0, 0, 0, 0, 4, 3,
        1, 2, 0, 0, 0, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];
    const DATA_HORIZONTAL_RIGHT_LONG = [
        0, 6, 8, 7, 3, 0,
        0, 0, 0, 0, 4, 3,
        0, 0, 1, 2, 0, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];
    const DATA_HORIZONTAL_RIGHT_SHORT = [
        6, 8, 7, 0, 3, 0,
        0, 0, 0, 0, 4, 3,
        0, 0, 1, 2, 0, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 0, 6, 7, 4
    ];
    const DATA_HORIZONTAL_LEFT_LONG = [
        6, 8, 7, 0, 3, 0,
        0, 0, 0, 0, 4, 3,
        3, 0, 1, 2, 0, 4,
        4, 6, 7, 0, 6, 7,
        6, 8, 7, 0, 0, 3,
        0, 0, 6, 7, 0, 4
    ];
    const DATA_HORIZONTAL_LEFT_SHORT = [
        6, 8, 7, 0, 3, 0,
        0, 0, 0, 0, 4, 3,
        0, 0, 1, 2, 0, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        6, 7, 0, 0, 0, 4
    ];
    const DATA_VERTICAL_BOTTOM_SHORT = [
        6, 8, 7, 0, 0, 0,
        0, 0, 0, 0, 3, 3,
        0, 0, 1, 2, 4, 4,
        3, 6, 7, 0, 6, 7,
        4, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];
    const DATA_VERTICAL_TOP_SHORT = [
        6, 8, 7, 0, 3, 0,
        3, 0, 0, 0, 4, 3,
        4, 0, 1, 2, 0, 4,
        0, 6, 7, 0, 6, 7,
        0, 6, 8, 7, 0, 3,
        0, 0, 6, 7, 0, 4
    ];

    let gameBoard;

    before(async function () {

    });

    beforeEach(async function () {
        gameBoard = await GameBoard.new();
        await gameBoard.addLevel(PACKED_DATA, {from: accounts[0]});
    });

    it("startGame_positive", async function () {
        await gameBoard.startGame();
        let level = await gameBoard.getPlayerLevel.call();
        assert.equal(FIRST_LEVEL, level, "First level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("restartLevel_negative", async function () {
        await assertRevert(gameBoard.restartLevel());
    });

    it("restartLevel_positive", async function () {
        await gameBoard.startGame();
        await gameBoard.move(2, 2, 1, 0);
        await gameBoard.restartLevel();
        let level = await gameBoard.getPlayerLevel.call();
        assert.equal(FIRST_LEVEL, level, "First level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_negative", async function () {
        await gameBoard.startGame();
        await assertRevert(gameBoard.move(2, 2, 2, 0));
    });

    it("estimateGas: startGame, move, getPlayerBoard", async function () {
        console.log("==================================");
        let gasAmount = await gameBoard.startGame.estimateGas();
        await gameBoard.startGame();
        console.log("startGame: " + gasAmount);
        gasAmount = await gameBoard.move.estimateGas(2, 2, 1, 0);
        console.log("move: " + gasAmount);
        gasAmount = await gameBoard.getPlayerBoard.estimateGas();
        console.log("getPlayerBoard: " + gasAmount);
        console.log("==================================");
    });

    it("move_mouse_right", async function () {
        await gameBoard.startGame();
        await gameBoard.move(2, 2, 1, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_MOUSE_RIGHT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_mouse_left", async function () {
        await gameBoard.startGame();
        await gameBoard.move(2, 2, -2, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_MOUSE_LEFT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_horizontal_right_long", async function () {
        await gameBoard.startGame();
        await gameBoard.move(0, 0, 1, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_HORIZONTAL_RIGHT_LONG[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_horizontal_right_short", async function () {
        await gameBoard.startGame();
        await gameBoard.move(2, 5, 1, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_HORIZONTAL_RIGHT_SHORT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_horizontal_left_long", async function () {
        await gameBoard.startGame();
        await gameBoard.move(0, 3, 0, -1);
        await gameBoard.move(1, 4, -1, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_HORIZONTAL_LEFT_LONG[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_horizontal_left_short", async function () {
        await gameBoard.startGame();
        await gameBoard.move(2, 5, -2, 0);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_HORIZONTAL_LEFT_SHORT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_vertical_bottom_short", async function () {
        await gameBoard.startGame();
        await gameBoard.move(4, 0, 0, 1);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_VERTICAL_BOTTOM_SHORT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("move_vertical_top_short", async function () {
        await gameBoard.startGame();
        await gameBoard.move(0, 3, 0, -2);
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_VERTICAL_TOP_SHORT[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("level_first_solved: one level game", async function () {
        await gameBoard.startGame();
        await gameBoard.move(5, 1, 0, -1);
        await gameBoard.move(2, 2, 2, 0);

        let level = await gameBoard.getPlayerLevel.call();
        assert.equal(FIRST_LEVEL, level, "First level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("level_second_solved: two level game", async function () {
        await gameBoard.addLevel(PACKED_DATA_SECOND_LEVEL, {from: accounts[0]});

        await gameBoard.startGame();
        await gameBoard.move(5, 1, 0, -1);
        await gameBoard.move(2, 2, 2, 0);

        let level = await gameBoard.getPlayerLevel.call();
        assert.equal(SECOND_LEVEL, level, "Second level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_SECOND_LEVEL[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("levels_first_and_second_solved: two level game", async function () {
        await gameBoard.addLevel(PACKED_DATA_SECOND_LEVEL, {from: accounts[0]});

        await gameBoard.startGame();
        await gameBoard.move(5, 1, 0, -1);
        await gameBoard.move(2, 2, 2, 0);

        await gameBoard.move(2, 0, -2, 0);
        await gameBoard.move(3, 4, 0, -4);
        await gameBoard.move(4, 4, -3, 0);
        await gameBoard.move(4, 1, 0, 2);
        await gameBoard.move(0, 2, 4, 0);

        let level = await gameBoard.getPlayerLevel.call();
        assert.equal(SECOND_LEVEL, level, "Second level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call();
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_SECOND_LEVEL[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("levels_first_and_second_solved_by_move_list: three level game", async function () {
        await gameBoard.addLevel(PACKED_DATA_SECOND_LEVEL, {from: accounts[0]});
        await gameBoard.addLevel(PACKED_DATA_THIRD_LEVEL, {from: accounts[0]});

        await gameBoard.startGame({from: accounts[1]});

        let solutionForFirstLevel = [
            5, 1, 0, -1,
            2, 2, 2, 0
        ];
        await gameBoard.applyMoves(solutionForFirstLevel, {value: LEVEL_PRICE, from: accounts[1]});

        let solutionForSecondLevel = [
            2, 0, -2, 0,
            3, 4, 0, -4,
            4, 4, -3, 0,
            4, 1, 0, 2,
            0, 2, 4, 0
        ];
        await gameBoard.applyMoves(solutionForSecondLevel, {value: LEVEL_PRICE, from: accounts[1]});

        let level = await gameBoard.getPlayerLevel.call({from: accounts[1]});
        assert.equal(THIRD_LEVEL, level, "Third level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call({from: accounts[1]});
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_THIRD_LEVEL[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("invalid move list", async function () {
        await gameBoard.addLevel(PACKED_DATA_SECOND_LEVEL, {from: accounts[0]});

        await gameBoard.startGame();

        let solutionForFirstLevel = [
            5, 1, 0, -2,
            2, 2, 2, 0
        ];
        await assertVmException(gameBoard.applyMoves(solutionForFirstLevel));
    });

    it("Only owner should be able to get game balance", async function () {
        await assertRevert(gameBoard.getGameBalance.call({from: accounts[1]}));
    });

    it("Only owner should be able to transfer ether", async function () {
        await assertRevert(gameBoard.transferToOwner({from: accounts[1]}));
    });

    it("Only owner should be able to get player addresses", async function () {
        await assertRevert(gameBoard.getPlayerAddresses.call({from: accounts[1]}));
    });

    it("Only owner should be able to get player levels", async function () {
        await assertRevert(gameBoard.getAddressLevel.call(accounts[0], {from: accounts[1]}));
    });

    it("Only owner should be able to increment level for some player", async function () {
        await assertRevert(gameBoard.nextLevelForPlayer(accounts[0], {from: accounts[1]}));
    });

    it("levels_first_and_second_solved_by_owner: three level game", async function () {
        await gameBoard.addLevel(PACKED_DATA_SECOND_LEVEL, {from: accounts[0]});
        await gameBoard.addLevel(PACKED_DATA_THIRD_LEVEL, {from: accounts[0]});

        await gameBoard.startGame({from: accounts[1]});

        await gameBoard.nextLevelForPlayer(accounts[1], {from: accounts[0]});
        await gameBoard.nextLevelForPlayer(accounts[1], {from: accounts[0]});

        let level = await gameBoard.getPlayerLevel.call({from: accounts[1]});
        assert.equal(THIRD_LEVEL, level, "Third level should be active");
        let loadedLevel = await gameBoard.getPlayerBoard.call({from: accounts[1]});
        for (let i = 0; i < CELL_COUNT; i++) {
            assert.equal(DATA_THIRD_LEVEL[i], loadedLevel[i], "Each cell value should be the same");
        }
    });

    it("isOwner: true", async function () {
        let isOwner =  await gameBoard.isOwner.call({from: accounts[0]});
        assert.equal(true, isOwner);
    });

    it("isOwner: false", async function () {
        let isOwner =  await gameBoard.isOwner.call({from: accounts[1]});
        assert.equal(false, isOwner);
    });

});
