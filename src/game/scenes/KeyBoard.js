import { createRelativeUnits } from '../main';
import { loadGameState, saveGameState } from '../hooks/gameState';
import { BaseScene } from '../BaseScene';
import SpeechBubble from '../component/SpeechBubble';

export class KeyBoard extends BaseScene {
    constructor() {
        super('KeyBoard');
        this.dpr = window.devicePixelRatio || 1;
        this.isZoomed = false;
        this.initialScale = null;
        this.isOverlapping = true;
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        this.load.plugin('rexdragplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragplugin.min.js', true);
        
        this.load.image('keyboard', 'assets/keyboard.png');
        this.load.image('forkeyboard', 'assets/forkeyboard.jpg');
    }

    createScene() {
        const ru = createRelativeUnits(this);
        
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xeeeeee).setOrigin(0, 0);
        
        // Add Forkeyboard image
        this.forkeyboardImage = this.add.image(this.scale.width / 2, this.scale.height * 0.3, 'forkeyboard');
        this.optimizeImageDisplay(this.forkeyboardImage, 0.4, 0.35);
        this.forkeyboardImage.setDepth(20);
    
        // 初期スケールを保存
        this.initialScale = this.forkeyboardImage.scale;
    
        // Add main keyboard image (draggable)
        this.keyboardImage = this.add.image(this.scale.width / 2, this.scale.height * 0.3, 'keyboard');
        this.optimizeImageDisplay(this.keyboardImage, 0.8, 0.35);
        this.keyboardImage.setDepth(20);
    
        // Input form
        this.inputText = this.add.rexInputText(ru.toPixels(50), ru.toPixels(90), ru.toPixels(80), ru.toPixels(15), {
            type: 'text',
            text: '',
            placeholder: 'ひらがなで回答してください',
            fontSize: `${ru.toPixels(0.3)}rem`,
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderThickness: 2
        });
        this.inputText.setDepth(3);
    
        // Answer button
        const answerButton = this.createHighQualityText(ru.toPixels(50), ru.toPixels(110), '回答する', {
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
    
        // Zoom button
        const zoomButton = this.createHighQualityText(ru.toPixels(52), ru.toPixels(106), 'Zoom', {
            fontSize: ru.fontSize.small,
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(6), y: ru.toPixels(4) }
        })
        .setOrigin(1, 0)
        .setInteractive()
        .setDepth(2);
    
        zoomButton.on('pointerdown', () => this.toggleZoom());
    
        // Setup draggable images
        this.setupDraggableImage(this.forkeyboardImage);
        this.setupDraggableImage(this.keyboardImage);
    }

    setupDraggableImage(image) {
        const dragPlugin = this.plugins.get('rexdragplugin');
        dragPlugin.add(image, {
            enable: true,
            axis: 'both'
        });

        // dragendイベントを使用
        image.on('dragend', () => {
            this.checkOverlap();
        });
    }

    checkOverlap() {
        const bounds1 = this.forkeyboardImage.getBounds();
        const bounds2 = this.keyboardImage.getBounds();

        const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);

        if (!isOverlapping && this.isOverlapping) {
            // 重なりがなくなった瞬間
            this.onImagesNoLongerOverlap();
        }

        this.isOverlapping = isOverlapping;
    }

    onImagesNoLongerOverlap() {
        alert('画像の重なりがなくなりました！');
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

    toggleZoom() {
        this.isZoomed = !this.isZoomed;
        const newScale = this.isZoomed ? this.initialScale * 5 : this.initialScale;
        
        this.tweens.add({
            targets: this.forkeyboardImage,
            scale: newScale,
            duration: 300,
            ease: 'Power2'
        });
    }

    handleAnswer() {
        const userInput = this.inputText.text.trim().toLowerCase();
        const correctAnswer = this.getYesterday();

        if (userInput === correctAnswer) {
            console.log('正解です！');
            this.startNextScene();
        } else {
            console.log('不正解です。正解は ' + correctAnswer + ' でした。');
        }
    }

    getYesterday() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const daysOfWeek = ["にちようび", "げつようび", "かようび", "すいようび", "もくようび", "きんようび", "どようび"];
        return daysOfWeek[yesterday.getDay()];
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }
}