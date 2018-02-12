"use strict";

var image = new Image(60, 45);
var points = [];
var POINT_SIZE = 10;
var scaleMode = 'manual'; // manual/auto

function start() {
	var canvas, ctx, 
		viewport = new Viewport($('#viewport-info')[0]),
		canvas = window.document.getElementsByTagName('canvas')[0],
		ctx = canvas.getContext('2d');

	/**
	 * Обновление размеров canvas и viewport при ресайзе родителя
	 */
	function measure() {
		canvas.width = canvas.parentElement.clientWidth;
		canvas.height = canvas.parentElement.clientHeight;

		viewport.setSize(canvas.width, canvas.height);
		forceDraw();
	};

	// функция, выполняющаяся на каждом фрейме
	function frame() {
		draw(ctx, viewport);
		// window.requestAnimationFrame(frame);
	}

	function forceDraw() {
		draw(ctx, viewport);
	}
	

	$('#resizable').resizable();
	$(canvas.parentElement).on("resize", measure);
	measure();

	$('#scaleModeManual').on('click', function() { scaleMode = 'manual'; forceDraw(); });
	$('#scaleModeAuto').on('click', function() { scaleMode = 'auto'; forceDraw(); });

	image.onload = function() {
		viewport.setPos(
			image.naturalWidth / 2,
 			-image.naturalHeight / 2
		)

		forceDraw();
	};

	image.src = 'https://mdn.mozillademos.org/files/5397/rhino.jpg';

	var dragStartX = 0,
		dragStartY = 0,
		dragStartVpX = 0,
		dragStartVpY = 0,
		isDragging = false;

	$(canvas).on('mousedown', function(event) {
		dragStartX = event.clientX;
		dragStartY = event.clientY;

		dragStartVpX = viewport.x;
		dragStartVpY = viewport.y;

		isDragging = true;
		$('html').css('cursor', 'pointer');
	});
	$(canvas).on('mouseup', function(event) {
		if (isDragging) {
			var deltaX = (dragStartX - event.clientX),
				deltaY = (dragStartY - event.clientY);

			if (Math.abs(deltaX + deltaY) < 5) {
				var newPoint = viewport.toReal(
					viewport.fromCanvas({x: event.offsetX, y: event.offsetY})
				);
				newPoint.color = randomColor();
				newPoint.size = POINT_SIZE / viewport.scale;
				points.push(newPoint);
			}
		}

		isDragging = false;
		$('html').css('cursor', 'default');

		forceDraw();
	});
	$(canvas).on('mousemove', function(event) {
		if (isDragging) {
			var deltaX = (dragStartX - event.clientX),
				deltaY = (dragStartY - event.clientY);
			
			viewport.setPos(
				dragStartVpX + deltaX / viewport.scale, 
				dragStartVpY - deltaY / viewport.scale
			);

			forceDraw();
		}
	});

	$(document.body).on('mousewheel DOMMouseScroll', function(ev) {
		var params = normalizeWheel(ev.originalEvent);
		if (params.spinY < 0) {
			// на себя
			viewport.scaleBy(1.05);
		} else {
			// от себя
			viewport.scaleBy(0.95);
		}

		forceDraw();
	});

	frame();
}


function Viewport(elem) {
	this.elem = elem;
	this.x = 0; // in real px
	this.y = 0; // in real px
	this.width = 0; // in screen px
	this.height = 0; // in screen px
	this.scale = 1;
}

Viewport.prototype.setPos = function(x, y) {
	this.x = x;
	this.y = y;

	this.updateInfo();
}
Viewport.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;

	this.updateInfo();
}

Viewport.prototype.scaleBy = function(multiplier) {
	this.scale *= multiplier;
	this.scale = Math.max(this.scale, 0.00001);
	this.scale = Math.min(this.scale, 10000);

	this.updateInfo();
};

