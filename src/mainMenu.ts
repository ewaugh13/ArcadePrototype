const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MainMenu',
};

export class MainMenu extends Phaser.Scene {
    private skyLayer: Array<Phaser.GameObjects.Image>;
    private background: Phaser.GameObjects.Image;
    private mainMenuText: Phaser.GameObjects.Text;

    constructor() {
        super(sceneConfig);
    }

    public preload() {
        this.load.image('SkyLayer', 'src/assets/MainMenu/Sky_Layer.png');
    }

    public create() {
        this.skyLayer = new Array();

        //Sky Layer
        this.skyLayer.push(this.add.image(0, 0, 'SkyLayer'));

        var i: number;
        for (i = 0; i < this.skyLayer.length; i++) {
            this.skyLayer[i].setOrigin(0, 0);
        }

        //Init ScoreSystem
        //this.mainMenuText = this.add.text(50, 3250, 'Score: 0', { fontSize: '32px', fill: '#fff' });

        //Camera Creation
        //this.cameras.main.setBounds(0, 0, this.background.width, this.background.height);
        //this.cameras.main.setViewport(0, 0, 1920, 1080);
    }

    public update() {
        this.input.keyboard.on('keydown', function (event) { console.log('key press') });
    }
}