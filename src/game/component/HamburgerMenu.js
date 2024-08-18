import Phaser from 'phaser';
import { createRelativeUnits } from '../main';
import { loadGameState, saveGameState } from '../hooks/gameState';

export default class HamburgerMenu extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        this.relativeUnits = createRelativeUnits(scene);
        this.createMenu();
        this.positionMenu();
        scene.add.existing(this);
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
        this.addMenuItem(menuItems, gameState.current_scene, 0, itemWidth, itemHeight, padding);

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
            color: '#ffffff'
        }).setOrigin(1, 0.5);
    
        const button = this.scene.add.container(0, (itemHeight + padding) * index + padding, [itemBackground, textObject]);
        button.setSize(itemWidth - padding * 2, itemHeight);
        
        textObject.setPosition(-padding, itemHeight / 2);
        
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, itemWidth - padding * 2, itemHeight), Phaser.Geom.Rectangle.Contains);
        
        button.on('pointerover', () => itemBackground.setFillStyle(0x333333));
        button.on('pointerout', () => itemBackground.setFillStyle(0x000000));
        button.on('pointerdown', () => {
            console.log(`Selected: ${text}`);
            if (text !== '持ち物' && text !== '設定' && !text.startsWith('問題')) {
                this.scene.scene.start(text);
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