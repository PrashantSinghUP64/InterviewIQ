const fs = require('fs');

let txt = fs.readFileSync('app/page.js', 'utf8');

// Replace textual mentions of Let's Prepare with InterviewIQ
txt = txt.replace(/Let's Prepare/g, 'InterviewIQ');
txt = txt.replace(/Let\\'s Prepare/g, 'InterviewIQ');

// Extract and remove floating cards (Target ATS Score and FAANG Ready floats on the hero visual card)
const floatStartStr = '<div class=\\"float-card float-card-1\\">';
const floatStartIndex = txt.indexOf(floatStartStr);

if (floatStartIndex !== -1) {
  // We need to remove float-card-1 and float-card-2 which ends right before closing divs.
  // The structure is: <div class="float-card float-card-1"> ... </div>\n    <div class="float-card float-card-2"> ... </div>\n  </div>
  // Let's find the closing of float-card-2 which should be 'Top 5% Score</div>\n    </div>'
  const floatEndRegex = /Top 5% Score<\/div>\\n\s*<\/div>/g;
  floatEndRegex.lastIndex = floatStartIndex;
  
  const match = floatEndRegex.exec(txt);
  if (match) {
    const floatEndIndex = match.index + match[0].length;
    txt = txt.slice(0, floatStartIndex) + txt.slice(floatEndIndex);
    console.log("Found and removed floating cards.");
  } else {
    console.log("Failed to find end of floating cards.");
  }
} else {
  console.log("Failed to find start of floating cards.");
}

fs.writeFileSync('app/page.js', txt, 'utf8');
console.log("Successfully updated app/page.js.");
