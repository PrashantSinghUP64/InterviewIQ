const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\bbg-slate-950(\/[0-9]+)?\b/g, toLight: "bg-slate-50", toDark: "dark:bg-slate-950" },
  { regex: /\bbg-slate-900(\/[0-9]+)?\b/g, toLight: "bg-white", toDark: "dark:bg-slate-900" },
  { regex: /\bbg-slate-800(\/[0-9]+)?\b/g, toLight: "bg-slate-100", toDark: "dark:bg-slate-800" },
  { regex: /\bbg-slate-700(\/[0-9]+)?\b/g, toLight: "bg-slate-200", toDark: "dark:bg-slate-700" },
  { regex: /\bbg-slate-600(\/[0-9]+)?\b/g, toLight: "bg-slate-300", toDark: "dark:bg-slate-600" },
  { regex: /\bborder-slate-800(\/[0-9]+)?\b/g, toLight: "border-slate-200", toDark: "dark:border-slate-800" },
  { regex: /\bborder-slate-700(\/[0-9]+)?\b/g, toLight: "border-slate-300", toDark: "dark:border-slate-700" },
  { regex: /\bborder-slate-600(\/[0-9]+)?\b/g, toLight: "border-slate-400", toDark: "dark:border-slate-600" },
  { regex: /\bborder-slate-500(\/[0-9]+)?\b/g, toLight: "border-slate-400", toDark: "dark:border-slate-500" },
  { regex: /\btext-slate-100(\/[0-9]+)?\b/g, toLight: "text-slate-900", toDark: "dark:text-slate-100" },
  { regex: /\btext-slate-200(\/[0-9]+)?\b/g, toLight: "text-slate-800", toDark: "dark:text-slate-200" },
  { regex: /\btext-slate-300(\/[0-9]+)?\b/g, toLight: "text-slate-700", toDark: "dark:text-slate-300" },
  { regex: /\btext-slate-400(\/[0-9]+)?\b/g, toLight: "text-slate-600", toDark: "dark:text-slate-400" },
  { regex: /\bring-slate-700(\/[0-9]+)?\b/g, toLight: "ring-slate-300", toDark: "dark:ring-slate-700" },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (fullPath.includes('app\\page.js') || fullPath.includes('app/page.js')) continue;
      if (fullPath.includes('ThemeProvider.jsx')) continue;
      if (fullPath.includes('ThemeToggle.jsx')) continue;
      
      let code = fs.readFileSync(fullPath, 'utf8');
      let originalCode = code;
      
      for (const rule of replacements) {
        code = code.replace(rule.regex, (match, opacityGroup, offset, fullString) => {
          const preceding = fullString.substring(Math.max(0, offset - 5), offset);
          if (preceding.includes('dark:')) return match;
          const opacity = opacityGroup || '';
          return `${rule.toLight}${opacity} ${rule.toDark}${opacity}`;
        });
      }

      // Explicit manual string replacements for core background containers
      code = code.replaceAll("min-h-screen bg-slate-950 text-white flex", "min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white flex");
      code = code.replaceAll("bg-slate-950 text-slate-100", "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100");

      if (code !== originalCode) {
        fs.writeFileSync(fullPath, code);
        console.log('Updated:', fullPath);
      }
    }
  }
}

console.log('Starting global theme mapping...');
processDir(path.join(__dirname, 'app'));
console.log('Done.');
