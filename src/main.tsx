import { render } from 'preact';
import { reopenLast } from './app/state.ts';
import { bindDocumentLang } from './i18n/index.ts';
import { startServiceWorker } from './sw/register.ts';
import { App, updateReady } from './ui/App.tsx';
import './ui/styles.css';

bindDocumentLang();
render(<App />, document.getElementById('app')!);
// Decision 6: reopen the last show when there is one; the start screen shows meanwhile.
void reopenLast();
void startServiceWorker((apply) => {
  updateReady.value = apply;
});
