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

    players = p;

});

socket.on('scoreUpdate', function(s) {

    score = s;
});

socket.on('upDatedBullets', function(b) {
    bulletsActive = [...b];
})

socket.on('enemiesUpdated', function(e) {
    enemiesAcitve = [...e];
});

socket.on('lost', function() {

    window.alert('You lost. Your score was ' + score + '. The page will now refresh')
    window.location.reload();


})

socket.on('died', function(i) {
    if (i === socket.id) {
        window.alert('You died. Wait for the other players to die for the game to restart');
    }

})

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


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    draw();
}