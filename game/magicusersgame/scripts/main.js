var canvas = document.getElementById("cvs");
var context = canvas.getContext('2d');
var raf;
var bulletsActive = [];
var enemiesAcitve = [];
var timeElapsed = 0;
var oldTime = 0;
var score = 0;



var p1 = {
    x: .5,
    y: .666,
    height: .1,
    width: .1,
    color: 'blue',
    vx: .025,
    vy: .025,
    draw: function() {

        context.fillStyle = this.color;
        context.fillRect(this.x * canvas.width, this.y * canvas.height, this.width * canvas.width, this.height * canvas.height);
    }
};

var g1 = {
    color: 'red',
    angle: 0,
    length: 50,
    facing: 'right',
    draw: function() {
        context.lineWidth = 10;
        context.strokeStyle = this.color;
        newX = p1.x * canvas.width;
        newY = p1.y * canvas.height;
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
        this.color = 'orange';
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
        this.radius = 7;
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
        context.fillStyle = 'black';
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



    }

}


window.addEventListener('resize', onResize());
onResize();

document.addEventListener('keydown', function(e) {
    console.log(e.key);
    if (e.key === 'w') { //up
        p1.y -= p1.vy;
    }
    if (e.key === 'a') { // left
        p1.x -= p1.vx;
        g1.angle = Math.PI;
        p1.facing = 'left';

    }
    if (e.key === 's') { // down
        p1.y += p1.vy;

    }
    if (e.key === 'd') { // right
        p1.x += p1.vx;
        p1.facing = 'right';
        g1.angle = 0;
    }
    if (e.key === ' ') {

        const b1 = new Bullet(p1.x, p1.y, p1.facing);

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

    var adjuster = 0;

    context.font = '48px serif';

    context.fillText(score, .5 * canvas.width, .2 * canvas.height);

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
        var enem;
        var topOrBottom = Math.random();
        if (topOrBottom > .5) {
            enem = new Enemy(xloc, yloc);
        } else {
            enem = new Enemy(yloc, xloc);
        }

        enemiesAcitve.push(enem);
        timeElapsed = 0;
    }

    bulletsActive.forEach((bullet, i) => {

        if (bulletsActive[i - adjuster].isTouchingEnemy()) {
            console.log(bulletsActive);
            bulletsActive.splice(i - adjuster);
            console.log(bulletsActive);
            adjuster++;
        }

    });

    console.log(enemiesAcitve);
    bulletsActive.forEach(bullet => {

        bullet.move();
        bullet.draw();

    });

    enemiesAcitve.forEach(enemy => {
        enemy.draw();
        enemy.move();
    });
    raf = window.requestAnimationFrame(draw);
}



canvas.addEventListener('mouseover', function(e) {
    raf = window.requestAnimationFrame(draw);
});

function onResize() {
    console.log('resized');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}