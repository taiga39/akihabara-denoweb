import { createRelativeUnits } from '../main';
import { loadGameState, saveGameState } from '../hooks/gameState';
import { BaseScene } from '../BaseScene';
import SpeechBubble from '../component/SpeechBubble';
import HamburgerMenu from '../component/HamburgerMenu';

export class Kanda extends BaseScene {
    constructor() {
        super('Kanda');
        this.dpr = window.devicePixelRatio || 1;
        this.isZoomed = false;
        this.initialScale = null;
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        
        this.load.image('kanda', 'assets/kanda.png');
        this.load.image('kanda1', 'assets/kanda1.png');
    }

    create() {
        const ru = createRelativeUnits(this);
        
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xeeeeee).setOrigin(0, 0);
        
        // Add Forkeyboard image
        const forkeyboardImage = this.forkeyboardImage = this.add.image(this.scale.width / 2, this.scale.height * 0.3, 'kanda');
        this.optimizeImageDisplay(this.forkeyboardImage, 1, 0.5);
        this.forkeyboardImage.setDepth(20);

        // 初期スケールを保存
        this.initialScale = this.forkeyboardImage.scale;

        // Add main keyboard image (draggable)
        const keyboardImage = this.add.image(this.scale.width / 2, this.scale.height * 0.62, 'kanda1');
        this.optimizeImageDisplay(keyboardImage, 0.9, 0.35);
        keyboardImage.setDepth(20);

        // Input form
        this.inputText = this.add.rexInputText(ru.toPixels(50), ru.toPixels(130), ru.toPixels(80), ru.toPixels(15), {
            type: 'text',
            text: '',
            placeholder: '場所を漢字で回答してください',
            fontSize: `${ru.toPixels(0.3)}rem`,
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderThickness: 2
        });
        this.inputText.setDepth(3);

        // Answer button
        const answerButton = this.createHighQualityText(ru.toPixels(50), ru.toPixels(150), '回答する', {
            fontSize: ru.fontSize.medium,
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(6), y: ru.toPixels(4) }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(3);

        this.plugins.get('rexdragplugin').add(answerButton, {
            enable: true,
            axis: 'both'
        });

        answerButton.on('pointerdown', () => this.handleAnswer());
    }

    optimizeImageDisplay(image, maxWidthRatio, maxHeightRatio) {
        const logicalWidth = this.scale.width;
        const logicalHeight = this.scale.height;
        const maxWidth = logicalWidth * maxWidthRatio;
        const maxHeight = logicalHeight * maxHeightRatio;

        let scaleFactor = Math.min(
            maxWidth / image.width,
            maxHeight / image.height
        );

        // DPRを考慮してスケールを調整（画像が小さすぎる場合は拡大を制限）
        scaleFactor = Math.min(scaleFactor, this.dpr);

        image.setScale(scaleFactor);

        // WebGLレンダラーの場合、可能であればスムージングを設定
        if (this.renderer.type === Phaser.WEBGL) {
            image.texture.setFilter(Phaser.Textures.LINEAR);
        }
    }

    handleAnswer() {
        const userInput = this.inputText.text.trim().toLowerCase();

        if (userInput === "神田明神") {
            console.log('正解です！');
            // this.startNextScene();
        } else {
            console.log('不正解です。正解は ' + correctAnswer + ' でした。');
        }
    }

    startNextScene() {
        const gameState = loadGameState();
        gameState.current_scene = 'Mario';
        if (!gameState.answer_scene.includes('Kanda')) {
            gameState.answer_scene.push('Kanda');
        }
        saveGameState(gameState);
        this.scene.start('Mario');
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }
}