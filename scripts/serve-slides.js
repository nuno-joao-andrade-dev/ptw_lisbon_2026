import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slidesDir = path.resolve(__dirname, '..', 'slides');
const port = Number(process.env.SLIDES_PORT || 3050);

const app = express();
app.use(express.static(slidesDir));

app.listen(port, () => {
  console.log('\n====================================================================');
  console.log('  Portugal Tech Week — Workshop Presentation Slides (White Theme)');
  console.log('  Speaker: Nuno João Andrade (www.linkedin.com/in/nuno-andrade-964b2416)');
  console.log(`  Interactive Deck URL: http://localhost:${port}`);
  console.log('====================================================================\n');
});
