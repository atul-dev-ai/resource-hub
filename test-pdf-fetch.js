const fs = require('fs');
const pdfParse = require('pdf-parse');
async function run() {
  try {
    const res = await fetch('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    
    const data = await pdfParse(buf);
    console.log("Success with pdfParse directly!", data.text.substring(0, 50));
  } catch(e) {
    console.error(e);
  }
}
run();
