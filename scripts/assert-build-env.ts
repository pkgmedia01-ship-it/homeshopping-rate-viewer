import { assertRuntimeDataMode } from '../src/lib/security/environment';
assertRuntimeDataMode(process.env);
console.log('Build environment boundary accepted.');
