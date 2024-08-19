import Phaser from 'phaser';
import { createRelativeUnits } from '../main';
import { loadGameState } from '../hooks/gameState';

export default class HamburgerMenu extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        this.relativeUnits = createRelativeUnits(scene);
        this.createMenu();
        this.positionMenu();
        scene.add.existing(this);

        this.setDepth(1000);
    }

    createMenu() {
        const menuButton = this.scene.add.text(0, 0, '☰', {
            fontSize: this.relativeUnits.fontSize.large,
            color: '#000000'
        }).setInteractive();

        const gameState = loadGameState();
        const completedScenes = gameState.answer_scene || [];

        const itemWidth = this.relativeUnits.toPixels(40);
        const itemHeight = this.relativeUnits.toPixels(10);
        const padding = this.relativeUnits.toPixels(2);

        const menuItems = this.scene.add.container(0, 0);

        // Current Scene
        this.addMenuItem(menuItems, "現在の問題", 0, itemWidth, itemHeight, padding);

        // Completed Scenes
        completedScenes.forEach((scene, index) => {
            this.addMenuItem(menuItems, `問題${index + 1}`, index + 1, itemWidth, itemHeight, padding);
        });

        // 持ち物 button
        this.addMenuItem(menuItems, '持ち物', completedScenes.length + 1, itemWidth, itemHeight, padding);

        // 設定 button
        this.addMenuItem(menuItems, '設定', completedScenes.length + 2, itemWidth, itemHeight, padding);

        const menuBackground = this.scene.add.rectangle(0, 0, itemWidth, (itemHeight + padding) * (completedScenes.length + 3) + padding, 0x000000);
        menuBackground.setOrigin(1, 0);

        menuItems.setVisible(false);
        menuBackground.setVisible(false);

        menuButton.on('pointerdown', () => {
            const visible = !menuItems.visible;
            menuItems.setVisible(visible);
            menuBackground.setVisible(visible);
        });

        this.menuButton = menuButton;
        this.menuItems = menuItems;
        this.menuBackground = menuBackground;
        this.add([menuBackground, menuItems, menuButton]);
    }

    addMenuItem(container, text, index, itemWidth, itemHeight, padding) {
        const itemBackground = this.scene.add.rectangle(0, 0, itemWidth - padding * 2, itemHeight, 0x000000);
        itemBackground.setOrigin(1, 0);

        const textObject = this.scene.add.text(0, 0, text, {
            fontSize: this.relativeUnits.fontSize.medium,
            color: '#ffffff',
            wordWrap: { width: itemWidth - padding * 4 }
        })
        .setOrigin(0, 0)
        .setPadding(4);  // パディングを追加して文字が欠けないように調整

        // テキストが項目の幅を超える場合、スケールを調整
        const maxTextWidth = itemWidth - padding * 4;
        if (textObject.width > maxTextWidth) {
            const scale = maxTextWidth / textObject.width;
            textObject.setScale(scale);
        }

        const button = this.scene.add.container(0, (itemHeight + padding) * index + padding);
        button.setSize(itemWidth - padding * 2, itemHeight);

        // テキストの位置を再調整
        const textX = -itemWidth + padding * 2;
        const textY = padding;
        textObject.setPosition(textX, textY);

        button.add([itemBackground, textObject]);

        // ボタン全体をインタラクティブにする
        button.setInteractive(new Phaser.Geom.Rectangle(-itemWidth + padding, 0, itemWidth, itemHeight), Phaser.Geom.Rectangle.Contains);

        button.on('pointerover', () => itemBackground.setFillStyle(0x333333));
        button.on('pointerout', () => itemBackground.setFillStyle(0x000000));
        button.on('pointerdown', () => {
            if (text !== '持ち物' && text !== '設定' && !text.startsWith('問題')) {
                const gameState = loadGameState();
                this.scene.scene.start(gameState.current_scene);
            } else if (text.startsWith('問題')) {
                const problemNumber = parseInt(text.replace('問題', ''));
                const gameState = loadGameState();
                if (gameState.answer_scene && gameState.answer_scene[problemNumber - 1]) {
                    this.scene.scene.start(gameState.answer_scene[problemNumber - 1]);
                }
            }
            // 持ち物と設定の処理はここに追加
        });

        container.add(button);
    }

    positionMenu() {
        const margin = this.relativeUnits.toPixels(5);
        const screenWidth = this.scene.cameras.main.width;
        const topEdge = margin;
        const rightEdge = screenWidth - margin;

        this.menuButton.setPosition(rightEdge - this.menuButton.width / 2, topEdge);
        this.menuBackground.setPosition(rightEdge, this.menuButton.height + topEdge + this.relativeUnits.toPixels(5));
        this.menuItems.setPosition(rightEdge, this.menuButton.height + topEdge + this.relativeUnits.toPixels(5));

        this.setPosition(0, 0);
    }
}
