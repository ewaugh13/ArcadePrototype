

export class Player extends Phaser.Physics.Arcade.Sprite {

    public playerLives: Array<Phaser.GameObjects.Sprite>

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number) {
        super(scene, xPosition, yPosition, 'dude');
        this.playerLives = new Array();
        scene.add.existing(this);
        scene.physics.world.enable(this);
    }
}