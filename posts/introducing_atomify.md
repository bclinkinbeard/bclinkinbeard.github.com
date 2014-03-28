{
	title: "Introducing Atomify - A New Standard of Modularity",
	date: "2014-3-21",
	dateLabel: "March 2014",
	description: "Introducing Atomify"
}

Everyone wants to write modular code, but it's not always easy. In the world of front end web development things like stylesheets, markup, and assets are some of the most easily identifiable obstacles to writing truly modular code. Add to that monolithic libraries like jQuery, Angular, etc. and it can be tempting to throw your hands up and simply dump all the code for an application into a single place. Atomify makes overcoming these obstacles easy, and this post will begin to show you how.

## npm, Browserify, and the Unix philosophy

Spend a bit of time in the npm and Browserify communities and it won't be long before you hear mention of the [Unix philosophy](http://en.wikipedia.org/wiki/Unix_philosophy). At its core, this philosophy boils down to a recommendation to build big things out of lots of small things, where each small thing does one thing well and exposes an API to allow for integrating it into larger systems.

In a way, you can almost view the CommonJS module format itself, and therefore npm, Node, and Browserify, as an embodiment of the Unix philosophy themselves. Most CommonJS modules expose a single function, or at most a handful of properties or functions. In my experience it is pretty rare to encounter a module containing more than a few hundred lines of code, and most of them are under a hundred.

What this means is that the ecosystem for modular JavaScript is well established and mature. As mentioned previously, however, the same cannot be said for the other elements of client side web development. **Atomify changes that.**

## What is Atomify?

We'll look at each piece in detail below, but at a high level you could say that Atomify is made up of 4 main components.

