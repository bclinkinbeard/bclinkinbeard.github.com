{
	title: "Introducing Atomify - A New Standard of Modularity",
	date: "2014-3-21",
	dateLabel: "March 2014",
	description: "Introducing Atomify"
}

Everyone wants to write modular code, but sometimes it's tough. In the world of front end web development things like stylesheets, markup, and graphical assets are some of the most easily identifiable obstacles to writing truly modular code. Add to that monolithic libraries like jQuery, Angular, etc. and it can be tempting to throw your hands up and simply dump all the code for an application into a single place. Atomify makes overcoming these obstacles easy, and this post will begin to show you how.

## npm, Browserify, and the Unix philosophy

Spend a bit of time in the npm and Browserify communities and it won't be long before you hear mention of the [Unix philosophy](http://en.wikipedia.org/wiki/Unix_philosophy). At its core, this philosophy boils down to a recommendation to build big things out of lots of small things, where each small thing does one thing well and exposes an API to allow for integrating it into larger systems.

In a way, you can almost view the CommonJS module format itself, and therefore npm, Node, and Browserify, as an embodiment of the Unix philosophy themselves. Most CommonJS modules expose a single function, or at most a handful of properties or functions. In my experience it is pretty rare to encounter a module containing more than a few hundred lines of code, and most of them are under a hundred.

What this means is that the ecosystem for modular JavaScript is well established and mature. As mentioned previously, however, the same cannot be said for the other elements of client side web development. **Atomify changes that.**

## What is Atomify?

We'll look at each piece in detail below, but at a high level you could say that Atomify is made up of 4 main components.

* atomify-js provides a JS workflow based on Browserify, with some additional features for bundling your templates and the assets they reference
* [atomify-css](#css) provides a CSS workflow based on Rework (or a LESS or SASS workflow if you choose), again with added conveniences for bundling assets used by your stylesheets
* A dev server that offers live bundling similar to beefy, but with all the Atomify goodness to enable fast iteration
* CLI to enable easy integration into existing build processes and declarative configuration from within package.json

These divisions are clearly reflected in the architecture of the [atomify](https://www.npmjs.org/package/atomify) package itself. It is primarily a wrapper around the [atomify-js](https://www.npmjs.org/package/atomify-js) and [atomify-css](https://www.npmjs.org/package/atomify-css) packages. The dev server and CLI are provided directly, but only contain about 100 LOC between them. (atomify-js and atomify-css are each in the neighborhood of 100 LOC as well, so you could easily read through them to understand everything they do.)

### atomify-js

atomify-js is more or less just a wrapper around Browserify. (Noticing a pattern here?) It allows you to specify an entry file (or multiple entry files), an output file and/or a callback, and provides some [default transforms](https://github.com/Techwraith/atomify-js#default-transforms-and-template-support) out of the box. The transforms are primarily focused on supporting various templating languages, like Handlebars, EJS, Jade, etc.

In addition to the defaults, you can specify your own transforms, globalTransforms, and/or some assets configuration, which we'll cover in more detail below. The simplest usage of atomify-js looks like this.

```js
var js = require('atomify-js')
js('entry.js', 'bundle.js')
```
<a name="css"></a>
### atomify-css

atomify-css supports LESS and SASS, but the more compelling use case, in my opinion, is the CSS workflow which is based around Rework. If you're not familiar with Rework check out this [great introductory post](http://nicolasgallagher.com/custom-css-preprocessing/), but in a nutshell it is a tool for creating custom CSS preprocessors in the same vein as things like LESS and SASS. I've come to prefer Rework though, because it is entirely plugin driven. Want to add some feature the framework authors didn't provide? Write a plugin and `use()` it. Dead simple.

The simplest usage of atomify-css looks like this. Look familiar?

```css
var css = require('atomify-css')
css('entry.css', 'bundle.css')
```

### Modular CSS++

The first aspect of development I mentioned as being less than ideal for modularity was CSS. Modern preprocessor libraries like LESS and SASS have improved this to an extent, but they still don't provide much in the way of tools to divide style information across projects. Where they fall short is that, while you can use `@import` to combine style information from multiple files, by default you must use relative file paths in these statements.

With atomify, you can **use `@import` exactly the same way you use `require()`** in JavaScript with Node and Browserify. What this means is that you can create completely separate projects that house style information for just their piece of the puzzle, and then `@import` them into one or more projects elsewhere.

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

## What about assets?

Describe the assets config stuff...