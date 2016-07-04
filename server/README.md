# Dashboard Gadget SERVER

## Pre installation
### MongoDB

    `$ brew update`

    `$ brew install mongodb`

### NPM concurrently

`$ npm install -g concurrently`

## Installation
`$ npm install`

## Run Server
`$ npm start`

After you have stopped the server, please stop it by order, so your database will be stopped correctly.

`$ npm stop`

If you have an open mongodb-connection and you want to kill the process, you can find the process-id by

`$ pgrep mongo`