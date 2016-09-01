"use strict";

function rk4(initialState, time, stepCount, acceleration) {

	function Derivative(dx, dv) {
		this.dx = typeof dx != 'undefined' ? dx : 0.0;
		this.dv = typeof dv != 'undefined' ? dv : 0.0;
	}

	function evaluate(initial, t, dt, derivative) {
		var state = {};
		state.x = initial.x + derivative.dx * dt;
		state.v = initial.v + derivative.dv * dt;

		var newDer = new Derivative();
		newDer.dx = state.v;
		newDer.dv = acceleration(state, t + dt);

		return newDer;
	}

	function integrate(state, t, dt) {
		var a = evaluate(state, t, 0.0, new Derivative());
		var b = evaluate(state, t, dt * 0.5, a);
		var c = evaluate(state, t, dt * 0.5, b);
		var d = evaluate(state, t, dt, c);

		var resDer = new Derivative();
		resDer.dx = 1.0/6.0 * (a.dx + 2.0 * b.dx + 2.0 * c.dx + d.dx);
		resDer.dv = 1.0/6.0 * (a.dv + 2.0 * b.dv + 2.0 * c.dv + d.dv);

		var newState = {
			x: state.x + resDer.dx * dt,
			v: state.v + resDer.dv * dt,
			
			// only for debugging and visualization
			a: a,
			b: b,
			c: c,
			d: d,
			resDer: resDer,
			acc: acceleration(state, t + dt),
		};

		//little hack to store acceleration for the first step
		state.acc = acceleration(state, t);

		return newState;
	}

	var positions = [initialState];
	var deltaTime = holeTime / stepCount;

	for (var step = 1; step <= stepCount; step++) {
		positions[step] = integrate(positions[step - 1], (holeTime / stepCount) * (step - 1), deltaTime);
	}

	return positions;
}