const fs = require('fs');

try {
  const content = fs.readFileSync('app/page.js', 'utf8');

  // If it's already a React component, abort!
  if (content.includes('"use client"') || content.includes('import React')) {
    console.log("File is already a React component.");
    process.exit(0);
  }

  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) throw new Error("Could not find <style>");
  const css = styleMatch[1];

  const bodyStartIndex = content.indexOf('<body>') + 6;
  const scriptStartIndex = content.lastIndexOf('<script>');
  const bodyHtml = content.slice(bodyStartIndex, scriptStartIndex);

  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  const jsCode = scriptMatch ? scriptMatch[1] : '';

  const reactCode = `"use client";
import React, { useEffect } from 'react';

export default function HTMLPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        (function() {
          ${jsCode}
        })();
      } catch(e) {
        console.error("Custom script error", e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />
      <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(bodyHtml)} }} />
    </>
  );
}
`;

  fs.writeFileSync('app/page.js', reactCode, 'utf8');
  console.log("Successfully compiled raw HTML into Next.js React component.");
} catch(e) {
  console.error("Failed:", e);
}
