const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
var players = {};
var numPlayers = 0;
bulletsActive = [];
enemiesAcitve = [];
app.use(express.static(__dirname + '/public'));
var oldTime = 0;
var timeElapsed = 0;
var score = 0;


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
            var X = this.x * 600;
            var Y = this.y * 600;
            var startX = enemy.getX() * 600;
            var endX = startX + (enemy.getWidth() * 600);
            var startY = enemy.getY() * 600;
            var endY = startY + (enemy.getHeight() * 600);

            if (X <= endX && X >= startX && Y <= endY && Y >= startY) {

                enemiesAcitve.splice(i, 1);
                score++;
                console.log('in istouch and score is :' + score);
                return true;


            }

        });
        return false;


    }

}




function onConnection(socket) {
    var playerGotAdded = false;
    var adjuster = 0;

    function generateEnemies() {


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
        socket.emit('enemiesUpdated', enemiesAcitve);


    }

    function moveEnemiesAndBullets() {
        enemiesAcitve.forEach(enemy => {
            enemy.move();
        });
        socket.emit('enemiesUpdated', enemiesAcitve);
        socket.emit('scoreUpdate', score);
        bulletsActive.forEach((b, i) => {
            b.move()
            if (b.x > 1 || b.x < 0) {
                bulletsActive.splice(i, 1);
            }

            if (b.isTouchingEnemy()) {
                console.log(score);
                socket.emit('scoreUpdate', score);
                bulletsActive.splice(i, 1);
            }

        });

        socket.emit('upDatedBullets', bulletsActive);
    }

    setInterval(moveEnemiesAndBullets, 30);
    setInterval(generateEnemies, 5000);

    // for (var i = 0; i < bulletsActive.length; i++) {

    //     if (bulletsActive[i - adjuster].isTouchingEnemy()) {

    //         console.log(bulletsActive);
    //         bulletsActive.splice(i - adjuster, 1);
    //         console.log(bulletsActive);
    //         adjuster++;
    //     }

    // }

    socket.on('addplayer', function() {
        const p1 = new Player(socket.id);
        players[socket.id] = p1;
        numPlayers++;
        socket.emit('playersUpdated', players);
        playerGotAdded = true;
    });


    socket.on('bulletMoved', function(b) {
        bulletsActive = [...b];

    });


    socket.on('keyPressed', function(key) {

        if (key === 'w' || key === 'W') { //up
            players[socket.id].move('up');
        }
        if (key === 'a' || key === 'A') { // left
            players[socket.id].move('left');
            players[socket.id].g1(Math.PI);


        }
        if (key === 's' || key === 'S') { // down
            players[socket.id].move('down');

        }
        if (key === 'd' || key === 'D') { // right
            players[socket.id].move('right');

            players[socket.id].g1(0);
        }
        if (key === ' ') {

            const b1 = new Bullet(players[socket.id].getX(), players[socket.id].getY(), players[socket.id].isFacing());

            bulletsActive.push(b1);

            io.emit('upDatedBullets', bulletsActive);



        }

        io.emit('updatedPositions', players);
    });
    socket.on('disconnect', function() {
        if (playerGotAdded) {
            delete players[socket.id];
        }
        socket.emit('playersUpdated', players);
    });
}


io.on('connection', onConnection);


http.listen(port, () => console.log('listening on port ' + port));