import Phaser from 'phaser';
import { loadGameState } from '../hooks/gameState';
import { createRelativeUnits } from '../main';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const ru = createRelativeUnits(this);
        this.relativeUnits = ru;
        const gameState = loadGameState();
        const completedScenes = gameState.answer_scene || [];

        const width = this.scale.width;
        const height = this.scale.height;
        const itemWidth = ru.toPixels(40);
        const itemHeight = ru.toPixels(10);
        const padding = ru.toPixels(2);

        // 背景を黒に設定
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // メニュー項目を表示するコンテナ
        const menuItems = this.add.container(0, 0);

        // 現在の問題
        this.addMenuItem(menuItems, "現在の問題", 0, itemWidth, itemHeight, padding);

        // 完了したシーンをメニューに追加
        completedScenes.forEach((scene, index) => {
            this.addMenuItem(menuItems, `問題${index + 1}`, index + 1, itemWidth, itemHeight, padding);
        });

        // 持ち物
        this.addMenuItem(menuItems, '持ち物', completedScenes.length + 1, itemWidth, itemHeight, padding);

        // 設定
        this.addMenuItem(menuItems, '設定', completedScenes.length + 2, itemWidth, itemHeight, padding);

        // メニューの位置を調整
        menuItems.setPosition(width / 2, height / 4);

        // 戻るボタン
        const closeButton = this.add.text(width / 2, height * 0.9, '閉じる', {
            fontSize: `${ru.fontSize.large}px`,
            color: '#ffffff'
        }).setOrigin(0.5);

        closeButton.setInteractive();
        closeButton.on('pointerdown', () => {
            this.scene.start('MainScene');  // メインシーンに戻る
        });
    }

    addMenuItem(container, text, index, itemWidth, itemHeight, padding) {
        const itemBackground = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x333333);
        itemBackground.setOrigin(0.5, 0.5);

        const textObject = this.add.text(0, 0, text, {
            fontSize: `${this.relativeUnits.fontSize.medium}px`,
            color: '#ffffff',
            wordWrap: { width: itemWidth - padding * 2, useAdvancedWrap: true }
        }).setOrigin(0.5, 0.4).setPadding(4);

        const button = this.add.container(0, (itemHeight + padding) * index);
        button.setSize(itemWidth, itemHeight);
        button.add([itemBackground, textObject]);

        // ボタンをインタラクティブにする
        button.setInteractive();
        button.on('pointerdown', () => {
            if (text !== '持ち物' && text !== '設定' && !text.startsWith('問題')) {
                const gameState = loadGameState();
                this.scene.start(gameState.current_scene);
            } else if (text.startsWith('問題')) {
                const problemNumber = parseInt(text.replace('問題', ''));
                const gameState = loadGameState();
                if (gameState.answer_scene && gameState.answer_scene[problemNumber - 1]) {
                    this.scene.start(gameState.answer_scene[problemNumber - 1]);
                }
            } else if (text === '持ち物') {
                localStorage.removeItem('gameState');
            }
        });

        container.add(button);
    }
}
