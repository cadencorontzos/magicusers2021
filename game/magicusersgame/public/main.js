

var canvas = document.getElementById("cvs");
var context = canvas.getContext('2d');
var raf;
var bulletsActive = [];
var enemiesAcitve = [];
var timeElapsed = 0;
var oldTime = 0;
var score = 0;
var players = {};
var socket = io();

class Player {
    constructor(id) {
        this.x = .5;
        this.id = id;
        this.y = .666;
        this.height = .1;
        this.width = .1;
        this.vx = .025;
        this.vy = .025;
        this.facing = 'right';
        this.color = '#4169E1';
        this.g = {
            color: '',
            angle: 0,
            length: 50,
            facing: 'right',
            draw: function() {
                context.lineWidth = 10;
                context.strokeStyle = this.color;
                var newX = p1.getX() * canvas.width;
                var newY = p1.getY() * canvas.height;
                var endX = newX + this.length * Math.cos(this.angle);
                var endY = newY - this.length * Math.sin(this.angle);
                context.beginPath();
                context.moveTo(newX, newY);
                context.lineTo(endX, endY);
                context.stroke();

            }
        }
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

    g1(a) {
        this.g.angle = a;
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

function drawEnemy(e) {
    context.fillStyle = e.color;
    context.fillRect(e.x * canvas.width, e.y * canvas.height, e.width * canvas.width, e.height * canvas.height);
}

function moveEnemy(e) {
    if (e.moving === 'right') {
        e.x += e.speed;
    } else {
        e.x -= e.speed;
    }

    if (e.x < 0) {
        e.moving = 'right';
    }

    if (e.x > 1) {
        e.moving = 'left';
    }
}

function drawBullet(b) {
    context.fillStyle = '#DAA520';
    context.beginPath()
    context.arc(b.x * canvas.width, b.y * canvas.height, b.radius, 0, 2 * Math.PI, true);
    context.fill();
}

function moveBullet(b) {


    if (b.facing === 'right') {
        b.x += b.velocity;

    } else {
        b.x -= b.velocity;
    }
    socket.emit('bulletMoved', bulletsActive);

}

function drawPlayer(p) {

    context.fillStyle = p.color;
    context.fillRect(p.x * canvas.width, p.y * canvas.height, p.width * canvas.width, p.height * canvas.height);
    drawGun(p.g, p.x, p.y);
}

function drawGun(g, x, y) {
    context.lineWidth = 10;
    context.strokeStyle = g.color;
    var newX = x * canvas.width;
    var newY = y * canvas.height;
    var endX = newX + g.length * Math.cos(g.angle);
    var endY = newY - g.length * Math.sin(g.angle);
    context.beginPath();
    context.moveTo(newX, newY);
    context.lineTo(endX, endY);
    context.stroke();

}

window.addEventListener('resize', onResize());
onResize();

document.addEventListener('keydown', function(e) {
    socket.emit('keyPressed', e.key);
});

socket.emit('addplayer');

socket.on('playersUpdated', function(p) {
    players = p;
});

socket.on('updatedPositions', function(p) {
    console.log('positions were updated');
    players = p;

});

socket.on('scoreUpdate', function(s) {
    console.log(score);
    score = s;
});

socket.on('upDatedBullets', function(b) {
    bulletsActive = [...b];
})

socket.on('enemiesUpdated', function(e) {
    enemiesAcitve = [...e];
});

function draw() {




    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var player in players) {

        drawPlayer(players[player]);
    }

    enemiesAcitve.forEach(enemy => {
        drawEnemy(enemy);

    });


    bulletsActive.forEach(bullet => {

        drawBullet(bullet);

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


    canvas.width = 600;
    canvas.height = 600;


    draw();
}