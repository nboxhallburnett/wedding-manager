import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();

// Parse CLI arguments passed to runner
const userArgs = process.argv.slice(2);
const files = [];
const extraFlags = [];
let isCoverage = false;

for (const arg of userArgs) {
	if (arg === '--coverage') {
		isCoverage = true;
	} else if (arg.startsWith('-')) {
		extraFlags.push(arg);
	} else {
		files.push(arg);
	}
}

// Assemble Node.js test runner arguments
const nodeArgs = [
	'--experimental-test-module-mocks',
	'--dns-result-order=ipv4first',
	'--env-file=test/.env',
	'--import=./test/hooks.js',
	'--test'
];

if (isCoverage) {
	nodeArgs.push(
		'--experimental-test-coverage',
		'--test-coverage-include=src/**/*.js'
	);
} else {
	nodeArgs.push('--test-reporter=spec');
}

nodeArgs.push(...extraFlags);

// Default to all test files if no specific target files are provided
if (files.length > 0) {
	nodeArgs.push(...files);
} else {
	nodeArgs.push('test/**/*.test.js');
}

const child = spawn(process.execPath, nodeArgs, {
	env: { ...process.env, TEST_MONGO_URI: uri },
	stdio: 'inherit'
});

for (const sig of [ 'SIGINT', 'SIGTERM' ]) {
	process.on(sig, () => {
		child.kill(sig);
	});
}

child.on('exit', async (code, signal) => {
	await mongod.stop();
	if (signal) {
		process.kill(process.pid, signal);
	} else {
		process.exit(code ?? 0);
	}
});
