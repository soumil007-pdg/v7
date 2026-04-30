import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readFile(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').trim();
  return content ? JSON.parse(content) : [];
}

function writeFile(filename, data) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getUsers() { return readFile('users.json'); }
export function saveUsers(users) { writeFile('users.json', users); }

export function getSessions() { return readFile('sessions.json'); }
export function saveSessions(sessions) { writeFile('sessions.json', sessions); }

export function getCases() { return readFile('cases.json'); }
export function saveCases(cases) { writeFile('cases.json', cases); }

export function getCaseAdvisorHistory(email) {
  const all = readFile('case-advisor-history.json');
  return all.filter(h => h.email === email);
}

export function saveCaseAdvisorEntry(entry) {
  const all = readFile('case-advisor-history.json');
  all.unshift(entry); // newest first
  writeFile('case-advisor-history.json', all);
}
