{
	title: "External bundles for faster Browserify builds",
	date: "2013-08-05",
	dateLabel: "August 2013",
	description: "Browserify FTW"
}

Browserify is changing the way we write client side JavaScript applications. In my opinion it's one of the most important tools to come on the scene in a long time. However, to get the most out of it, and your time, there are some things you can do to make sure your builds are as fast as possible. Less time building means more time coding, right? This post focuses on what is probably the biggest speed win when configuring your Browserify build.

This technique took the build times in response to file changes from about 8 seconds to less than 2 on my current project. You *are* using a file watcher to rebuild your app whenever a file changes. Right?

## The scenario

Browserify works by walking the `require()` statements in your code to build up a dependency tree and then generates a bundle containing all those dependencies. That being the case, it seems obvious that you should avoid having it process files that you know don't contain any `require()` statements.

Generally speaking, the files that you know to be devoid of `require()` statements are going to be library files. At least I haven't come across and libraries using them. Additionally, some of those library files can be quite large. AngularJS and jQuery, for example, are fairly hefty files that you can safely ignore parsing for `require()` calls. You need those files in your app though, right? So Browserify has to know about them… right?

## Externalizing libraries

Among the handful of options Browserify supports, one of them is `external`. This is simply a way to tell Browserify "Hey, when you see `require()` statement looking for X, don't worry about finding it in the tree. It will be available, trust me."

So, how do you make it available, and avoid looking like a liar in front of Browserify? Easy, you stick them in their own bundle, and only build that one when necessary.

These code examples will assume you are using grun-browserify. If you are hardcore and writing your own Browserify build scripts I trust you are capable of converting them to plain JS instructions. The shim option is necessary because neither jQuery nor AngularJS provide a CommonJS compatible export, which Browserify requires.

```
browserify: {
  libs: {
    options: {
      shim: {
        jquery: {
          path: './libs/jquery.js',
          exports: '$'
        },
        angular: {
          path: './libs/angular.js',
          exports: 'angular',
          depends: {
            jquery: '$'
          }
        }
      }
    },
    src: ['./libs/*.js'],
    dest: '<%= distdir %>/libs.js'
  }
}
```

So what is happening here? We are creating  `libs` target for our `browserify` task that will package up all the JavaScript files it finds in the `libs` directory into a `libs.js` file, and save it in our `dist` folder. We could run this target directly by running `grunt browserify:libs` from the command line.

## Marking dependencies external

Now that we've taken care of bundling the libraries our app will need, we need to tell Browserify not to bundle those same files again, and not to freak out when it sees a request for one of these files. We do this using the `external` config option.

```
app: {
  options: {
    alias: [
      './libs/jquery.js:jquery',
      './libs/angular.js:angular'
    ],
    external: [
      './libs/jquery.js',
      './libs/angular.js'
    ]
  },
  src: ['src/app.js'],
  dest: '<%= distdir %>/app.js'
}
```

The `alias` block above is simply a convenience setting that will allow us to load these libraries with syntax like `require('angular')` and not have to worry about file path issues.

The `external` block is the important part though. That is what tells Browserify not to actually search for `./libs.agular.js` when it sees a request for it. When it encounters a request for that file (or an alias to that file) it will simply carry on, trusting that it will be provided externally.

## See it in action

I have put together a very simple demo project that illustrates the concepts discussed above. To set it up on your machine, [download this zip file](http://benclinkinbeard.com/demos/external-bundles.zip) and unpack it. From the new directory run `npm install`. (I am assuming you already have the Grunt CLI installed.) You now have 2 Grunt tasks available that will demonstrate the build speed difference.

To see the slow, un-optimized version that does not externalize dependencies, run `grunt server-slow`. This will build everything and start the watch process. To then trigger a rebuild, edit the `app.js` file and save it. In your terminal you should see output showing the files are being rebuilt, with a message at the end telling you how long everything took. Over the course of several builds I saw times between 1.9 seconds and 2.2 seconds. YMMV, obviously.

To see the optimized, externalized dependencies version, stop the watch process. You can do this using Ctrl-C on OS X. Now run `grunt server`. You should see the same startup messages as last time, and the initial build will not be any different than it was last time. Once it completes, go edit `app.js` again and see how long it takes. Again, YMMV, but I consistently see times of less than half a second. That equate to a roughly 75% speed increase.

## What's the big deal?

While saving 1.5 seconds may not seem like a huge deal, do a quick extrapolation on those numbers. (Also remember we cut our build times from about 8 seconds to less than 2, so in a real project the gains will likely be larger in terms of actual seconds gained.) Saving even a few seconds, 50+ times a day, times every developer on your project, that is a not insignificant improvement. Even more than the raw time gained, I find it's extremely helpful for maintaining focus. Developers are notoriously easily distracted, and 8+ seconds can be long enough for my mind to switch to another task, or to decide to check Twitter, or… you get the picture.

In closing, this technique isn't going to change your life, but I do think it's an easily implemented and maintained solution that pays real dividends. It's an incremental improvement, and that's what we're continually seeking anyhow. Right?