function min(arr, getter) {
	var min = getter(arr[0]);
	for (var i = 1; i < arr.length; i++) {
		var val = getter(arr[i]);
		if (val < min) min = val;
	}

	return min;
}

function max(arr, getter) {
	var max = getter(arr[0]);
	for (var i = 1; i < arr.length; i++) {
		var val = getter(arr[i]);
		if (val > max) max = val;
	}

	return max;
}

function graph(canvas, positions, getter, name, color) {
	var i, j, x, y, val;
	var padding = 30; // отсутпы от края канфаса
	var marksCount = 10; // количество выводимых отметок
	var precision = 100; // точность выводимых величин

	var count = positions.length;

	var maxValue = max(positions, getter);
	var minValue = min(positions, getter);
	var interval = maxValue - minValue;
	if (interval == 0) { maxValue = minValue + 10; interval = 10;}

	var width = canvas.width - padding * 2;
	var height = canvas.height - padding * 2;
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.font = "20px " + color;
	ctx.fillText(name, width / 2 + padding - ctx.measureText(name).width / 2, 20);
	ctx.font = "12px black";


	ctx.save();
	ctx.strokeStyle = 'black';
	ctx.globalAlpha = 0.2;

	ctx.beginPath();
	for (i = 0; i < 10; i++) {
		y = height + padding - (height / 9) * i;
		ctx.moveTo(padding, y);
		ctx.lineTo(width + padding, y);
	}
	ctx.stroke();

	ctx.restore();

	ctx.beginPath();
	ctx.strokeStyle = color;
	for (i = 0; i < count; i++) {
		val = getter(positions[i]);

		x = width / (count - 1) * i;
		x = padding + x;

		y = (height / interval) * (val - minValue);
		y = height + padding - y;

		if (i == 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}

		if (i % Math.floor(count / marksCount) == 0 || i == count - 1) {
			var str = (Math.round(val * precision) / precision).toString();
			var measure = ctx.measureText(str);

			ctx.arc(x, y, 1, 0, Math.PI * 2);

			ctx.strokeText(str, x - measure.width - 5, y - 3);
		}
		
	}
	ctx.stroke();
}