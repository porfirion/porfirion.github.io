"use strict";

var curDate = new BigDate(); // текущая дата, которая находится в центре экрана. Не зависит от масштаба
var stepSize = BigDate.YEAR; // текущая единица измерения в которой мы меряем шкалу. Сейчас реализовано только для года.
var scale = 1.0; // пикселей / текущую выбранную единицу измерения. Например 2 / 10 года - в двух пикселях десять лет = в одном пикселе 5 лет.
var radix = 0; // масштаб величины, который мы принимаем за основные деления - единицы, десятки, сотни, тысячи

// служебные переменные для перетаскивания
var isDragging = false;
var dragStartX = 0;
var dragStartDate = null;

// нашёл косяк на дате 21-12-0999 01:13:18 при очень крупном масштабе - пропадают риски справа
function draw(ctx) {

	var width = ctx.canvas.width;
	var height = ctx.canvas.height;
	ctx.clearRect(0, 0, width, height);

    // фугкция для отрисовки чёрточки
	var tick = function(x, color, text, size) {
		if (typeof size == 'undefined') { size = 5; }
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(x, height / 2 - size);
		ctx.lineTo(x, height / 2 + size);
		ctx.font = size + 'px';
		ctx.strokeText(text, x - ctx.measureText(text).width / 2 , height / 2 + size + 10);
		ctx.stroke();
	}

    // рисуем основную синюю линию
	ctx.beginPath();
	ctx.strokeStyle = 'blue';
	ctx.moveTo(0, height / 2);
	ctx.lineTo(width, height / 2);
	ctx.stroke();

    // ставим центральную красную черту
	tick(width / 2, 'red', curDate.toString(), 40);

	// логарифм по однованию 10 - порядок величины выбранного отрезка в годах (0 - единицы, 1 - десятки, 2 - сотни, ...)
	// var pw = Math.floor(Math.log(curDate.get(stepSize)) / Math.log(10));
	var period = width / scale;
	var pw = Math.floor(Math.log(period) / Math.log(10));
	radix = Math.pow(10, pw);

    // находим ближайшие крупные ("опорные") даты справа и слева (с учётом единиц измерения и порядка величин)
    // Пример: если меряем года и порядок - десятки, то это будет начало и конец десятилетия.
    // Если меряем сотнями лет - то начало и конец столетия.
    // В дальнейшем будем отталкиваться от левой даты, как от точки отсчёта.
	var nearestLeft = Math.floor(curDate.get(stepSize) / radix) * radix;
	var nearestRight = Math.ceil(curDate.get(stepSize) / radix) * radix;

	// console.log('scale: ' + scale, 'pw: ' + pw, 'left: ' + nearestLeft, 'right: ' + nearestRight);

    // находим координаты по Х для этих дат
    // отнимаем/добавляем к середине разницу по врмени
	var nearestLeftX = width / 2 - (curDate.getPlus(stepSize) - nearestLeft) * scale;
	var nearestRightX = width / 2 + (nearestRight - curDate.getPlus(stepSize)) * scale;

    // отмечаем левую и правую "опорные" даты
	tick(nearestLeftX, 'pink', 'left: ' + nearestLeft, 30);
	tick(nearestRightX, 'pink', 'right: ' + nearestRight, 30);

    // отталкиваясь от левой "опорной" точки расставляем основные риски основной шкалы. Итерируем шагами по radix
	for (var i = -10; i < 10; i++) {
		tick(nearestLeftX + i * radix * scale, 'black', readableString(nearestLeft + i * radix), 10);
		// tick(nearestLeftX - i * radix * scale, 'black', nearestLeft - i * radix, 10);

		var label;
		var size = 5;

		for (var j = 1; j < 10; j++) {
			if (j % 5 == 0) {
				label = readableString(nearestLeft + i * radix + (j * radix / 10.0));
				size = 7
			} else if (radix * scale > width * 0.25) {
				label = readableString(nearestLeft + i * radix + (j * radix / 10.0));
				size = 5;
			} else {
				label = '';
				size = 3;
			}
			tick(nearestLeftX + (i * radix) * scale + (j * radix / 10.0) * scale, 'grey', label, size);
		}
	}

	$('#scale').html(Number(scale).toFixed(4));
	$('#radix').html(Number(radix).toFixed(2));
	$('#nearestLeft').html(Number(nearestLeft).toFixed(2));
	$('#nearestLeft').html(Number(nearestLeft).toFixed(2));
	$('#nearestRight').html(Number(nearestRight).toFixed(2));

}

$(function() {
	var canvas = document.getElementById("canvas");
	canvas.width = canvas.clientWidth;

	var ctx = canvas.getContext("2d");

	$(window).on('resize', function() {
		canvas.width = canvas.clientWidth;
		draw(ctx);
	});
	
	draw(ctx);

	$(document.body).on('mousewheel DOMMouseScroll', function(ev) {
		var params = normalizeWheel(ev.originalEvent);
		if (params.spinY < 0) {
			// на себя
			scale *= 1.05;
			draw(ctx);
		} else {
			// от себя
			scale *= 0.95;
			scale = Math.max(scale, 0.0000000001);
			draw(ctx);
		}
	});

	$('#canvas').on('mousedown', function(event) {
		dragStartX = event.clientX;
		isDragging = true;
		dragStartDate = curDate;
		$('html').css('cursor', 'pointer');
	});
	$('#canvas').on('mouseup mouseout', function(event) {
		isDragging = false;
		$('html').css('cursor', 'default');
	});
	$('#canvas').on('mousemove', function(event) {
		if (isDragging) {
			var delta = (dragStartX - event.clientX) / scale;
			curDate = dragStartDate.add(delta);
			draw(ctx);
		}
		// console.log(arguments);
	});
});

function readableString(num) {
	if (Math.abs(num) < 100000) return num;

	var counter = 0;
	while (Math.floor(Math.abs(num / 1000)) > 0) {
		counter++;
		num = num / 1000;
	}

	var dimensions = ['k', 'mil', 'bil', 'tril'];
	if (counter > 0) {
		return num + ' ' + dimensions[counter - 1];
	} else {
		return num;
	}
}

