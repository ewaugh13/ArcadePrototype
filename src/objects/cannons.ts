import { CannonBall } from './cannonBall';

export class Cannon extends Phaser.Physics.Arcade.Sprite {
    public cannonBall: CannonBall;
   
    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number) {
        super(scene, xPosition, yPosition, 'cannon');
        scene.add.existing(this);
        scene.physics.world.enable(this);
    }
}