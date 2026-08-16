const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'plugins');
const hits = [];
for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.js'))) {
  try {
    const loaded = require(path.join(dir, file));
    const mods = Array.isArray(loaded) ? loaded : [loaded];
    for (const mod of mods) {
      for (const command of (mod?.commands || [])) {
        if (/^(ai|gpt|gemini|bard|venice|openai|assistant|imagine|summarize|summary|tldr|translate|describe|caption)$/i.test(command)) hits.push({ file, command });
      }
    }
  } catch {}
}
console.log(JSON.stringify(hits, null, 2));
if (hits.length) process.exitCode = 1;
