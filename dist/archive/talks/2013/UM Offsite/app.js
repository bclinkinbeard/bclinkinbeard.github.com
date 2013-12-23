'use strict';

var angular = require('angular');

angular.module('app', [
		require('./common/filters').name,
		require('./modules/charts').name
	])
	.config(require('./common/routes'));
