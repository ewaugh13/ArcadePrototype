import * as Phaser from 'phaser';

export class CannonBall extends Phaser.Physics.Arcade.Sprite {
    public velocityX: number = 0;
    public velocityY: number = 0;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, velocityX: number, velocityY: number) {
        super(scene, xPosition, yPosition, 'cannonBall');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.velocityX = velocityX
        this.velocityY = velocityY;
    }
}