const fs = require('fs');
let content = fs.readFileSync('c:/Users/ps702/Documents/InterviewIQ/app/page.js', 'utf8');

let initialContent = content;

// Let's use simpler substrings that avoid tricky <\/a> escaping entirely.
// Instead of matching the whole tag, match just the distinctive parts.

const replacements = [
  // Nav CTA
  ['<a href=\\"#start\\" class=\\"nav-cta\\">Start Free', '<a href=\\"/sign-in\\" class=\\"nav-cta\\">Start Free'],
  // Hero CTA
  ['<a href=\\"#\\" class=\\"btn-primary\\">🚀 Start Interview Free', '<a href=\\"/sign-in\\" class=\\"btn-primary\\">🚀 Start Interview Free'],
  // Tracking CTA
  ['<a href=\\"#\\" class=\\"btn-primary\\" style=\\"display:inline-flex;\\">Start Tracking', '<a href=\\"/sign-in\\" class=\\"btn-primary\\" style=\\"display:inline-flex;\\">Start Tracking'],
  // Bottom CTA
  ['<a href=\\"#\\" class=\\"btn-primary\\">🚀 Start Free Interview', '<a href=\\"/sign-in\\" class=\\"btn-primary\\">🚀 Start Free Interview'],
  // View Dashboard
  ['<a href=\\"#\\" class=\\"btn-secondary\\">📊 View Dashboard', '<a href=\\"/dashboard\\" class=\\"btn-secondary\\">📊 View Dashboard'],
  // Footer Dashboard
  ['<a href=\\"#\\">Dashboard<', '<a href=\\"/dashboard\\">Dashboard<']
];

let matchCount = 0;
replacements.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    matchCount++;
    console.log(`Successfully replaced:`, from);
  } else {
    console.log(`Could not find string:`, from);
  }
});

if (content !== initialContent) {
  fs.writeFileSync('c:/Users/ps702/Documents/InterviewIQ/app/page.js', content, 'utf8');
  console.log("Successfully updated app/page.js!");
  console.log("Modifications made:", content.length - initialContent.length);
} else {
  console.log("No modifications were made. The file content is the same.");
}
