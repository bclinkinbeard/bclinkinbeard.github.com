{
	title: "Mocking environment variables with Browserify",
	date: "2013-11-13",
	description: "Mocking environment dependencies with Browserify"
}

Developer veteran and TDD aficianado [Todd Anderson](http://custardbelly.com/) recently remarked on Twitter that one of the things that keeps him using RequireJS is the ability to simulate/mock environment variables. Being the CommonJS/Browserify ~~zealot~~ fan that I am, I decided to confirm that the same could be done using my toolset of choice.

## Accessing and mocking environment variables

The term "environment variables" could mean a multitude of things, but for our purposes here we mean it to refer to things like `window`, `navigator` and the like. In Browserify, since the intended environment is a browser, you can use the `global` keyword to refer to the window object. Since we want to be able to switch out the definitions for these objects, our code to reference these variables will be defined in a file called `env.js` and look like this:

```
exports.win = global;
exports.nav = global.navigator;
```

We can create another file (`test-env.js` or whatever) in which we define the mocks we'd like to have available in our tests:

```
exports.win = { some: 'fake window' };
exports.nav = { a: 'fake navigator' };
```

## Switching environments

Now that we have two options for these variables, let's see how to transparently switch between them. For this we will utilize [grunt-browserify](https://github.com/jmreidy/grunt-browserify/), though the same could obviously be done using Browserify's API directly.

```
module.exports = function(grunt) {

  grunt.initConfig({
    browserify: {
	    dev: {
		    src: ['entry.js'],
		    dest: 'dist/bundle.js',
		    options: {
			    alias: [
				    './env.js:env'
			    ]
		    }
	    },
	    test: {
		    src: ['entry.js'],
		    dest: 'dist/bundle.js',
		    options: {
			    alias: [
				    './test-env.js:env'
			    ]
		    }
	    }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');

  // Default task.
  grunt.registerTask('default', ['dev']);

  grunt.registerTask('dev', ['browserify:dev']);
  grunt.registerTask('test', ['browserify:test']);

};
```

Using the above `Gruntfile.js`, you can run `grunt dev` (or just `grunt`) to load the real environment variables, or you can run `grunt test` to generate a bundle that includes your mocks in their place.

## Putting it to use

You can now access whichever version is bundled via the `env` alias we specified in the configs.

```
var env = require('env');

(function () {
	console.log(env.win);
	console.log(env.nav);
})();
```

## Conclusion

Browserify is not a panacea, though it comes damn close IMO. One downside to this approach is that the use of aliases means you always have to bundle to run your code. While this shouldn't take more than a second or two, running unit tests directly usually takes a small fraction of a second. I've definitely been known to sweat details like a workflow taking a couple seconds longer than I think it should, but this time I feel it's a reasonable tradeoff. I will gladly trade an extra second or two when running tests for the immeasurable benefits of using CommonJS, npm, and Browserify on my client side JavaScript projects.
