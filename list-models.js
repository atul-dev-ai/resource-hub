require('dotenv').config({ path: '.env.local' });
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log(data.models.map(m => m.name).filter(n => n.includes('gemini')).join('\n'));
    } else {
      console.log("No models returned", data);
    }
  })
  .catch(console.error);
