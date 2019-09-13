import * as Phaser from 'phaser';

enum OctopusColor {
    Pink = 1,
    Teal = 2,
    Yellow = 3
}

export class Octopus extends Phaser.Physics.Arcade.Sprite {
    public velocityX: number = 0;
    public octopusVulnerable: boolean = false;
    public previousVelocityX: number = 0;
    public octopusColor: OctopusColor = OctopusColor.Pink;

    public startVelocityX: number = 0;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, velocityX: number) {
        super(scene, xPosition, yPosition, 'octopusPink');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.velocityX = velocityX;
    }

    public updateOctopusSpeed() {
        if (this.octopusColor === OctopusColor.Pink) {
            this.octopusColor = OctopusColor.Teal;
            this.velocityX = this.startVelocityX * 1.25;
            this.setTexture('octopusTeal');
        }
        else if (this.octopusColor === OctopusColor.Teal) {
            this.octopusColor = OctopusColor.Yellow;
            this.velocityX = this.startVelocityX * 1.5;
            this.setTexture('octopusYellow');
        }
        else {
            this.octopusColor === OctopusColor.Yellow;
            this.velocityX = this.startVelocityX * 1.5;
        }
    }
}