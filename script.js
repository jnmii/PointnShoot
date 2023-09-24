const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let explosions = [];






let score = 0;
let gameOver = false;
ctx.font = '50px Impact'

let timeToNextGhost = 0;
let ghostInterval = 500;
let lastTime = 0;



let ghosts = [];
class Ghost {
    constructor() {
        this.spriteWidth = 151.5;
        this.spriteHeight = 208;
        this.sizeMod = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeMod;
        this.height = this.spriteHeight * this.sizeMod;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 7 + 6;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDelete = false;
        this.image = new Image();
        this.image.src = '/ghosts.png'
        this.frame = 0;
        this.maxFrame = 7;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255),]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1]
            + ',' + this.randomColors[2] + ')';
    }
    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDelete = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0
            // console.log(deltaTime);
        }
        if (this.x < 0 - this.width) gameOver = true;
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
class Explosions {
    constructor(x, y, size) {

        this.spriteWidth = 35.95;
        this.spriteHeight = 37;
        this.size = size;
        this.width = this.spriteWidth / 0.5;
        this.height = this.spriteHeight / 0.5;
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = "/collision.png";
        this.frame = 0;
        this.timer = 0;
        this.angle = Math.random() * 6.2;
        this.sound = new Audio();
        this.sound.src = "/hiss.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 150;
        this.markedForDelete = false;

    }
    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDelete = true;
        }

    }
    draw() {
        ctx.save();
        // ctx.translate(this.x, this.y);
        // ctx.rotate(this.angle);
        ctx.drawImage(
            this.image,
            this.spriteWidth * this.frame,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.size,
            this.size,
        );
        ctx.restore();
    }
}


function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 50, 80);
}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, Score: ' + score, canvas.width / 2, canvas.height / 2);
  
//     // Show the restart button
//   restartButton.style.display = 'block';
}

window.addEventListener('click', function (e) {
    // console.log(e.x, e.y);

    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    ghosts.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) {

            object.markedForDelete = true;
            score++;
            explosions.push(new Explosions(object.x, object.y, object.width))
            console.log(explosions);
        }
    })
});

// restartButton.addEventListener('click', (e) => {
//     // Reset game variables
//     score = 0;
//     gameOver = false;
//     ghosts = [];
//     explosions = [];
    
//     // Clear the canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    
//     // Start the game again
//     animate(0);
    
//     // Hide the restart button
//     restartButton.style.display = 'none';
//     console.log('button pressed')
//   });

  

function createAnimation(e) {
    console.log(explosions);
    let positionX = e.x - canvasPosition.left;
    let positionY = e.y - canvasPosition.top;
    explosions.push(new Explosions(positionX, positionY))
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextGhost += deltaTime;
    if (timeToNextGhost > ghostInterval) {
        ghosts.push(new Ghost());
        timeToNextGhost = 0;
        ghosts.sort(function (a, b) {
            return a.width - b.width;

        })
    };
    drawScore();
    [...ghosts, ...explosions].forEach(object => object.update(deltaTime));
    [...ghosts, ...explosions].forEach(object => object.draw());
    ghosts = ghosts.filter(object => !object.markedForDelete);
    explosions = explosions.filter(object => !object.markedForDelete);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}
animate(0);