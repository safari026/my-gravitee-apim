const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/shared/i18n/translations.ts');
const src = fs.readFileSync(file, 'utf8');

function findDuplicateKeys(text) {
  const issues = [];
  let i = 0;
  const n = text.length;

  function skipString(quote) {
    i++;
    while (i < n) {
      const c = text[i];
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === quote) {
        i++;
        return;
      }
      i++;
    }
  }
  function skipLineComment() {
    while (i < n && text[i] !== '\n') i++;
  }
  function skipBlockComment() {
    i += 2;
    while (i < n - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
    i += 2;
  }
  function skipWs() {
    while (i < n) {
      if (text[i] === '/' && text[i + 1] === '/') {
        skipLineComment();
        continue;
      }
      if (text[i] === '/' && text[i + 1] === '*') {
        skipBlockComment();
        continue;
      }
      if (/\s/.test(text[i])) {
        i++;
        continue;
      }
      break;
    }
  }
  function readIdent() {
    const start = i;
    if (!/[A-Za-z_$]/.test(text[i])) return null;
    i++;
    while (i < n && /[A-Za-z0-9_$]/.test(text[i])) i++;
    return text.slice(start, i);
  }

  const startIdx = text.indexOf('export const translations');
  i = text.indexOf('{', startIdx);

  function parseObject(pathParts) {
    const keys = new Map();
    i++;
    while (i < n) {
      skipWs();
      if (text[i] === '}') {
        i++;
        return;
      }
      if (text[i] === ',') {
        i++;
        continue;
      }

      let key;
      if (text[i] === "'" || text[i] === '"' || text[i] === '`') {
        const q = text[i];
        const s = i + 1;
        skipString(q);
        key = text.slice(s, i - 1);
      } else {
        key = readIdent();
      }

      skipWs();
      if (text[i] === ':') {
        i++;
        const p = [...pathParts, key].join('.');
        const line = text.slice(0, i).split('\n').length;
        if (keys.has(key)) {
          issues.push({ path: p, key, line, firstLine: keys.get(key) });
        } else {
          keys.set(key, line);
        }
        skipWs();
        if (text[i] === '{') {
          parseObject([...pathParts, key]);
        } else if (text[i] === "'" || text[i] === '"' || text[i] === '`') {
          skipString(text[i]);
        } else {
          let depth = 0;
          while (i < n) {
            const c = text[i];
            if (c === "'" || c === '"' || c === '`') {
              skipString(c);
              continue;
            }
            if (c === '/' && text[i + 1] === '/') {
              skipLineComment();
              continue;
            }
            if (c === '/' && text[i + 1] === '*') {
              skipBlockComment();
              continue;
            }
            if (c === '{') depth++;
            if (c === '}') {
              if (depth === 0) break;
              depth--;
            }
            if (c === ',' && depth === 0) break;
            i++;
          }
        }
      } else {
        i++;
      }
    }
  }

  parseObject([]);
  return issues;
}

const dupes = findDuplicateKeys(src);
console.log('=== DUPLICATE KEYS ===');
console.log(dupes.length ? JSON.stringify(dupes, null, 2) : 'none');

const js = src
  .replace(/export type Language[\s\S]*?;/, '')
  .replace(/export const translations =/, 'const translations =')
  .replace(/\s+as const;?\s*$/, ';');
const translations = eval(js + '\ntranslations');

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, p));
    } else {
      out[p] = v;
    }
  }
  return out;
}

const enFlat = flatten(translations.en);
const ruFlat = flatten(translations.ru);
const enKeys = Object.keys(enFlat).sort();
const ruKeys = Object.keys(ruFlat).sort();

const onlyEn = enKeys.filter((k) => !(k in ruFlat));
const onlyRu = ruKeys.filter((k) => !(k in enFlat));
console.log('\n=== KEYS ONLY IN EN ===');
console.log(onlyEn.length ? onlyEn.join('\n') : 'none');
console.log('\n=== KEYS ONLY IN RU ===');
console.log(onlyRu.length ? onlyRu.join('\n') : 'none');
console.log('\n=== LEAF COUNTS ===');
console.log('en', enKeys.length, 'ru', ruKeys.length);

