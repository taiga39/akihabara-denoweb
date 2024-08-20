import { createRelativeUnits } from '../main';
import { loadGameState, saveGameState } from '../hooks/gameState';
import { BaseScene } from '../BaseScene';
import SpeechBubble from '../component/SpeechBubble';
import HamburgerMenu from '../component/HamburgerMenu';

export class KeyBoard extends BaseScene {
    constructor() {
        super('KeyBoard');
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        this.load.image('keyboard', 'assets/keyboard.png');
    }

    create() {
        const ru = createRelativeUnits(this);
        
        // 背景
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xeeeeee).setOrigin(0, 0);
        
        // 1. キーボード画像の表示
        const keyboardImage = this.add.image(this.scale.width / 2, this.scale.height * 0.3, 'keyboard');
        const scaleFactor = (this.scale.width * 0.8) / keyboardImage.width;
        keyboardImage.setScale(scaleFactor);
        keyboardImage.setDepth(1);

        // 2. 入力フォームの作成
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
        this.inputText.setDepth(2);

        // 3. 回答ボタン
        const answerButton =this.createHighQualityText(ru.toPixels(50), ru.toPixels(110), '回答する', {
            fontSize: ru.fontSize.medium,
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(6), y: ru.toPixels(4) }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2);

        answerButton.on('pointerdown', () => {
            const userInput = this.inputText.text.trim().toLowerCase();
            const correctAnswer = this.getYesterday();

            if (userInput === correctAnswer) {
                console.log('正解です！');
                this.startNextScene();
            } else {
                console.log('不正解です。正解は ' + correctAnswer + ' でした。');
            }

            console.log('入力されたテキスト:', userInput);
            console.log('正解の曜日:', correctAnswer);
        });

        // 吹き出し
        const bubbleWidth = ru.toPixels(60);
        const bubbleHeight = ru.toPixels(37);
        const bubbleX = this.scale.width - bubbleWidth - ru.toPixels(5);
        const bubbleY = this.scale.height - bubbleHeight - ru.toPixels(30);

        const speechBubble = new SpeechBubble(
            this,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            "こんにちは！これは吹き出しです。"
        );
        speechBubble.setDepth(2);

        // ハンバーガーメニューを作成
        const hamburgerMenu = new HamburgerMenu(this);
        hamburgerMenu.setDepth(3); 

        const backgroundZone = this.add.zone(0, 0, this.scale.width, this.scale.height);
        backgroundZone.setOrigin(0);
        backgroundZone.setInteractive();
        backgroundZone.on('pointerdown', () => {
            this.input.keyboard.clearCaptures();
            this.inputText.setBlur();
        });
        backgroundZone.setDepth(0);
    }

    getYesterday() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const daysOfWeek = ["にちようび", "げつようび", "かようび", "すいようび", "もくようび", "きんようび", "どようび"];
        return daysOfWeek[yesterday.getDay()];
    }

    startNextScene() {
        const gameState = loadGameState();
        gameState.current_scene = 'Mario';
        if (!gameState.answer_scene.includes('KeyBoard')) {
            gameState.answer_scene.push('KeyBoard');
        }
        saveGameState(gameState);
        this.scene.start('Mario');  // 適切なシーン名に変更
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }

}