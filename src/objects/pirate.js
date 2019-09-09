"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pirate extends Phaser.GameObjects.Sprite {
    getKeys() {
        return this.keys;
    }
    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.currentScene = params.scene;
        this.initSprite();
        this.currentScene.add.existing(this);
    }
    initSprite() {
        // input
        this.keys = new Map([
            ["LEFT", this.addKey("LEFT")],
            ["RIGHT", this.addKey("RIGHT")],
            ["DOWN", this.addKey("DOWN")],
            ["JUMP", this.addKey("SPACE")],
            ["A", this.addKey("A")],
            ["W", this.addKey("W")],
            ["D", this.addKey("D")],
            ["S", this.addKey("S")]
        ]);
    }
    addKey(key) {
        return this.currentScene.input.keyboard.addKey(key);
    }
}
exports.Pirate = Pirate;
//# sourceMappingURL=pirate.js.map