function findPrefixCollisions(flat) {
  const keys = Object.keys(flat);
  const issues = [];
  for (const a of keys) {
    for (const b of keys) {
      if (b.startsWith(a + '.')) issues.push({ stringPath: a, objectChild: b });
    }
  }
  return issues;
}
const prefixCollisions = findPrefixCollisions(enFlat);
console.log('\n=== STRING/OBJECT PATH COLLISIONS (evaluated EN) ===');
console.log(prefixCollisions.length ? prefixCollisions : 'none');

const phRe = /\{(\w+)\}/g;
function placeholders(s) {
  return [...new Set([...s.matchAll(phRe)].map((m) => m[1]))].sort();
}
console.log('\n=== PLACEHOLDER MISMATCHES EN vs RU ===');
let phMismatch = 0;
for (const k of enKeys) {
  if (!(k in ruFlat)) continue;
  const a = placeholders(enFlat[k]).join(',');
  const b = placeholders(ruFlat[k]).join(',');
  if (a !== b) {
    phMismatch++;
    console.log(k, 'EN={' + a + '}', 'RU={' + b + '}');
    console.log('  EN:', enFlat[k]);
    console.log('  RU:', ruFlat[k]);
  }
}
if (!phMismatch) console.log('none');

console.log('\n=== ALL KEYS WITH PLACEHOLDERS ===');
for (const k of enKeys) {
  const ph = placeholders(enFlat[k]);
  if (ph.length) console.log(k, ph.join(', '));
}

console.log('\n=== EMPTY OR NON-STRING LEAVES ===');
for (const [k, v] of Object.entries(enFlat)) {
  if (typeof v !== 'string' || v.trim() === '') console.log('en', k, v);
}
for (const [k, v] of Object.entries(ruFlat)) {
  if (typeof v !== 'string' || v.trim() === '') console.log('ru', k, v);
}

const srcRoot = path.join(__dirname, 'src');
function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p, acc);
    } else if (/\.(ts|html)$/.test(ent.name) && ent.name !== 'translations.ts') {
      acc.push(p);
    }
  }
  return acc;
}
const files = walk(srcRoot);
const corpus = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

const used = new Set();
for (const k of enKeys) {
  if (corpus.includes("'" + k + "'") || corpus.includes('"' + k + '"') || corpus.includes('`' + k + '`')) {
    used.add(k);
  }
}
if (corpus.includes('dashboard.events.types.')) {
  for (const k of enKeys) if (k.startsWith('dashboard.events.types.')) used.add(k);
}
if (corpus.includes('dashboard.healthCheck.badge.')) {
  for (const k of enKeys) if (k.startsWith('dashboard.healthCheck.badge.')) used.add(k);
}

const unused = enKeys.filter((k) => !used.has(k));
console.log('\n=== UNUSED KEYS (literal/dynamic scan) ===');
unused.forEach((k) => console.log(k));
console.log('unused count', unused.length);

const codeKeyRe = /['"]((?:auth|common|navigation|userMenu|dashboard|tasks|messages)\.[a-zA-Z0-9_.]+)['"]/g;
const codeKeys = new Set();
let m;
while ((m = codeKeyRe.exec(corpus))) codeKeys.add(m[1]);
console.log('\n=== CODE KEYS NOT IN translations.en ===');
const missingInDict = [...codeKeys].filter((k) => !(k in enFlat)).sort();
console.log(missingInDict.length ? missingInDict.join('\n') : 'none');
console.log('\n=== CODE KEYS COUNT ===', codeKeys.size);

const oldKeys = ['dashboard.chart.hits', 'dashboard.chart.hitsTotal', 'tasks.details.update', 'tasks.details.create'];
console.log('\n=== OLD KEYS ===');
for (const k of oldKeys) {
  console.log(k, 'in dict', k in enFlat, 'in code', corpus.includes(k));
}

console.log('\n=== nested namespace note: tasks.messages vs messages ===');
console.log('tasks.messages is object', typeof translations.en.tasks.messages);
console.log('messages is object', typeof translations.en.messages);
console.log('tasks.details type', typeof translations.en.tasks.details, translations.en.tasks.details);
console.log('tasks.promotionDetails type', typeof translations.en.tasks.promotionDetails);
