import * as Phaser from 'phaser';

export class Octopus extends Phaser.Physics.Arcade.Sprite {
    public velocityX: number = 0;
    public octopusVulnerable: boolean = false;
    public previousVelocityX: number = 0;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, velocityX: number) {
        super(scene, xPosition, yPosition, 'octopusPink');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.velocityX = velocityX;
    }
}