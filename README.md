# Silk Skeleton

Skeleton for the GUI For Developers (and Node OS)

### Install

My version is not the core version so you will not be able to get it from npm
```
$ git clone git@github.com:formula1/Silk.git /Path/to/a/Directory
$ cd Path/to/a/Directory
$ npm install
$ bower install
$ npm start
```

### Creating an application

> Every application can have a public folder.

These will be scripts that you can access through 

```
<script type="text/javascript" src="/yourapplication/any/thing/here/is/public.hello" ></script>
```

> Every Application needs a window.json file

[for an Example Click Here](https://github.com/formula1/Silk/blob/development/apps/textEditor/window.json)

The window.json file absolutely needs
* title - String
* url - A **valid** url. it is resolved from localhost:3000/YourApplication/public
* logo - A **valid** url to an image. it is resolved from localhost:3000/YourApplication/public

> Every Application can have a index.js file

This path is resolved as if it was required. So you can also include a package.json that points the correct script. However, currently we do not install dependencies specified within the package.json

> Every Application can have bower_dependencies

These are valid Bower name keys with valid versions for which we will retrieve if they don't exist in your current files system. We do not update however.

> Every Application can have npm_dependencies

These are valid NMP name keys with valid versions for which we will retrieve if they don't exist in your current files system. We do not update however.


### How it works

> Really Simple

* On Run, we open up every resolved index.js for each app within its own child process
* User Goes to [0.0.0.0:3000](0.0.0.0:3000) or [localhost:3000](localhost:3000)
* The User Chooses Their manager (for which there is only one for now)
* User chooses an application to open
* This opens up an iframe with the url specied
* User presses Ctrl+C in the terminal to shut everything down

> Pretty Simple

Within the [/core](https://github.com/formula1/Silk/tree/development/core) everything is seperated by role. 

* `/core/abstract` is mostly abstract wrappers that can be reused at will.
* `/core/fork` is for the containers that the servside parts of the applications will run in
* `/core/network` is for web rtc and other aspects that involve remote communications
* `/core/pipedreams` is experiments if anyone wants to see what may be the future
* `/core/utils/*` is a series of utilities that don't really belong anywhere.
* `/core/window/` is the clientside api windows will use

The Stray Files Should also be organized but haven't been yet

> Less Simple

Our Environment Runs mostly off Input and output like all enviornments. The difference is we have tried to make it easy for developers to use the input output as they please by having almost all of the classes having very similar syntaxes

* [Client to Client](https://github.com/formula1/Silk/blob/development/core/network/public/NetworkUser.js), [here](https://github.com/formula1/Silk/blob/development/core/network/public/NetworkHost.js) and [here](https://github.com/formula1/Silk-WebRTC-Example/blob/master/index.js) - [WebRTC](https://developer.mozilla.org/en-US/docs/Web/Guide/API/WebRTC)
* [Client to Server](https://github.com/formula1/Silk/blob/development/core/window/public/Window2Server_com.js) and [here](https://github.com/formula1/Silk/blob/development/core/Server2Client_com.js) - [WebSockets](https://developer.mozilla.org/en-US/docs/WebSockets)
* [Window to Window](https://github.com/formula1/Silk/blob/development/core/window/public/WindowAbstract.js) - [Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage)
* [Master and Child Processes](https://github.com/formula1/Silk/blob/development/core/fork/fork_container/forkAssembler.js#L207) and [here](https://github.com/formula1/Silk/blob/development/core/fork/fork_container/Fork2Server_com.js) - [child.send](http://nodejs.org/api/child_process.html#child_process_child_send_message_sendhandle)


> Much Less Simple

Perhaps you don't see any syntaxes. Thats because there are almost none there. Almost all io has a wrapper of one of following.

* [MesageRouter.js](https://github.com/formula1/Silk/blob/development/core/abstract/MessageRouter.js) - Place where you can add methods to the io your listening to
* [MessageWriter.js](https://github.com/formula1/Silk/blob/development/core/abstract/MessageWriter.js) - Write Methods to an io channel 
* [MessageDuplex.js](https://github.com/formula1/Silk/blob/development/core/abstract/MessageDuplex.js) - Write and add methods. Minor difference in that it creates an originator property for every request made

If theres anyway to improve the system, it will most likely be to change one of the above. Whether its to handle readable/writable node streams or even BlobURIs.


# Api

All of the above extend [Wolfy's on Clientside](https://github.com/Wolfy87/EventEmitter/blob/master/docs/api.md) and [Node's on Serverside](http://nodejs.org/api/events.html#events_class_events_eventemitter). `getListeners` is always a method to be used. However, you will most likely not be using them as event Emitters and if you are, either you or me are doing something wrong.

## Abstract API

#### MessageRouter

> add - Adds a function to listen to a namespace. This will be called the most by average users

* add(object<String:Function<data,message_object,next>>) - you can set an "array" of listeners at one time
* add(String, Function) - you can set a single listener

#### MessageWriter

> trigger - This will make a call

* trigger(String, Object) - Calls the namespace you would like to hit

> get - This will make a call with an expected return

* get(String, Object)-> [RSVP.Promise](https://github.com/tildeio/rsvp.js/) - Calls the namespace you would like to hit and returns a promise that will resolve or fail once the data comes back
* get(String, Object, Function<Error, Object>) - Calls the namespace you would like to hit and calls the function once it comes back with an error or a result


> pipe - This will make a call and return data multiple times. Doesn't open until you send

* pipe(String, Object)-> [StreamPromise](https://github.com/formula1/Silk/blob/development/core/abstract/StreamPromise.js) - Calls the namespace you would like to hit and returns a promise that will resolve or fail once the data comes back
* pipe(String, Object, Function<Error, Object> - Calls the namespace you would like to hit and calls the function once it comes back with an error or a result

> abort - Not working 100%

#### MessageDuplex

> does both of the above


## Application API

#### global.methods

This is accessible within the main script of every app.

**Important** - Anything routes you specify will get prepended with `YourFolderName-` This is to ensure no one conflicts in listeners (unless by foldername)

#### window.DocumentHost and window.ApplicationFork

This is accessible if you add `<script src="/window/Window2Server_com.js"></script>` Document host allows you to ask for any method within the system. Application fork prepends your request with `YourFolderName-`.

## Window Manager API

####  window.Manager and  window.RootManager

These are the managers that applictaions can interacte with unless you specify another or are the RootManager


## The rest is still work in progress

##To Install
    npm i -g silk-gui 
    cd silk
    npm start
