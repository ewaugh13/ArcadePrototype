"use strict";
/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 - 2019 digitsensitive
 * @license      Digitsensitive
 */
Object.defineProperty(exports, "__esModule", { value: true });
class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MainScene"
        });
    }
    preload() {
        this.load.image("logo", "./src/boilerplate/assets/phaser.png");
    }
    create() {
        this.phaserSprite = this.add.sprite(400, 300, "logo");
    }
}
exports.MainScene = MainScene;
//# sourceMappingURL=mainScene.js.map