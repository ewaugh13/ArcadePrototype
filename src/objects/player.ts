

export class Player extends Phaser.Physics.Arcade.Sprite {

    public playerLives: Array<Phaser.GameObjects.Sprite>
    public playerScene: Phaser.Scene;
    public respawnPlatform: Phaser.GameObjects.Sprite;
    public lastXPosition: number;
    public lastYPosition: number;
    public canMove: Boolean;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number) {
        super(scene, xPosition, yPosition, 'dude');
        this.playerLives = new Array();
        this.playerScene = scene;
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.canMove = true;
    }
}