var test = require('tape');
var rm = require('rimraf');
var getConfig = require('../index.js');



test( 'reads', function (t) {
	t.plan(9);
	
	var passedArg = {
		configDir: __dirname + '/test-configs',
		env: 'development',
		additionalConfigs: ['additional1', 'additional2'],	
		testArgument: 'passed argument',
	};
	
	var config = getConfig(passedArg);
	
	
	
	t.ok(config.localConfig, 'initial values');
	
	t.ok(config.testArgument, 'passed argument', 'passed argument');
	
	t.equals(config.testDefault, 'default.json', 'default.json');
	
	t.equals(config.testEnv, 'development.json', 'development.json');
	
	t.equals(config.testLocal, 'local.json', 'local.json');
	
	t.equals(config.testNODE_CONFIG, 'NODE_CONFIG', 'passed values');
	
	t.equals(config.testCmdArgs, 'cmd arg', 'command line arguments');
	
	t.equals(config.testAdditional1, 'additionalConfig1', 'additional config 1');
	
	t.equals(config.testAdditional2, 'additionalConfig2', 'additional config 2');
	
	t.end();
});

test('writes', function(t) {
	
	var passedArg = {
		configDir: __dirname + '/test-configs',
		env: 'development',
		testArgument: 'passed argument',
		localConfig: 'testWrite.json',
		saveLocalChange: true
	};
	
	rm.sync(passedArg.configDir + '/' + passedArg.localConfig);
	
	var config = getConfig(passedArg);
	
	config.set('test.of.writing', 'success');
	
	config.saveLocalChanges(function(){ 
		var config2 = getConfig(passedArg);
	
		var written = config2.get('test.of.writing');
		
		rm.sync(passedArg.configDir + '/' + passedArg.localConfig);
		
		t.equals(written, 'success', 'a change to a new file');
		
		t.end();
	});
	
});