async function test() {
  try {
    const fileUrl = "https://dndcrhcsythuuokydpim.supabase.co/storage/v1/object/public/academic_resources/86f2b46e-db29-4f1f-ac00-509c323c12c3/1778421610856-Lecture_4_pdf.pdf";
    console.log("Fetching PDF:", fileUrl);
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    console.log("Extracted text length:", pdfData.text.length);
    console.log("Text preview:", pdfData.text.substring(0, 500));
  } catch (e) {
    console.error("Parse failed:", e);
  }
}
test();
