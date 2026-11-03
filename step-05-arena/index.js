import { CONFIG } from '../shared/config.js';
import { OllamaGemma4Client } from '../shared/client.js';
import { ANSI, printPtwBanner } from '../shared/terminalUi.js';
import { createArenaApp } from './server.js';

async function main() {
  printPtwBanner(
    '05 (75-90m)',
    'THE LIVE PITCH ARENA FINALE (PORTUGAL TECH WEEK WEB UI)',
    'Express SSE Backend + React Frontend + Local Ollama (gemma4:e2b)'
  );

  const client = new OllamaGemma4Client();
  try {
    const status = await client.verifyConnection();
    console.log(`  ${ANSI.green}${ANSI.bold}✓ Local Ollama Ready:${ANSI.reset} ${status.host} (${status.model})`);
  } catch (err) {
    console.warn(`  ${ANSI.yellow}⚠ Local Ollama Warning:${ANSI.reset} ${err.message}`);
  }

  const app = await createArenaApp({ attachViteMiddleware: true });
  const port = CONFIG.serverPort || 4000;

  app.listen(port, '0.0.0.0', () => {
    console.log(
      `\n  🚀 ${ANSI.yellow}${ANSI.bold}Portugal Tech Week Pitch Arena UI is live at:${ANSI.reset} ${ANSI.cyan}${ANSI.bold}http://localhost:${port}${ANSI.reset}\n`
    );
  });
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}✖ Step 05 Error:${ANSI.reset} ${err.message}`);
  process.exit(1);
});
