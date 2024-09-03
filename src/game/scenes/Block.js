import { BaseScene } from '../BaseScene';

export class Block extends BaseScene {
    constructor() {
        super('Block');
    }

    init() {
        console.log('Block scene initialized');
        console.log('this:', this);
        console.log('this.add:', this.add);
        console.log('this.physics:', this.physics);
    }

    createScene() {
        console.log('Create method started');
        
        this.cameras.main.setBackgroundColor('#000000');
    
        this.score = 0;
        this.gameOver = false;
    
        // スコア表示
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    
        // 移動ボタン
        this.createMoveButtons();
        this.buttonY = this.scale.height - 80;

        // パドル
        this.paddle = this.add.rectangle(this.scale.width / 2, this.buttonY - 30, 100, 20, 0x00ff00);
        this.physics.add.existing(this.paddle, false);
        this.paddle.body.setImmovable(true);
        this.paddle.body.allowGravity = false;
    
        // ボール
        this.ball = this.add.circle(this.scale.width / 2, this.buttonY - 50, 10, 0xff0000);
        this.physics.add.existing(this.ball);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setBounce(1);
        this.ball.body.setVelocity(-75, -300);
    
        // ブロック
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();
    
        // 衝突設定
        this.physics.add.collider(this.ball, this.paddle);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }

    createBricks() {
        const brickWidth = 50;
        const brickHeight = 20;
        const columns = Math.floor(this.scale.width / brickWidth);
        const rows = 5;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const brick = this.add.rectangle(
                    j * brickWidth + brickWidth / 2,
                    i * brickHeight + 50,
                    brickWidth - 4,
                    brickHeight - 4,
                    0x0000ff
                );
                this.bricks.add(brick);
            }
        }
    }

    createMoveButtons() {
        const buttonStyle = {
            fontSize: '32px',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 },
            fixedWidth: 100,
            align: 'center'
        };
    
        const moveSpeed = 10;
    
        const leftButton = this.add.text(50, this.scale.height - 80, '←', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this.movePaddle(-moveSpeed))
            .on('pointerup', () => this.stopPaddle())
            .on('pointerout', () => this.stopPaddle());
    
        const rightButton = this.add.text(this.scale.width - 150, this.scale.height - 80, '→', buttonStyle)
            .setInteractive()
            .on('pointerdown', () => this.movePaddle(moveSpeed))
            .on('pointerup', () => this.stopPaddle())
            .on('pointerout', () => this.stopPaddle());
    }
    
    movePaddle(speed) {
        this.paddleSpeed = speed;
    }
    
    stopPaddle() {
        this.paddleSpeed = 0;
    }

    update() {
        if (this.gameOver) {
            return;
        }
    
        if (this.ball.y > this.buttonY - 10) {  // ボタンの少し上で判定
            this.resetBall();
        }
    
        // パドルの移動を更新
        if (this.paddleSpeed) {
            this.paddle.x += this.paddleSpeed;
            this.paddle.x = Phaser.Math.Clamp(this.paddle.x, 50, this.scale.width - 50);
            this.paddle.body.updateFromGameObject();
        }
    }

    hitBrick(ball, brick) {
        brick.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.bricks.countActive() === 0) {
            this.resetBricks();
        }
    }

    resetBall() {
        this.ball.setPosition(this.scale.width / 2, this.buttonY - 50);  // ボタンの少し上に配置
        this.ball.body.setVelocity(-75, -300);
        this.resetBricks();
    }

    resetBricks() {
        this.bricks.clear(true, true);
        this.createBricks();
    }
}