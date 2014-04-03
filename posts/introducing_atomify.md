{
	title: "Introducing Atomify - A New Standard of Modularity",
	date: "2014-3-21",
	dateLabel: "March 2014",
	description: "Introducing Atomify"
}

Everyone wants to write modular code, but it's not always easy. In the world of front end web development things like stylesheets, markup, and assets are some of the most easily identifiable obstacles to writing truly modular code. Add to that monolithic libraries like jQuery, Angular, etc. and it can be tempting to throw your hands up and simply dump all the code for an application into a single place.

Atomify makes overcoming these obstacles easy, and this post will begin to show you how.

## npm, Browserify, and the Unix philosophy

Spend a bit of time in the npm and Browserify communities and it won't be long before you hear mention of the [Unix philosophy](http://en.wikipedia.org/wiki/Unix_philosophy). At its core, this philosophy boils down to a recommendation to build big things out of small things, where each small thing does one thing well and exposes an API to allow for integrating it into larger systems.

The CommonJS module format itself, and therefore npm, Node, and Browserify, are embodiments of the Unix philosophy themselves. Most CommonJS modules expose a single function, or at most a handful of properties or functions. In my experience it is pretty rare to encounter a module containing more than a few hundred lines of code, and most of them are under a hundred.

What this means is that the ecosystem for modular JavaScript is well established and mature. As mentioned previously, however, the same cannot be said for the other elements of client side web development.

**Atomify changes that.**

## What is Atomify?

Generally speaking, Atomify is made up of 4 main components. [atomify-js](https://www.npmjs.org/package/atomify-js) and [atomify-css](https://www.npmjs.org/package/atomify-css) do the heavy lifting in terms of bundling your code, and the [atomify](https://www.npmjs.org/package/atomify) package itself is primarily a wrapper around and common point of access to them. It does, however, provide a dev server and CLI directly. Despite its significant capabilities it is small and elegant. You could easily read through the entire codebase and understand everything it does in a matter of hours.

So what, exactly, _does_ it do?

 * Enables you to build properly [atomic front end components](http://techwraith.com/atomic-product-development.html)
 * Brings a [dependency graph to your CSS](http://techwraith.com/your-css-needs-a-dependency-graph-too.html), removing the need for impossibly long and disorganized stylesheets
 * Unifies the bundling of your code, templates and styles into one easily configurable tool
 * Makes full modularity the default, instead of a complicated pipe dream

What follows is a general introduction to Atomify and the benefits it offers. If you just want docs and code, check out the README files linked above and the [example projects](https://github.com/atomify/atomify-examples).

### atomify-js

atomify-js provides a JavaScript workflow based on Browserify, with additional features for bundling your templates and the assets they reference.

It provides a somewhat simpler API than working with Browserify directly, allowing you to specify an entry file (or multiple entry files), and an output file or a callback. In fact, for the simplest scenarios _that is the only thing you have to do_.

`require('atomify-js')('entry.js', 'bundle.js')`. Done.

atomify-js also provides some [default transforms](https://github.com/atomify/atomify-js#default-transforms-and-template-support). The transforms are primarily focused on supporting various templating languages, like Handlebars, EJS, Jade, and plain HTML files for use in frameworks like Angular. Thanks to these transforms you simply `require()` your templates like you would a JS or JSON file, and they are precompiled (where applicable) and bundled with your output.

You can also specify your own transforms and Browserify configuration if you want, but the last thing I want to mention here is the asset bundling. If desired and configured, atomify-js will inspect your source files for `img`, `video`, and `audio` tags with a `src` attribute. Whenever it finds one, it will copy the file to a destination of your choosing, likely in your output directory, and update the `src` attribute to point to the new location. Not only that, but it will rename the asset based on a hash of its contents, meaning name collisions are not an issue. This may sound minor, or even a little odd at first, but it's actually a critically important piece of the puzzle. It means your modules can be developed completely independently using normal directory structures and paths, and everything will be properly updated at build time!

### atomify-css

atomify-css provides a CSS workflow based on Rework (or a LESS or SASS workflow if you choose), again with added conveniences for bundling assets used by your stylesheets.

While atomify supports LESS and SASS, the more compelling use case is the CSS workflow which is based around Rework, so that is what we'll cover here. If you're not familiar with Rework check out this [great introductory post](http://nicolasgallagher.com/custom-css-preprocessing/), but in a nutshell it is a tool for creating custom CSS preprocessors in the same vein as things like LESS and SASS. I've come to prefer Rework, because it is entirely plugin driven, which means it is completely customizable. Want to add some feature the framework authors didn't provide? Write a plugin and `use()` it. Dead simple.

The simplest usage of atomify-css looks like this.

`require('atomify-css')('entry.css', 'bundle.css')` Look familiar?

#### Modular styles FTW

Modern preprocessor libraries like LESS and SASS have improved the modularity story in the styling world. Unfortunately, while they allow you to use `@import` to combine style information from multiple files, by default you must use relative file paths in these statements.

With atomify-css you can **use `@import` exactly the same way you use `require()`** in JavaScript.

What this means is that you can create completely separate projects that house style information for just their piece of the puzzle, and then `@import` them into one or more projects elsewhere.

When you `@import` a module by name, the return value is determined by the `style` field of the module's package.json file. If no `style` field exists, atomify-css will look for `index.css` in the root of the package by default.

Seem weird? [Bootstrap](https://github.com/twbs/bootstrap/blob/master/package.json#L19) and [normalize.css](https://github.com/necolas/normalize.css/blob/master/package.json#L5) don't think so.

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

Similar to how it works in atomify-js, atomify-css will detect asset paths in `url()` statements in your stylesheets. Each asset is copied to a destination of your choosing and renamed using a hash based on its contents. The original paths are then updated to point to the hashed versions. Done and done. Sound familiar?

### atomify CLI

atomify comes with a CLI to enable easy integration into existing build processes and declarative configuration from within your package.json file. The CLI supports nearly everything the direct API does since the (optional) callback is the only aspect of configuration that is not defined as an object hash. Using [subarg](https://www.npmjs.org/package/subarg) syntax, you can make extensive use of the CLI either directly or as part of a larger build process. Some examples can be found in the [readme](https://github.com/atomify/atomify#cli).

### Development server

atomify also provides a basic http server that offers live bundling similar to [beefy](https://www.npmjs.org/package/beefy), but with all the template, stylesheet, and asset goodness to enable fast iteration.

You can see all the options [here](https://github.com/atomify/atomify#development-server), but all the basics you'd expect like `port`, `path`, and `url` are supported. The server is built on top of [st](https://www.npmjs.org/package/st).

## Conclusion

As the web rapidly evolves towards standards like Web Components, there may well be a more formalized way to achieve true modularity in the future. However, I personally have no intention of waiting for standards bodies and browser makers to get us there. Why would I? Atomify is ready now.