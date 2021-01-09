var canvas = document.getElementById("cvs");
var context = canvas.getContext('2d');
var raf;
var bulletsActive = [];
var enemiesAcitve = [];

var p1 = {
    x: .5,
    y: .666,
    height: .1,
    width: .1,
    color: 'blue',
    vx: .05,
    vy: .05,
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

//This is a push. I am pushing. Try pulling. 

//class Enemy {
//    constructor {
//       this. x = 1;
//  }

//   collision
//}

class Bullet {
    constructor(x, y, facing) {
        this.x = x;
        this.y = y;
        this.facing = facing;
        this.velocity = .01;
        this.radius = 10;
    }

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
        if (this.facing = 'right') {
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
        console.log(' here ');
        const b1 = new Bullet(p1.x, p1.y, p1.facing);

        bulletsActive.push(b1);

    }
});

document.addEventListener('mousemove', function(e) {
    // code here

});


function draw() {
    var timeStamp = Date.now();
    context.clearRect(0, 0, canvas.width, canvas.height);
    p1.draw();
    g1.draw();
    bulletsActive.forEach(bullet => {
        bullet.move();
        bullet.draw();

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