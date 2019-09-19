const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MainMenu',
};

export class MainMenu extends Phaser.Scene {
    private skyLayer: Phaser.GameObjects.Image;
    private cloudLayer: Phaser.GameObjects.Image;
    private titleImage: Phaser.GameObjects.Image;
    private startGamePromt: Phaser.GameObjects.Sprite;
    private waterLayer: Phaser.GameObjects.Sprite;
    private shipLayer: Phaser.GameObjects.Sprite;
    private mainMenuMusic: Phaser.Sound.BaseSound;

    constructor() {
        super(sceneConfig);
    }

    public preload() {
        this.load.image('SkyLayer', 'src/assets/MainMenu/Sky_Layer.png');
        this.load.image('CloudLayer', 'src/assets/MainMenu/Cloud_Layer.png');
        this.load.image('MainMenuTitle', 'src/assets/MainMenu/MainMenuTitle.png');

        this.load.audio('mainMenuMusic', 'src/assets/SFX/Music/Menu.wav');

        this.load.spritesheet('WaterLayer', 'src/assets/MainMenu/Water_Layer.png',
            { frameWidth: 512, frameHeight: 256, spacing: 0 });
        this.load.spritesheet('ShipLayer', 'src/assets/MainMenu/Ship_Layer.png',
            { frameWidth: 241, frameHeight: 335, spacing: 0 });
        this.load.spritesheet('StartGamePromt', 'src/assets/MainMenu/StartGamePrompt.png',
            { frameWidth: 227, frameHeight: 12, spacing: 0 })
    }

    public create() {

        this.loadAnims();

        //Sky Layer
        this.skyLayer = this.add.image(0, 0, 'SkyLayer');
        this.skyLayer.setOrigin(0, 0);
        this.skyLayer.setScale(1);

        //Cloud Layer
        this.cloudLayer = this.add.image(0, 0, 'CloudLayer');
        this.cloudLayer.setOrigin(0, 0);
        this.cloudLayer.setScale(.5);

        //Water Layer
        this.waterLayer = this.add.sprite(0, 800, 'WaterLayer');
        this.waterLayer.setOrigin(0, 0);
        this.waterLayer.setScale(4);
        this.waterLayer.anims.play('WaterWaves', true);

        //Ship Layer
        this.shipLayer = this.add.sprite(700, 200, 'ShipLayer');
        this.shipLayer.setOrigin(0, 0);
        this.shipLayer.setScale(2);
        this.shipLayer.anims.play('ShipBobble', true);

        //MainMenuTitle
        this.titleImage = this.add.sprite(750, 500, 'MainMenuTitle');
        this.titleImage.setOrigin(0, 0);

        //StartGamePromt
        this.startGamePromt = this.add.sprite(825, 675, 'StartGamePromt');
        this.startGamePromt.setOrigin(0, 0);
        this.startGamePromt.play('StartGame', true);

        this.input.keyboard.on('keydown_ENTER', this.changeScene, this);


        this.mainMenuMusic = this.sound.add('mainMenuMusic', { loop: true });
        //this.mainMenuMusic.play();

        this.cameras.main.setScroll(0, 20);
    }

    private changeScene() {
        this.mainMenuMusic.stop();
        this.scene.start("Game");
    }

    private loadAnims() {
        // water anims
        this.anims.create({
            key: 'WaterWaves',
            frames: this.anims.generateFrameNumbers('WaterLayer', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        // ship anims
        this.anims.create({
            key: 'ShipBobble',
            frames: this.anims.generateFrameNumbers('ShipLayer', { start: 0, end: 16 }),
            frameRate: 10,
            repeat: -1
        });
        // game promtv
        this.anims.create({
            key: 'StartGame',
            frames: this.anims.generateFrameNumbers('StartGamePromt', { start: 0, end: 17 }),
            frameRate: 10,
            repeat: -1
        });
    }
}