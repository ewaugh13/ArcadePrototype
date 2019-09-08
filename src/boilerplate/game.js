"use strict";
/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 - 2019 digitsensitive
 * @license      Digitsensitive
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("phaser");
const mainScene_1 = require("./scenes/mainScene");
// main game configuration
const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: "game",
    scene: mainScene_1.MainScene,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 }
        }
    }
};
// game class
class Game extends Phaser.Game {
    constructor(config) {
        super(config);
    }
}
exports.Game = Game;
// when the page is loaded, create our game instance
window.addEventListener("load", () => {
    var game = new Game(config);
});
//# sourceMappingURL=game.js.map