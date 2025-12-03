import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking environment...\n');

const checks = {
  node: false,
  npm: false,
  python: false,
  clientDeps: false,
  serverDeps: false,
  mlDeps: false,
  envFiles: false,
  questionDb: false
};

// Check Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  checks.node = true;
} catch (error) {
  console.log('❌ Node.js: Not found');
}

// Check npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
  checks.npm = true;
} catch (error) {
  console.log('❌ npm: Not found');
}

// Check Python
try {
  const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Python: ${pythonVersion}`);
  checks.python = true;
} catch (error) {
  console.log('❌ Python: Not found');
}

// Check client dependencies
if (fs.existsSync('client/node_modules')) {
  console.log('✅ Client dependencies: Installed');
  checks.clientDeps = true;
} else {
  console.log('❌ Client dependencies: Not installed');
}

// Check server dependencies
if (fs.existsSync('server/node_modules')) {
  console.log('✅ Server dependencies: Installed');
  checks.serverDeps = true;
} else {
  console.log('❌ Server dependencies: Not installed');
}

// Check ML dependencies
try {
  execSync('python -c "import flask, flask_cors, sklearn, pandas, numpy"', { encoding: 'utf8' });
  console.log('✅ ML dependencies: Installed');
  checks.mlDeps = true;
} catch (error) {
  console.log('❌ ML dependencies: Not installed');
}

// Check environment files
const envFiles = ['client/.env', 'server/.env', 'ml_service/.env'];
const allEnvExist = envFiles.every(file => fs.existsSync(file));
if (allEnvExist) {
  console.log('✅ Environment files: Present');
  checks.envFiles = true;
} else {
  console.log('❌ Environment files: Missing');
}

// Check question database
if (fs.existsSync('ml_service/data/gate_questions_complete.json')) {
  const data = JSON.parse(fs.readFileSync('ml_service/data/gate_questions_complete.json', 'utf8'));
  console.log(`✅ Question database: ${data.questions.length} questions loaded`);
  checks.questionDb = true;
} else {
  console.log('❌ Question database: Not found');
}

console.log('\n📊 Summary:');
const passed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;
console.log(`${passed}/${total} checks passed\n`);

if (passed === total) {
  console.log('🎉 Environment is ready! You can start the application.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.\n');
  console.log('💡 Quick fixes:');
  if (!checks.clientDeps) console.log('   - Run: cd client && npm install');
  if (!checks.serverDeps) console.log('   - Run: cd server && npm install');
  if (!checks.mlDeps) console.log('   - Run: cd ml_service && pip install -r requirements.txt');
  if (!checks.envFiles) console.log('   - Copy .env.example files to .env in each directory');
  if (!checks.questionDb) console.log('   - Run: cd ml_service/data && python question_generator.py');
  console.log('');
  process.exit(1);
}
