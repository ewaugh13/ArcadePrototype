import * as Phaser from 'phaser';

export class Octopus extends Phaser.Physics.Arcade.Sprite {
    public velocityX: number;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, velocityX: number) {
        super(scene, xPosition, yPosition, 'octopus');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.velocityX = velocityX;
    }
}