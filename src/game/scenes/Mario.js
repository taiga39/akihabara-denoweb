import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
    }

    create() {
        console.log('Create method started');
        
        // 背景のグラデーション生成
        this.createGradientBackground();
        
        // 地面
        this.ground = this.add.rectangle(this.scale.width * 5, this.scale.height - 50, this.scale.width * 10, 100, 0x964B00);
        this.physics.add.existing(this.ground, true);
    
        // マリオ（四角形）
        this.mario = this.add.rectangle(100, this.scale.height - 200, 50, 50, 0xFF0000);
        this.physics.add.existing(this.mario);
        this.mario.body.setCollideWorldBounds(false);
        this.mario.body.setGravityY(300);
    
        // 衝突設定
        this.physics.add.collider(this.mario, this.ground);
    
        // カメラの設定
        this.cameras.main.startFollow(this.mario);
        this.cameras.main.setBounds(0, 0, this.scale.width * 10, this.scale.height);
    
        // 移動ボタン
        this.createMoveButtons();

        // 移動状態を保持する変数
        this.moveDirection = 0;
    }

    createGradientBackground() {
        const width = 1024;
        const height = this.scale.height;
        const texture = this.textures.createCanvas('skyGradient', width, height);
        const context = texture.getContext();

        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#E0F6FF');
        gradient.addColorStop(1, '#87CEEB');

        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        texture.refresh();

        this.background = this.add.tileSprite(0, 0, this.scale.width * 10, height, 'skyGradient');
        this.background.setOrigin(0, 0);
    }

    createMoveButtons() {
        const buttonStyle = {
            fontSize: '32px',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 },
            fixedWidth: 100,
            align: 'center'
        };
    
        const leftButton = this.add.text(50, this.scale.height - 80, '←', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.moveDirection = -1)
            .on('pointerup', () => this.moveDirection = 0)
            .on('pointerout', () => this.moveDirection = 0);
    
        const rightButton = this.add.text(160, this.scale.height - 80, '→', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.moveDirection = 1)
            .on('pointerup', () => this.moveDirection = 0)
            .on('pointerout', () => this.moveDirection = 0);
    
        const jumpButton = this.add.text(this.scale.width - 150, this.scale.height - 80, 'Jump', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.jumpMario());
    }
    
    moveMario() {
        const moveSpeed = 200;
        this.mario.body.setVelocityX(this.moveDirection * moveSpeed);
    }

    jumpMario() {
        if (this.mario.body.touching.down) {
            this.mario.body.setVelocityY(-250);
        }
    }

    update() {
        // マリオの移動
        this.moveMario();

        // 背景のスクロール
        this.background.tilePositionX = this.cameras.main.scrollX * 0.6;
    }
}