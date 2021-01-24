const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
var players = {};
bulletsActive = [];
enemiesAcitve = [];
app.use(express.static(__dirname + '/public'));
var oldTime = 0;
var timeElapsed = 0;
var score = 0;
var colors = ['blue', 'pink', 'orange', 'yellow', 'violet', 'purple', 'chartruse', 'purple', 'coral', 'hotpink', 'khaki', 'aqua']

//player class
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
        this.color = colors[Math.floor(Math.random() * colors.length)];
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

    isTouchingEnemy(e) {

        var Ex = e.getX();
        var Ey = e.getY();
        var size = .1;

        var trc = { x: Ex + size, y: Ey };
        var tlc = { x: Ex, y: Ey };
        var blc = { x: Ex, y: Ey + size };
        var brc = { x: Ex + size, y: Ey + size };

        var corners = [trc, tlc, blc, brc];




        return corners.find(corner => isInside(this, corner));

    }



}





// enemy class
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


    // checks if bullet is touching enemy. If so, that enemy is deleted and true value is reuturned
    isTouchingEnemy() {



        enemiesAcitve.forEach((enemy, i) => {
            var X = this.x;
            var Y = this.y;
            var startX = enemy.getX();
            var endX = startX + (enemy.getWidth());
            var startY = enemy.getY();
            var endY = startY + (enemy.getHeight());

            if (X <= endX && X >= startX && Y <= endY && Y >= startY) {

                enemiesAcitve.splice(i, 1);
                score++;

                return true;


            }

        });
        return false;


    }

}

function size_dict(d) { c = 0; for (i in d) ++c; return c }

// checks if a corner of the enemy is touching the player
function isInside(p, corner) {
    var X = corner.x;
    var Y = corner.y;
    var startX = p.getX();
    var endX = startX + (p.getWidth());
    var startY = p.getY();
    var endY = startY + (p.getHeight());



    if (X <= endX && X >= startX && Y <= endY && Y >= startY) {

        return true;

    }
    return false;
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
            for (var player in players) {

                if (players[player].isTouchingEnemy(enemy)) {
                    delete players[player];


                    socket.emit('playersUpdated', players);
                    socket.emit('died', socket.id);
                }
            }
        });

        if (size_dict(players) === 0 && playerGotAdded) {
            playerGotAdded = false;
            enemiesAcitve = [];
            socket.emit('enemiesUpdated', enemiesAcitve);
            clearInterval(mover);
            clearInterval(generator);
            socket.emit('lost');
            score = 0;
            bulletsActive = [];

        }

        socket.emit('enemiesUpdated', enemiesAcitve);
        socket.emit('scoreUpdate', score);
        bulletsActive.forEach((b, i) => {
            b.move()
            if (b.x > 1 || b.x < 0) {
                bulletsActive.splice(i, 1);
            }

            if (b.isTouchingEnemy()) {

                socket.emit('scoreUpdate', score);
                bulletsActive.splice(i, 1);
            }

        });



        socket.emit('upDatedBullets', bulletsActive);
    }

    // move and generate enemeies
    var mover = setInterval(moveEnemiesAndBullets, 30);
    var generator = setInterval(generateEnemies, 6000);

    //socket functions
    socket.on('addplayer', function() {
        const p1 = new Player(socket.id);
        players[socket.id] = p1;
        socket.emit('playersUpdated', players);
        playerGotAdded = true;
    });


    socket.on('bulletMoved', function(b) {
        bulletsActive = [...b];

    });


    socket.on('keyPressed', function(key) {
        if (!players[socket.id]) {
            return;
        }
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

            playerGotAdded = false;
        }
        socket.emit('playersUpdated', players);


    });
}


io.on('connection', onConnection);


http.listen(port, () => console.log('listening on port ' + port));