import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
        this.initialX = 50; // マリオの初期X座標
        this.cameraLerpFactor = 0.05; // カメラの追従速度（より小さな値に調整）
        this.hasMovedRight = false; // 右に移動したかどうかを追跡
        this.leftMoveProgress = 0; // 左移動の進行度
    }


    create() {
        console.log('Create method started');
        
        // 背景のグラデーション生成
        this.createGradientBackground();
        
        // 地面を左右に広げる
        this.ground = this.add.rectangle(0, this.scale.height - 50, this.scale.width * 20, 100, 0x964B00);
        this.physics.add.existing(this.ground, true);
    
        // マリオ（四角形）- 左端に配置
        this.mario = this.add.rectangle(this.initialX, this.scale.height - 200, 50, 50, 0xFF0000);
        this.physics.add.existing(this.mario);
        this.mario.body.setCollideWorldBounds(false);
        this.mario.body.setGravityY(300);
    
        // 衝突設定
        this.physics.add.collider(this.mario, this.ground);
    
        // カメラの設定
        this.cameras.main.setBounds(-this.scale.width * 10, 0, this.scale.width * 20, this.scale.height);
        
        // 初期カメラ位置を設定
        this.cameras.main.scrollX = 0;
    
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

        this.background = this.add.tileSprite(-this.scale.width * 10, 0, this.scale.width * 20, height, 'skyGradient');
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

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    update() {
        // マリオの移動
        this.moveMario();

        // カメラの追従制御
        const distanceFromStart = this.mario.x - this.initialX;
        const halfScreenWidth = this.scale.width / 2;

        if (distanceFromStart >= 0) {
            // 右方向の移動
            if (!this.hasMovedRight) {
                // 初めて右に移動した場合、滑らかに中央に移動
                const targetX = Math.max(0, this.mario.x - halfScreenWidth);
                this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * this.cameraLerpFactor;
                
                if (this.mario.x >= halfScreenWidth) {
                    this.hasMovedRight = true;
                    this.cameras.main.startFollow(this.mario);
                }
            }
            this.leftMoveProgress = 0; // 左移動の進行度をリセット
        } else {
            // 左方向の移動
            this.hasMovedRight = false; // 左に移動したらフラグをリセット

            // 左移動の進行度を更新
            this.leftMoveProgress = Math.min(1, Math.abs(distanceFromStart) / halfScreenWidth);

            // イージング関数を適用してカメラの位置を計算
            const easeValue = this.easeOutCubic(this.leftMoveProgress);
            const targetX = -distanceFromStart * easeValue;
            
            this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * this.cameraLerpFactor;

            // 完全に左に移動したらカメラを追従
            if (this.leftMoveProgress === 1) {
                this.cameras.main.startFollow(this.mario);
            }
        }
    }
}