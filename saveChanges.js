
var deepExtend = require('deep-extend');
var coherent = require('coherent');


module.exports = saveChanges;


// Save changes, but quietly don't save on 3 criteria:
//   When nothing has been added to the 'modified' object
//   When config.allowSaveChanges is not truthy
//   When config.localConfig is not truthy
function saveChanges (config, modified, callback) {
	
	callback = callback || function(e) {if(e)throw e};
	
	var doSave = config.allowSaveChanges && modified && !!config.localConfig;
	if (!doSave) callback();
	
	
	var path = config.configDir + '/' + config.localConfig;
	var fileToWrite = coherent(path);
	var localConfig = {};
	
	
	// Read new copy first first to prevent overwritting other changes
	try{
		localConfig = fileToWrite.read() || {};
	} catch(err) {
		// Ignore file not found as we're writing it anyway
		if (err && err.code !== 'ENOENT') callback(err);
	}
	
	deepExtend(localConfig, modified);
	
	// Write
	try {
		fileToWrite.write(localConfig);
		modified = {};
		callback();
	} catch (err) {
		callback(err);
	}
	
}