/** Перевод из реальных координат в координаты вьюпорта */
Viewport.prototype.fromReal = function(realPoint) {
	return {
		x: (realPoint.x - this.x) * this.scale,
		y: (realPoint.y - this.y) * this.scale
	};
};
/** Перепод из координат вьюпорта в реальные */
Viewport.prototype.toReal = function(viewportPoint) {
	return {
		x: viewportPoint.x / this.scale + this.x,
		y: viewportPoint.y / this.scale + this.y
	};
};
/** Перепод из из реальных размеров в размеры масштаба вьюпорта */
Viewport.prototype.fromRealSize = function(realSize) {
	return {
		width: realSize.width * this.scale,
		height: realSize.height * this.scale
	};
}
/** Перевод из координат вьюпорта в координаты канваса */
Viewport.prototype.toCanvas = function(viewportPoint) {
	return {
		x: this.width / 2 + viewportPoint.x,
		y: this.height / 2 - viewportPoint.y
	};
};
/** Перевод из координат канваса в координаты вьюпорта */
Viewport.prototype.fromCanvas = function(canvasPoint) {
	return {
		x: canvasPoint.x - this.width / 2,
		y: -canvasPoint.y + this.height / 2
	}
};
Viewport.prototype.updateInfo = function() {
	if (this.elem != undefined && this.elem != null) {
		this.elem.innerText = 
			"x: " + this.x + "\n" +
			"y: " + this.y + "\n" + 
			"scale: " + this.scale + "\n";
	}
}

/**
 * Отрисовка всего
 * @param  {CanvasRenderingContext2D} ctx      контекст для рисования
 * @param  {Viewport}                 viewport вьюпорт
 * @return {void}
 */
function draw(ctx, viewport) {
	ctx.clearRect(0, 0, viewport.width, viewport.height);
	
	// рисуем бегемота
	var pos = viewport.toCanvas( viewport.fromReal({x: 0, y: 0}) ),
		size = viewport.fromRealSize( {width: image.naturalWidth, height: image.naturalHeight} );
	ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, pos.x, pos.y, size.width, size.height);

	// рисуем точки
	for (var i = 0; i < points.length; i++) {
		pos = viewport.toCanvas(viewport.fromReal(points[i]));
		ctx.save();

		ctx.fillStyle = points[i].color;
		ctx.strokeStyle = "yellow";
		ctx.beginPath();

		if (scaleMode == 'manual') {
			// здесь мы вручную применяем смещение и масштаб
			ctx.arc(pos.x, pos.y, points[i].size * viewport.scale, 0, Math.PI * 2);
		} else {
			// а тут мы перекладываем работу со мещением и масштабом на canvas
			ctx.translate(pos.x, pos.y);
			ctx.scale(viewport.scale, viewport.scale);

			ctx.arc(0, 0, points[i].size, 0, Math.PI * 2);
		}
		ctx.stroke();
		ctx.fill();

		ctx.restore();
	}

	drawViewportSize(ctx, viewport);
};

/**
 * Вывод обводки и размеров по краям вьюпорта
 * @param  {[type]} ctx      [description]
 * @param  {[type]} viewport [description]
 * @return {[type]}          [description]
 */
function drawViewportSize(ctx, viewport) {
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle = "red";
	ctx.moveTo(0, 0);
	ctx.lineTo(0, viewport.height);
	ctx.lineTo(viewport.width, viewport.height);
	ctx.lineTo(viewport.width, 0);
	ctx.closePath();
	ctx.stroke();

	ctx.font = "10pt arial";
	ctx.fillStyle = "red";

	ctx.fillText("0", 0, viewport.height / 2 + 4);
	ctx.fillText(viewport.width, viewport.width - ctx.measureText(viewport.width).width, viewport.height / 2 + 4);
	ctx.fillText(0, viewport.width / 2 - ctx.measureText(0).width / 2, 10)
	ctx.fillText(viewport.height, viewport.width / 2 - ctx.measureText(viewport.height).width / 2, viewport.height - 1)

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(viewport.width / 2 - 20, viewport.height / 2);
	ctx.lineTo(viewport.width / 2 + 20, viewport.height / 2);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(viewport.width / 2, viewport.height / 2 - 20);
	ctx.lineTo(viewport.width / 2, viewport.height / 2 + 20);
	ctx.stroke();

	ctx.restore();
}

function randomColor() {
    return '#' + (~~(Math.random() * 255)).toString(16) + (~~(Math.random() * 255)).toString(16) + (~~(Math.random() * 255)).toString(16);
}