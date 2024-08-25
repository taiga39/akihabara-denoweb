import Phaser from 'phaser';

export default class HamburgerMenu extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        this.relativeUnits = this.createRelativeUnits(scene);

        // ハンバーガーボタンを作成
        this.createButton();
        this.positionButton();
        scene.add.existing(this);

        this.setDepth(1000); // 他のUIの上に表示されるようにする
    }

    createRelativeUnits(scene) {
        const baseSize = Math.min(scene.scale.width, scene.scale.height);
        return {
            fontSize: {
                small: baseSize * 0.02,
                medium: baseSize * 0.03,
                large: baseSize * 0.05
            },
            toPixels: (value) => baseSize * (value / 100)
        };
    }

    createButton() {
        const menuButton = this.scene.add.text(0, 0, '☰', {
            fontSize: this.relativeUnits.fontSize.large * 2,
            color: '#000000'
        }).setInteractive();

        menuButton.on('pointerdown', () => {
            // メニューシーンをオーバーレイとして表示
            this.scene.scene.start('MenuScene');
        });

        this.add(menuButton);
        this.menuButton = menuButton;
    }

    positionButton() {
        const margin = this.relativeUnits.toPixels(5);
        const screenWidth = this.scene.cameras.main.width;
        const topEdge = margin;
        const rightEdge = screenWidth - margin;

        this.menuButton.setPosition(rightEdge - this.menuButton.width / 2, topEdge);
        this.setPosition(0, 0);
    }
}
