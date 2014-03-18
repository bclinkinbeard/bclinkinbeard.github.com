{
	title: "Creating a mock backend with AngularJS",
	date: "2014-1-28",
	dateLabel: "January 2014",
	description: "Using $httpBackend to create a mock backend for testing and development"
}

Having access to a mock backend while developing client side code can be useful for a myriad of reasons. Whether the real backend isn't ready yet, or it goes down frequently, or maybe you just want to validate that your frontend code is robust enough to handle all valid scenarios, being able to easily run your code against a configurable set of responses is invaluable.

AngularJS has some very nice tools for doing just this, but the documentation on _how to do it_ is, shall we say, less than optimal. This post outlines not only how to create such a system, but how to easily switch your application between using it and real server calls.

## Prerequisites

The code that makes all of this possible is in the `angular-mocks.js` file available with each release of AngularJS, so you'll need to make sure you are loading that file in some manner. Additionally, the facilities we are interested in are contained in a module named `ngMockE2E`, so we'll need to ensure it gets included in the list of modules we tell Angular to load.

```
function configureMocks () {
	function checkRequest (json) {
		return json === JSON.stringify(mocks.post_req);
	}

	$httpBackend.whenPOST(mocks.url, checkRequest).respond(mocks.post_res);
	$httpBackend.whenPOST(mocks.url, checkRequest).respond(function (method, url, data) {
		if (shitIsValid) return [500, {}, {}];

		return [200, mocks.post_res];
	});
}
```