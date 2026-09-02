const fs = require('fs');
const file = 'app/page.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<!-- Social Links with proper SVG icons \(Bug Fix\) -->[\s\S]*?<\/div>/, '');
content = content.replace(/<div class=\\"footer-links\\">\n      <h4>Connect<\/h4>[\s\S]*?<\/div>/, '');
content = content.replace(/<p class=\\"built-by\\">Built by <a href=\\"https:\/\/linkedin\.com\/in\/prashant-kumar-singh-51b225230\\" target=\\"_blank\\">Prashant Kumar Singh<\/a> · B\.Tech CSE \(AI\/ML\)<\/p>/, '');
fs.writeFileSync(file, content);
console.log("Done!");
