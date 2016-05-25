## @dskrepps/config

Simple but powerful config loader which can read any config format supported by [coherent](https://github.com/DSKrepps/coherent). It will attempt to load various common files in order of priority listed below. Also provided are methods `has`, `get`, and `set` for accessing nested objects using [Dotty](https://github.com/deoxxa/dotty) and `saveLocalChanges` to save values changed with `set`.

This module is written with brevity and readability in mind so you can easily fork your own version for your own unique config loading criteria. But if you'd like to use it as is:

[![NPM](https://nodei.co/npm/@dskrepps/config.png)](https://nodei.co/npm/@dskrepps/config/)

### Usage

```js
const getConfig = require('@dskrepps/config');
var config = getConfig();

// Generate & save a new session key if it's missing from config
if (!config.has('app.secrets.sessionKey')) {
	let newSessionKey = require('crypto').randomBytes(48).toString('hex');
	config.set('app.secrets.sessionKey', newSessionKey);
	// Save the key to config/local.json, which should be in .gitignore
	config.saveLocalChanges();
}

// A quick modular Express app
var app = require('express')();
app.set('config', config);

// Pass app (and thus app.config) to each module in array config.modules
config.modules.forEach( modulePath => require(modulePath)(app) );

app.listen( config.port, config.host, () => console.log(
	'%s is listening at %s:%d in %s mode',
	config.get('app.name') || 'App',
	config.host, config.port, config.env
) );
```

### Order of Priority

Your config options are merged in this order using [deep-extend](https://github.com/unclechu/node-deep-extend) and files are read using [coherent](https://github.com/DSKrepps/coherent), how you see here:

 - Initial values (next section)
 - First argument passed to this module
 - `coherent(config.configDir + 'default')`
 - `coherent(config.configDir + config.env)`
 - `if (!config.ignoreLocalConfig) coherent(config.configDir + config.localConfig)`
 - `envNodeConfig = JSON.parse(process.env.NODE_CONFIG)`
 - `argv = minimist(process.argv.slice(2)) /* Command line options */` 
 - `for (file of config.additionalConfigs) coherent(config.configDir + file)`

### Initial Values

 - `configDir: __dirname+'/../../config/' /* 'config' directory adjacent to node_modules */`
 - `env: argv.env || envNodeConfig.env || process.env.NODE_ENV || 'development'`
 - `localConfig: 'local.json'`
 - `additionalConfigs: []`
 - `allowSaveChanges: true`

### Methods

##### `config = require('@dskrepps/config')([configToExtend])`
Load the config files in the order of priority above. `configToExtend` will extend the intial config values before being by the other configs.

##### `config.loadConfig(fileName)`
Syncronously Loads another config file from the config directory to extend onto the same config object. Fails silently if none found.

##### `config.has(str)`
Check if an object has a property using Dotty's `exist`. Returns true or false.

##### `config.get(str)`
Get a value. See Dotty's `get`. Returns the value or undefined.

##### `config.set(str, value[, dontSave=false])`
Sets a value, deeply if necessary using Dotty's `put`. If `dontSave` is true it won't remember the change when `saveLocalChanges` is called.

##### `config.saveLocalChanges(callback)`
Will save changed values made with the `set` method to the `config.localConfig` file. Does nothing if there have been no modifications, or if `allowSaveChanges` is not truthy, or if `localConfig` is not truthy. Takes a callback which is passed an Error on failure.


### License

MIT