import { CannonBall } from './cannonBall';

export class Cannon extends Phaser.Physics.Arcade.Sprite {
    public cannonBall: CannonBall;
    public startAngle: number;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number, startAngle: number) {
        super(scene, xPosition, yPosition, 'cannon');
        this.startAngle = startAngle;
        scene.add.existing(this);
        scene.physics.world.enable(this);
    }
}