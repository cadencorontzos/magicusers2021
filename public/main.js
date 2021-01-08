'use strict';
var imageSelected = false;
var image;
var myFile;
var loadFile = function(event) {
    image = document.getElementById('output');
    imageSelected = true;
    image.src = URL.createObjectURL(event.target.files[0]);
    myFile = event.target.files[0];

};

(function() {



    var socket = io();
    var canvas = document.getElementById('whiteboard');
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');


    var current = {
        color: 'black'
    };
    var drawing = false;




    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);

    window.addEventListener('resize', onResize, false);
    onResize();

    socket.on('otherMouse', function(theirImage) {

        var imgg = new Image();

        imgg.src = theirImage;



        context.drawImage(imgg, 0, 0);



    });

    function drawLine(x0, y0, x1, y1, color, emit) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 200;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;

        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }

    function drawImage(x, y) {
        if (image) {
            context.drawImage(image, x, y, image.width, image.height);
        }
    }

    function onMouseDown(e) {
        drawing = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;

    }


    function onMouseUp(e) {
        if (!drawing) { return; }
        drawing = false;
        drawImage(current.x, current.y);
        //drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    }

    function onMouseMove(e) {
        if (imageSelected) {
            var i = document.querySelector('img');

            i.style.left = (e.clientX || e.touches[0].clientX) + 10 + 'px';
            i.style.top = (e.clientY || e.touches[0].clientY) + 10 + 'px';
            var can = canvas.toDataURL();

            socket.emit('otherMouse', can);

        }
        if (!drawing) { return; }
        drawImage(current.x, current.y);
        //drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onColorUpdate(e) {
        current.color = e.target.className.split(' ')[1];
    }

    // limit the number of events per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }

    function onDrawingEvent(data) {
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // make the canvas fill its parent
    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

})();