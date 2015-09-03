{
	title: "Up and running with ES6 and React in under 5 minutes",
	date: "2015-3-9",
	dateLabel: "September 2015",
	description: "Quickly set up a development environment with ES6 transpilation and React hot reloading"
}

The web development landscape can be overwhelming sometimes. To say things are moving quickly is a pretty epic understatement. **The length of time a tool is "hot" can be frighteningly similar to the time it takes to fully grok that tool.** At the same time, things can become SO hot SO quickly that you can feel behind the curve almost overnight.

Right now, [React](http://facebook.github.io/react/) is undeniably the hottest framework, [webpack](https://webpack.github.io/) is one of the hottest tools, and ES6+ (ES2015 wat?) is the biggest looming sea change in our industry. Now, I don't expect any of these things to go out of favor any time soon, but that doesn't mean you shouldn't be expediting your understanding of them.

The problem, of course, is that each of these things is extremely deep on its own. Learning any one extensively, let alone all three, let alone **how to use them all together** can be daunting to say the least. You could easily spend a few days just learning how to configure your builds, how to enable hot reloading, and how to transpile your code. You might do a deep dive someday, but you want to start tinkering NOW. You want to see what all the fuss is about, keep your skills sharp, and prepare yourself for the future.

## There is a shortcut

Luckily for us, the inimitable [Henrik Joreteg](http://joreteg.com/) created the [hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack) project, which drastically streamlines the process of setting up an environment with all the latest hotness. (The prefix of hjs indicates the project's membership in Henrik's [Human JavaScript](http://humanjavascript.com/) ecosystem.)

So, how does it work? Let's take a look.

The first step is to create a directory for your project and create a `package.json` file. The easiest way to create that file is to run `npm init -y`, which will use all of your system defaults instead of asking you a bunch of questions.

With the `package.json` file in place, you can install hjs-webpack.

`npm i -S hjs-webpack` (short for `npm install --save hjs-webpack`) will install the package and its dependencies, and update your `package.json` file. You may want to grab a Snickers because it will take a minute or so, but when it finishes you will see why. Once the install completes, your dependencies will look something like this.

```json
"dependencies": {
  "autoprefixer-core": "^5.2.1",
  "babel": "^5.8.23",
  "babel-core": "^5.8.23",
  "babel-loader": "^5.3.2",
  "css-loader": "^0.16.0",
  "file-loader": "^0.8.4",
  "hjs-webpack": "^2.12.4",
  "json-loader": "^0.5.2",
  "postcss-loader": "^0.6.0",
  "react": "^0.13.3",
  "react-hot-loader": "^1.3.0",
  "style-loader": "^0.12.3",
  "stylus-loader": "^1.2.1",
  "url-loader": "^0.5.6",
  "webpack": "^1.12.0",
  "webpack-dev-server": "^1.10.1",
  "yeticss": "^7.0.4"
}
```

In addition to `hjs-webpack`, we have about 16 other packages installed, which is how this one step enables so much magic.

**Important:** These packages are `peerDependencies` of `hjs-webpack`, which means they will not be installed if you are using `npm` version 3 or higher. In that case simply run the following once `hjs-webpack` is finished installing. `npm i -S autoprefixer-core babel babel-loader css-loader json-loader postcss-loader react react-hot-loader style-loader stylus-loader url-loader webpack-dev-server yeticss`

## Dead simple config

Don't blink, or you might miss these setup tasks.

First, create a `webpack.config.js` file, and give it the following contents.

```js
var getConfig = require('hjs-webpack');

module.exports = getConfig({
  in: 'src/app.js',
  out: 'dist',
  clearBeforeBuild: true
});
```

You simply import `hjs-webpack` and pass it this minimal config object. You can obviously point it to any entry file (the `in` field), but using a separate directory will help with file watching performance since `node_modules` can be fully excluded. The `out` field only comes into play if you decide to bundle your output for deployment, so if you're just hacking around you don't even need to create the directory!

Next, add `"start": "webpack-dev-server"` to the scripts key of your `package.json` file. You can now run `npm start` from the command line to start the webpack server that has file watching, transpiling, and hot reloading all configured and working.

(You could add `"build": "webpack"` to your scripts if you want to bundle into the `dist` directory by running `npm run build`.)

That's it! Now it's...

## Play time!

You can now add code to `src/app.js`, open [http://localhost:3000/](http://localhost:3000/) in a browser, and watch in awe as every time you save a file your browser updates to show you the resulting changes.

You are free to use all the ES6 goodies as well, since Babel transpilation is part of the pipeline. If you want to play with even more experimental language features, like the stupendous [ES7 bind syntax](https://github.com/zenparsing/es-function-bind), you can tell Babel to live a little more on the edge. Simply add `"babel": { "stage": 0 }` to the top level of your `package.json` file (or put the equivalent in a `.babelrc` file) and BOOM, hyper-futuristic JavaScript.

For a bare bones example of this setup that includes some React goodness and a clear demonstration of hot reloading check out my [demo project](https://github.com/bclinkinbeard/egghead-hjs-webpack-demo).

That's it! You now have a fully functional 22nd century development environment, and the ice in your latté hasn't even melted!

Enjoy!