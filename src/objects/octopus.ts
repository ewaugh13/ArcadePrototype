import * as Phaser from 'phaser';

export enum OctopusColor {
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

    private minXPosition: number = 0;
    private maxXPosition: number = 0;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, velocityX: number, color: OctopusColor) {
        super(scene, xPosition, yPosition, 'octopusPink');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.velocityX = velocityX;
        this.octopusColor = color;
        this.setOctopusSpeed();
    }

    public setXRange(minXPosition: number, maxXPosition: number) {
        this.minXPosition = minXPosition;
        this.maxXPosition = maxXPosition;
    }

    public xPositionConstraint() {
        // turn octopus around here
        if (this.body.position.x < this.minXPosition && this.velocityX < 0) {
            this.velocityX *= -1;
        }
        else if (this.body.position.x > this.maxXPosition && this.velocityX > 0) {
            this.velocityX *= -1;
        }
    }

    public setOctopusSpeed() {
        if (this.octopusColor === OctopusColor.Teal) {
            this.velocityX = this.startVelocityX * 1.25;
            this.setTexture('octopusTeal');
        }
        else if (this.octopusColor === OctopusColor.Yellow) {
            this.velocityX = this.startVelocityX * 1.5;
            this.setTexture('octopusYellow');
        }
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