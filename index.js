
// Load your config files and options in the necessary order

// Usage:
// config = getConfig();
// config = getConfig(configObject);
// config = getConfig({configDir: __dirname+'./config'});
// port = config.port;
// config.has('auth.twitter.token');
// config.get('auth.twitter.token');
// config.set('secrets.session.token', token);
// config.set('db.name', 'test.db', false); // Don't save to local.json
// config.saveLocalChanges();

// Loads command line argument such as -port 8080
// Loads environment variable NODE_CONFIG as a json obj


'use strict';

var deepExtend = require('deep-extend');
var dotty = require('dotty');
var coherent = require('coherent');
var argv = require('minimist')(process.argv.slice(2));

var envNodeConfig = JSON.parse(process.env.NODE_CONFIG || '{}');

var initialConfig = {
	configDir: __dirname + '/../../config/',
	env: argv.env || envNodeConfig.env || process.env.NODE_ENV || 'development',
	localConfig: 'local.json',
	allowSaveChanges: true,
	additionalConfigs: [],
};



module.exports = configure;


function configure (config) {
	
	config = deepExtend({}, initialConfig, config || {});
	
	// Properties modified with set are stored here to save later
	var changes = {};
	
	
	
	// Load each config file if it exists
	loadConfig('default');
	loadConfig(config.env);
	config.ignoreLocalConfig || loadConfig(config.localConfig);
	
	// Environment variable NODE_CONFIG can be a JSON object
	deepExtend(config, envNodeConfig);
	
	// Command line arguments e.g. -port 8080
	deepExtend(config, argv);
	
	config.additionalConfigs.forEach(loadConfig);
	
	
	
	
	
	
	Object.defineProperties( config, {
		loadConfig: { value: loadConfig },
		has: { value: has },
		get: { value: get },
		set: { value: set },
		saveLocalChanges: { value: function (cb){
				setImmediate(require('./saveChanges'), config, changes, cb);
			}},
	});
	
	
	return config;
	
	
	// Load a config file from configDir, silently ignore missing files
	function loadConfig(file) {
		try {
			deepExtend(config, coherent.read(config.configDir+'/'+file) );
		} catch (err) {
			if(err && err.code !== 'ENOENT') {
				throw err;
			}
		}
	}
	
	function has (path) {
		return dotty.exists(config, path);
	}
	
	function get (path) {
		return dotty.get(config, path);
	}
	
	function set (path, value, dontSave) {
		
		if (config.allowSaveChanges && !dontSave) {
			dotty.put(changes, path, value);
		}
		
		dotty.put(config, path, value);
	}
	
}
