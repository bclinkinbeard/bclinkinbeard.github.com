'use strict';

module.exports = require('angular')
	.module('app.charts', [
		require('./pie').name,
		require('./timeline').name,
		require('./treemap').name,
		require('./scatterplot').name
	])
	.controller('ChartController', require('./ChartController'));
