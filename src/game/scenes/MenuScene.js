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

        // 退会ボタン（位置を下に調整）
        const unsubscribeButton = this.add.text(width / 2, height * 0.95, '退会する', {
            fontSize: `${ru.fontSize.large}px`,
            color: '#ff0000'
        }).setOrigin(0.5).setPadding(4);

        unsubscribeButton.setInteractive();
        unsubscribeButton.on('pointerdown', () => {
            this.showUnsubscribeModal();
        });

        // デバッグボタンを追加
        this.addDebugButtons();
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

    addDebugButtons() {
        const debugScenes = [
            'Login', 'Faq','Stop', 'Pinch', 'CrossWord', 'Block',
            'Mario', 'KeyBoard', 'Kanda', 'Math'
        ];

        const buttonWidth = this.relativeUnits.toPixels(20);
        const buttonHeight = this.relativeUnits.toPixels(5);
        const padding = this.relativeUnits.toPixels(1);
        const startX = this.scale.width * 0.05;
        const startY = this.scale.height * 0.7;

        debugScenes.forEach((sceneName, index) => {
            const x = startX + (index % 3) * (buttonWidth + padding);
            const y = startY + Math.floor(index / 3) * (buttonHeight + padding);

            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x444444);
            const text = this.add.text(x, y, sceneName, {
                fontSize: `${this.relativeUnits.fontSize.small}px`,
                color: '#ffffff'
            }).setOrigin(0.5);

            button.setInteractive();
            button.on('pointerdown', () => {
                this.scene.start(sceneName);
            });
        });
    }

    showUnsubscribeModal() {
        const modalWidth = this.scale.width * 0.8;
        const modalHeight = this.scale.height * 0.3;
        const modalX = this.scale.width / 2 - modalWidth / 2;
        const modalY = this.scale.height / 2 - modalHeight / 2;
    
        // モーダルの背景（白に変更）
        const modalBg = this.add.rectangle(modalX, modalY, modalWidth, modalHeight, 0xFFFFFF, 1);
        modalBg.setOrigin(0, 0);
    
        // モーダルのメッセージ（テキスト色を黒に変更）
        const message = this.add.text(this.scale.width / 2, modalY + modalHeight / 2, 
            '退会するためには\n有料会員の契約を\n解約してください', {
            fontSize: `${this.relativeUnits.fontSize.medium}px`,
            color: '#000000',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5).setPadding(4);
    
        // 閉じるボタン（テキスト色を黒に変更）
        const closeButton = this.add.text(modalX + modalWidth - 10, modalY + 10, 'X', {
            fontSize: `${this.relativeUnits.fontSize.large}px`,
            color: '#000000'
        }).setOrigin(1, 0).setPadding(4);
    
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => {
            modalBg.destroy();
            message.destroy();
            closeButton.destroy();
        });
    }
}