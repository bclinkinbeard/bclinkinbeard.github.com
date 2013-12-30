{
	title: "A quick and dirty introduction to Yeoman generator development",
	date: "2013-04-13",
	dateLabel: "April 2013",
	description: "Yeoman intro"
}

[Yeoman](http://yeoman.io/) is a fairly new tool from a group of well known open source developers, including some from Google, Twitter, and elsewhere. If you're not familiar with it go check it out,
because that's not the intention of this post. This post is simply my attempt to document some of the things I've
figured out while hacking around in the generators provided by the Yeoman team and working to create my own. (That
being the case, it is entirely possible that something I say here could be wrong. If so,
kindly tell me I am an idiot on Twitter or something, and I will fix it.) As you
know or can probably guess, a generator is a module that can be run by Yeoman to perform some kind of task. These
tasks are usually related to scaffolding an application or automating a task related to file creation that would
otherwise become repetitive during the course of development.

## Creating a generator

There are a handful of generators available out of the box after installing Yeoman. I think these are just installed
in a centralized location during installation but am not sure, and I think there are plans to change how/if
"global" generators work. Either way, we're going to install our generator locally,
just like we've all learned is usually the best idea when installing Node modules. In fact,
our generator *is* going to be a Node module. This means that until your generator is published and is `npm install`-able, you will just manually place it in your project's `node_modules` directory.

In order to make your generator discoverable by Yeoman, its directory name must begin with `generator-`,
and the rest of the name becomes the name by which it is addressed. So if you create a directory in
`node_modules` called `generator-be-awesome`, you will run it on the command line with `yo be-awesome`.
Pretty straightforward, but as far as I can tell, totally undocumented at this point in time.

By default, Yeoman will run the code located at `app/index.js` within your generator's directory.

## Multi-purpose generators

Some generators, like the excellent [AngularJS generator](https://github.com/yeoman/generator-angular),
offer multiple capabilities that you can target specifically depending on what you are trying to accomplish. The
syntax for doing so is to add `:targetName` to the generator's name, where `targetName` is the name of
another directory within the generator. For example, to have the Angular generator create a controller for you,
you run `yo angular:controller Users`, which will run the code located at `controller/index.js` within the
`generator-angular` directory. If you are familiar with [Grunt](http://gruntjs.com) (which you had better be),
you can think of generators as tasks, and targets as... targets, I guess. I don't know if there is a specific name
for these sub-tasks in Yeoman generators, so I just call them targets.

Make sure to have your editor show directory names in file tabs while doing Yeoman development,
unless you think having 5 tabs that just say `index.js` sounds like fun.

## Templates

One of the primary things Yeoman generators do is to create files from templates. Since I assume you will be creating a generator by modifying an existing one, your generator will be extending one of Yeoman's built in generator types, and will have access to a `this.template( src, dest )` method. By default,
this method will look up the `src` path within a templates directory in your target directory. So `this.template( 'Gruntfile.tpl.js', 'Gruntfile.js' );` in `app/index.js` will process the template file at `app/templates/Gruntfile.tpl.js` and copy the output to your working directory as `Gruntfile.js`.

Speaking of Gruntfiles, most of them use variables to make configuration easier. These variables look like `<%=
src_dir %>` and are passed to various tasks and targets in the file. However, Yeoman uses the same variable syntax,
 so having them in templates that Yeoman processes will cause issues. To define variables in template files you need
 to put an extra % on the opening tag, resulting in the `<%%= src_dir %>` syntax. During processing,
 Yeoman will turn this back into `<%= src_dir %>` so that Grunt can process it as needed.

 ## Conclusion

 There is a ton more to Yeoman (vastly more than I am even aware of, surely), but these basics should be enough to
 get you hacking away. I would definitely recommend using [generator-webapp](https://github.com/yeoman/generator-webapp) and [generator-angular](https://github.com/yeoman/generator-angular) as starting points. Just copy them down,
 change the directory name and start playing around. The worst that could happen is you format your hard drive. I
 kid, I kid. But seriously, you could. Be careful out there. :)
