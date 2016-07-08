# Dashboard Gadget SERVER

## Pre installation
### MongoDB

    $ brew update

    $ brew install mongodb

### NPM concurrently

    $ npm install -g concurrently

### AVN

    $ npm install -g avn avn-n
    $ avn setup
    
### bcrypt

    $ npm install bcrypt

`avn` will detect the `.node-version` file and automatically switch to the correct node version using either
`n` or `nvm`, depending on which one you have installed.

## Installation
    
    $ npm install
    
## Run Grunt
To create the stylesheets and the javascript files for the server, we use grunt for an automatically process.

    $ grunt
    
You can run the grunt task `watchify` to build automatically new files when something has changed.

    $ grunt watchify

## Run Server
    
    $ npm start

After you have stopped the server, please stop it by order, so your database will be stopped correctly.

    $ npm stop

If you have an open mongodb-connection and you want to kill the process, you can find the process-id by

    $ pgrep mongo

