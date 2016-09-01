"use strict";
var holeTime = 6.0;
var totalStepCount = 100;
var resultPositions = null;
var firstState = {x: 0.0,v: 10.0};
var acceleratorString = null;
var accelerator = null;

window.onpopstate = function(event) {
	console.log('onpopstate', event.state);
	restoreParams(event.state);
	execute();
};

window.onload = function() {
	if (window.location.hash != null && window.location.hash != "") {
		try {
			var params = JSON.parse(atob(window.location.hash.substr(1)));
			restoreParams(params);
		} catch(err) {

		}
	} 

	execute();

	$('#execute').on('click', function(event) { 
		execute();
		event.preventDefault();
		return false;
	});

	$('input[type="text"').on('keypress', function(ev) {
		if(ev.keyCode == 13) execute();
	});

	$('.modifierButton').on('click', function() { 
		for (var key in $(this).data()) {
			$('input[name="'+key+'"]').val($(this).data(key));	
		}
		execute(); 
	});
	$('.accButton').each(function() {
		// $(this).text($(this).data('fn'));
	});
};

function restoreParams(params) {
	$('input[name="steps"]').val(params.steps);
	$('input[name="time"]').val(params.time);
	$('input[name="x"]').val(params.x);
	$('input[name="v"]').val(params.v);
	$('input[name="acc"]').val(params.acc);
}

function parseParams() {
	totalStepCount = parseInt($('input[name="steps"]').val());
	holeTime = parseFloat($('input[name="time"]').val());
	firstState.x = parseFloat($('input[name="x"]').val());
	firstState.v = parseFloat($('input[name="v"]').val());
	acceleratorString = $('input[name="acc"]').val();
	var acceleratorFunctionString = "accelerator = function(state, t) {return " + acceleratorString + ";}";
	eval(acceleratorFunctionString);

	var params = {
		steps: totalStepCount,
		time: holeTime,
		x: firstState.x,
		v: firstState.v,
		acc: acceleratorString,
	};

	window.history.pushState(params, "RK4", "#" + btoa(JSON.stringify(params)));
}

function execute() {
	parseParams();
	resultPositions = rk4(firstState, holeTime, totalStepCount, accelerator);
	visualize(resultPositions);
	var lastStep = resultPositions[resultPositions.length - 1];
	$('.results').html('X: ' + lastStep.x + " V: " + lastStep.v);

	// console.log('Начальное состояние: ', firstState);
	// console.log('Общее время: ', holeTime + ' сек');
	// console.log('Количество шагов: ', totalStepCount);
	// console.log('Ускорение: ', acceleratorString, accelerator);
	// console.log('Конечное состояние: ', resultPositions[resultPositions.length - 1]);

}

function visualize(resultPositions) {
	graph($('#canvas1')[0], resultPositions, function(pos) { return pos.x; }, 'Position', 'red');
	graph($('#canvas2')[0], resultPositions, function(pos) { return pos.v; }, 'Velocity', 'green');
	graph($('#canvas3')[0], resultPositions, function(pos) { return 'acc' in pos ? pos.acc : 0; }, 'Acceleration', 'blue');
}
