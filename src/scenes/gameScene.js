"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "GameScene"
        });
    }
    preload() {
        this.load.image('background', 'src/assets/Ship.png');
        this.load.spritesheet('player', 'assets/scottpilgrim_multiple.png', { frameWidth: 128, frameHeight: 128 });
    }
    init() { }
    create() {
        this.add.image(0, -3240, 'background').setOrigin(0, 0);
        this.cameras.main.startFollow(this.player);
        // this needs to be updated
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
    update() {
        //const cursorKeys = this.input.keyboard.createCursorKeys();
        //   if (cursorKeys.up.isDown) {
        //     this.player.x
        //     this.player.body.setVelocityY(-500);
        //   } else if (cursorKeys.down.isDown) {
        //     this.player.body.setVelocityY(500);
        //   } else {
        //     this.player.body.setVelocityY(0);
        //   }
        //   if (cursorKeys.right.isDown) {
        //     this.player.body.setVelocityX(500);
        //   } else if (cursorKeys.left.isDown) {
        //     this.player.body.setVelocityX(-500);
        //   } else {
        //     this.player.body.setVelocityX(0);
        //   }
    }
}
exports.GameScene = GameScene;
//# sourceMappingURL=gameScene.js.map