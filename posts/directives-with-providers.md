{
	title: "Creating Configurable Angular Directives with Providers",
	date: "2014-12-30",
	dateLabel: "December 2014",
	description: "Creating components that can be configured by client applications is easy with the right tools"
}

As a developer, single-use code is your enemy.

Whenever possible, you avoid creating static, purpose-built code with no use beyond your immediate needs. This is doubly true when talking about components, or as we call them in Angular, directives. Thankfully, Angular provides a built-in mechanism for configuring pieces of an application before it starts running. In this post we’ll look at that mechanism itself, as well as how to create components that take advantage of it.

## The hook

When defining your application, you are really just configuring your app’s root module. In addition to listing its dependencies, you can also use the [module API](https://docs.angularjs.org/api/ng/type/angular.Module) to configure various aspects of it.

The part we’re interested in here is the `config()` method. Functions registered using the config method will run when the associated module is loaded. This means that, if defined on your root module, they will be run before any of the other modules in your app have been loaded. This allows us to configure those modules before it’s too late.

```js
angular.module(‘app’, [‘bilingualButtonModule’])
  .config(function () {
    // almost nothing is created/ready yet
  });
```

While it’s helpful to have this early hook, it also comes with some limitations. Since the function will run before the `bilingualButtonModule` module is fully initialized, we can’t inject dependencies it defines into our config function.

Actually, I take that back. Sort of.

## Providers are special

The one part of our non-root modules that _are_ available to our config functions are [providers](https://docs.angularjs.org/guide/providers#provider-recipe).

Using the `provider()` method of the module API lets you define and expose a custom API that can be used to configure aspects of your own module. That’s a bit of a mouthful, so lets look at an example. The following is the `bilingualButtonModule` that our app depends on in its entirety.

```js
angular.module('bilingualButtonModule', [])
  .provider('bilingualButtonConfig', function () {

    this.setLocale = function (locale) {
      this.locale = locale;
    };

    this.$get = function () {
      return this;
    };

  })
  .directive('bilingualButton', function () {
  
    return {
      template: '<button>{{greeting}}</button>',
      controller: function ($scope, bilingualButtonConfig) {
        if (bilingualButtonConfig.locale === 'es') {
          $scope.greeting = 'Hola Mundo';
        } else {
          $scope.greeting = 'Hello World';
        }
      }
    };
    
  });
```

The `bilingualButtonConfig` provider is what makes the `bilingualButton` directive configurable. Let’s look at each function individually to better understand what is going on.

### The configuration API

In this simple example, our configuration API is limited to a single function, defined as `this.setLocale()`. This function takes an argument and saves its value to a local property named `locale`. We could just as easily expose multiple methods, or perform more complex logic, or perform any number of tasks.

### The $get method

When `bilingualButtonConfig` is injected in another part of the app, the `$get` method’s return value will be what actually gets passed to the entity that expressed the dependency. In this case we are simply returning `this`, which will have a `locale` property, as long as `setLocale()` has been called.

### The directive

The only thing our module defines besides the `bilingualButtonConfig` provider is the `bilingualButton` directive. The directive is super simple, defining a template that is just a button tag whose label is bound to a scope property named `greeting`, and a controller. The controller gets its scope and our `bilingualButtonConfig` injected, and sets the `greeting` property based on the value of `bilingualButtonConfig.locale`.

We now have a `bilingualButtonModule` that creates a directive whose appearance is configurable. That’s great but… how do we configure it?

## Using providers

Now that we’ve defined a provider, let’s look at how to use it. Returning to our root module definition, we can finally implement a proper config function.

```js
angular.module('app', ['bilingualButtonModule'])
  .config(function (bilingualButtonConfigProvider) {
    bilingualButtonConfigProvider.setLocale('es');
  });
```

Notice that we’ve used `bilingualButtonConfigProvider` as the dependency name to request what was defined with `.provider('bilingualButtonConfig', function () {…})`. Including the Provider string on the end tells Angular we want the provider rather than the service, factory, value, etc.

In simpler terms that means if you defined a module like this:

```js
angular.module('fooModule', [])
  .provider('foo', function () {
    this.setBar = function () {
      this.bar = true;
    };
    this.$get = function () {
      return this;
    };
  });
```

You could use it like this:

```js
angular.module('app', ['fooModule'])
  .config(function (fooProvider) {
    fooProvider.setBar();
  });
```

We could have done `.provider('bilingualButton’, function () {…})` and `.config(function (bilingualButtonProvider) {…})`, but that ends up getting confusing because you’re then injecting a `bilingualButton` dependency into the controller for a directive also named `bilingualButton`.

### You’ve used providers before

You just didn’t know it.

Behind the scenes, `module.service()` and `module.factory()` are both implemented as providers. Angular just implements `$get` for you to create a simpler API that is easier to reason about and has a more concise syntax. For a more thorough explanation, check out [this great post](http://joelhooks.com/blog/2013/08/18/configuring-dependency-injection-in-angularjs/) by my friend Joel Hooks.

## Conclusion

Providers can be confusing at first, but understanding them is key to building flexible directives. While not the only way to build configurable components, they provide a well documented “blessed path” for doing so.

The examples from this article can be found in [this GitHub repo](https://github.com/bclinkinbeard/demo-directives-with-providers).

Enjoy!