* [atomify-js](#js) provides a JS workflow based on Browserify, with some additional features for bundling your templates and the assets they reference
* [atomify-css](#css) provides a CSS workflow based on Rework (or a LESS or SASS workflow if you choose), again with added conveniences for bundling assets used by your stylesheets
* CLI to enable easy integration into existing build processes and declarative configuration from within package.json
* A dev server that offers live bundling similar to beefy, but with all the Atomify goodness to enable fast iteration

These divisions are clearly reflected in the architecture of the [atomify](https://www.npmjs.org/package/atomify) package itself. It is primarily a wrapper around and a common point of access to the [atomify-js](https://www.npmjs.org/package/atomify-js) and [atomify-css](https://www.npmjs.org/package/atomify-css) packages. The dev server and CLI are provided directly, but only contain about 100 LOC between them. (atomify-js and atomify-css are each in the neighborhood of 100 LOC as well, so you could easily read through them to understand everything they do.)<a name="js"></a>

### atomify-js

atomify-js is more or less just a wrapper around Browserify. It allows you to specify an entry file (or multiple entry files), an output file or a callback, and provides some [default transforms](https://github.com/Techwraith/atomify-js#default-transforms-and-template-support) out of the box. The transforms are primarily focused on supporting various templating languages, like Handlebars, EJS, Jade, etc.

In addition to the defaults, you can specify your own transforms, globalTransforms, and/or some assets configuration, which we'll cover in more detail below. Here we see the simplest usage of atomify-js, and then a more involved example.

```js
var js = require('atomify').js // or require('atomify-js') directly
js('entry.js', 'bundle.js')
```

```js
var js = require('atomify').js // or require('atomify-js') directly
var config = {
  js: {
    entry: 'entry.js',
    debug: true,
    watch: true,
    transforms: ['deamdify'],
    assets: {
      dest: 'dist/images',
      prefix: 'images/'
    }
  }
}
js(config.js, function (err, src) {
  // write src to a file or do something else with it
})
```

You'll notice the JS config is defined in a root `js` object. This is because when using `require('atomify')` directly, you can pass a config object with both a `js` and `css` property, and they will be passed to `atomify-js` and `atomify-css` respectively.

#### Bundling templates

Thanks to the transforms mentioned above, as well as [partialify](https://www.npmjs.org/package/partialify), bundling templates into your module is as simple as `require()`ing your .html, .hbs, .jade and/or .ejs files. The transforms will bundle and precompile them, both simplifying deployment and improving performance.<a name="css"></a>

### atomify-css

atomify-css supports LESS and SASS, but the more compelling use case, in my opinion, is the CSS workflow which is based around Rework. If you're not familiar with Rework check out this [great introductory post](http://nicolasgallagher.com/custom-css-preprocessing/), but in a nutshell it is a tool for creating custom CSS preprocessors in the same vein as things like LESS and SASS. I've come to prefer Rework, because it is entirely plugin driven, which means it is completely customizable. Want to add some feature the framework authors didn't provide? Write a plugin and `use()` it. Dead simple.

Here we see the simplest usage of atomify-css, and then a more involved example. Look familiar?

```js
var css = require('atomify').css // or require('atomify-css') directly
css('entry.css', 'bundle.css')
```

```js
var css = require('atomify').css // or require('atomify-css') directly
var config = {
  entry: 'entry.css',
  output: 'dist/bundle.css',
  plugins: ['rework-clone', 'rework-math'],
  assets: {
    dest: 'dist/images',
    prefix: 'images/'
  }
}
js(config.js, function (err, src) {
  // write src to a file or do something else with it
})
```

#### Modular styles FTW

The first aspect of development I mentioned as being less than ideal for modularity was CSS. Modern preprocessor libraries like LESS and SASS have improved this to an extent, but they still don't provide much in the way of tools to divide style information across projects. Where they fall short is that, while you can use `@import` to combine style information from multiple files, by default you must use relative file paths in these statements.

With atomify, you can **use `@import` exactly the same way you use `require()`** in JavaScript. What this means is that you can create completely separate projects that house style information for just their piece of the puzzle, and then `@import` them into one or more projects elsewhere.

When you `require()` a module by name in JavaScript, the value that is returned is determined by the `main` field of the package.json file for that module. With atomify-css, when you `@import` a module by name, the return value is determined by the `style` field of the module's package.json file. If no `style` field exists, atomify-css will look for `index.css` in the root of the package by default.

```css
/* node_modules/my-thing/index.css */
.some-thing {
  color: red;
}
```

and

```css
/* my-app/index.css */
@import "my-thing";

.other-styles {
  color: green;
}
```

becomes

```css
.some-thing {
  color: red;
}

.other-styles {
  color: green;
}
```

### What about assets?

Ah yes, the final piece of the puzzle. Pretty much every app is going to have images, fonts, etc. that are referenced from both their markup and their styles. Bundling those with your module can be cumbersome (if not impossible) due to things like name collisions, path translation and the like. **With Atomify it's dead simple.** Thanks to [rework-assets](https://www.npmjs.org/package/rework-assets) and [resrcify](https://www.npmjs.org/package/resrcify) (which was blatantly adapted from rework-assets code), asset paths are automatically detected in `url()` statements in CSS and in `img`, `audio`, and `video` tags in markup. Once detected, the asset is copied to a destination of your choosing and renamed using a hash based on its contents. The original paths are then updated to point to the hashed versions. Done and done.

## atomify CLI

atomify comes with a CLI that supports nearly everything the direct API does since the (optional) callback is the only aspect of configuration that is not simply defined as an object hash. Using [subarg](https://www.npmjs.org/package/subarg) syntax, you can make extensive use of the CLI either directly or as part of a larger build process. Some examples can be found in the [readme](https://github.com/techwraith/atomify#cli).

### package.json config

The CLI will also look for an atomify field in your package.json. If found, it will use those `js` and `css` options if they are not passed in from the command line.

## Development server

To enable quick and easy iteration, atomify also provides a basic http server for use during development. You can access it from code with the syntax `require('atomify').server` or configure it from the CLI with the `--server` flag. When the server sees a request for one of your entry files (or a configured alias) it will bundle your code on the fly and return the result. You can see all the options [here](https://github.com/Techwraith/atomify#development-server), but all the basics you'd expect like `port`, `path`, and `url` are supported. The server is built on top of [st](https://www.npmjs.org/package/st), so you can also pass an `st` option that will be passed directly to it if you need to configure st itself.
