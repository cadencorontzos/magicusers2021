var canvas = document.getElementById("cvs");
var context = canvas.getContext('2d');
var raf;
var bulletsActive = [];
var enemiesAcitve = [];
var timeElapsed = 0;
var oldTime = 0;
var score = 0;
var playersActive = [];
var socket = io()

class Player {
    constructor() {
        this.x = .5;
        this.y = .666;
        this.height = .1;
        this.width = .1;
        this.vx = .025;
        this.vy = .025;
        this.facing = 'right';
        this.color = '#4169E1';
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    isFacing() {
        return this.facing;
    }

    move(direction) {
        if (direction === 'up') {
            this.y -= this.vy;
        } else if (direction === 'down') {
            this.y += this.vy;
        } else if (direction === 'left') {
            this.x -= this.vx;
            this.facing = 'left';
        } else {
            this.x += this.vx;
            this.facing = 'right';
        }
    }

    draw() {

        context.fillStyle = this.color;
        context.fillRect(this.x * canvas.width, this.y * canvas.height, this.width * canvas.width, this.height * canvas.height);

    }

}

var p1 = new Player;


var g1 = {
    color: '',
    angle: 0,
    length: 50,
    facing: 'right',
    draw: function() {
        context.lineWidth = 10;
        context.strokeStyle = this.color;
        newX = p1.getX() * canvas.width;
        newY = p1.getY() * canvas.height;
        endX = newX + this.length * Math.cos(this.angle);
        endY = newY - this.length * Math.sin(this.angle);
        context.beginPath();
        context.moveTo(newX, newY);
        context.lineTo(endX, endY);
        context.stroke();

    }
}


class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.height = .1;
        this.width = .1;
        this.speed = .001;
        if (x < .5) {
            this.moving = 'right';
        } else {
            this.moving = 'left';
        }
        this.color = '#B22222';
    }

    //getters
    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    //methods
    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x * canvas.width, this.y * canvas.height, this.width * canvas.width, this.height * canvas.height);
    }

    move() {
        if (this.moving === 'right') {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }

        if (this.x < 0) {
            this.moving = 'right';
        }

        if (this.x > 1) {
            this.moving = 'left';
        }
    }


}

class Bullet {
    constructor(x, y, facing) {
        this.x = x;
        this.y = y;
        this.facing = facing;
        this.velocity = .01;
        this.radius = 4;
    }

    //getters
    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setX(newX) {
        this.x = newX;
    }

    setY(newY) {
        this.y = newY;
    }

    move() {
        if (this.facing === 'right') {
            this.x += this.velocity;

        } else {
            this.x -= this.velocity;
        }
    }

    draw() {
        context.fillStyle = '#DAA520';
        context.beginPath()
        context.arc(this.x * canvas.width, this.y * canvas.height, this.radius, 0, 2 * Math.PI, true);
        context.fill();
    }

    // checks if bullet is touching enemy. If so, that enemy is deleted and true value is reuturned
    isTouchingEnemy() {



        enemiesAcitve.forEach((enemy, i) => {
            var X = this.x * canvas.width;
            var Y = this.y * canvas.height;
            var startX = enemy.getX() * canvas.width;
            var endX = startX + (enemy.getWidth() * canvas.width);
            var startY = enemy.getY() * canvas.height;
            var endY = startY + (enemy.getHeight() * canvas.height);

            if (X <= endX && X >= startX && Y <= endY && Y >= startY) {

                enemiesAcitve.splice(i, 1);
                score++;
                return true;


            }

        });
        return false;


    }

}



window.addEventListener('resize', onResize());
onResize();

document.addEventListener('keydown', function(e) {
    console.log(e.key);
    if (e.key === 'w' || e.key === 'W') { //up
        p1.move('up');
    }
    if (e.key === 'a' || e.key === 'A') { // left
        p1.move('left');
        g1.angle = Math.PI;


    }
    if (e.key === 's' || e.key === 'S') { // down
        p1.move('down')

    }
    if (e.key === 'd' || e.key === 'D') { // right
        p1.move('right');

        g1.angle = 0;
    }
    if (e.key === ' ') {

        const b1 = new Bullet(p1.getX(), p1.getY(), p1.isFacing());

        bulletsActive.push(b1);

    }
});

document.addEventListener('mousemove', function(e) {
    // code here

});


function draw() {




    context.clearRect(0, 0, canvas.width, canvas.height);
    p1.draw();
    g1.draw();

    var timeStamp = Date.now();
    timeElapsed += (timeStamp - oldTime);
    oldTime = timeStamp;

    if (timeElapsed > 3000) {
        var yloc = Math.random();
        var xloc = Math.random;
        if (yloc > .5) {
            xloc = .95;
        } else {
            xloc = -.05;
        }
        const enem = new Enemy(xloc, yloc);

        enemiesAcitve.push(enem);
        timeElapsed = 0;
    }
    var adjuster = 0;

    for (i = 0; i < bulletsActive.length; i++) {

        if (bulletsActive[i - adjuster].isTouchingEnemy()) {

            console.log(bulletsActive);
            bulletsActive.splice(i - adjuster, 1);
            console.log(bulletsActive);
            adjuster++;
        }

    }

    bulletsActive.forEach(bullet => {

        bullet.move();
        bullet.draw();

    });

    enemiesAcitve.forEach(enemy => {
        enemy.draw();
        enemy.move();
    });

    context.fillStyle = 'white';
    context.font = '48px serif';
    context.fillText(score, .5 * canvas.width, .2 * canvas.height);

    raf = window.requestAnimationFrame(draw);
}



canvas.addEventListener('mouseover', function(e) {
    raf = window.requestAnimationFrame(draw);
});

function onResize() {
    console.log('resized');

    canvas.width = 600;
    canvas.height = 600;


    draw();
}