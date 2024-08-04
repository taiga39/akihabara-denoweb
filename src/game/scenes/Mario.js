import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
        this.initialX = 50; // マリオの初期X座標
        this.cameraLerpFactor = 0.05; // カメラの追従速度
        this.hasMovedRight = false; // 右に移動したかどうかを追跡
        this.leftMoveProgress = 0; // 左移動の進行度
        this.moveLeft = false; // 左移動ボタンの状態
        this.moveRight = false; // 右移動ボタンの状態
        this.jumpPressed = false; // ジャンプボタンの状態
        this.jumpCooldown = 0;
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
        gradient.addColorStop(0, '#4a90e2');   // 青
        gradient.addColorStop(0.5, '#f0f0f0'); // 白（中間色）
        gradient.addColorStop(1, '#e74c3c');   // 赤
    
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
            .on('pointerdown', () => this.moveLeft = true)
            .on('pointerup', () => this.moveLeft = false)
            .on('pointerout', () => this.moveLeft = false);
    
        const rightButton = this.add.text(160, this.scale.height - 80, '→', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.moveRight = true)
            .on('pointerup', () => this.moveRight = false)
            .on('pointerout', () => this.moveRight = false);
    
        const jumpButton = this.add.text(this.scale.width - 150, this.scale.height - 80, 'Jump', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.jumpPressed = true)
            .on('pointerup', () => this.jumpPressed = false);
    }
    
    moveMario() {
        const moveSpeed = 200;
        if (this.moveLeft) {
            this.mario.body.setVelocityX(-moveSpeed);
        } else if (this.moveRight) {
            this.mario.body.setVelocityX(moveSpeed);
        } else {
            this.mario.body.setVelocityX(0);
        }
    }

    jumpMario() {
        if (this.mario.body.touching.down && this.jumpCooldown <= 0) {
            this.mario.body.setVelocityY(-250);
            this.jumpCooldown = 300; // 300ミリ秒のクールダウンを設定
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    update(time, delta) {
        // マリオの移動
        this.moveMario();

        // ジャンプの処理
        if (this.jumpPressed) {
            this.jumpMario();
        }

        // ジャンプのクールダウンを減少
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= delta;
        }

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

        if (this.moveLeft) {
            this.moveDirection = -1;
        } else if (this.moveRight) {
            this.moveDirection = 1;
        } else {
            this.moveDirection = 0;
        }
    }
}