import { render } from 'preact';

function App() {
  return (
    <main>
      <h1>scaena</h1>
      <p>v{__APP_VERSION__}</p>
    </main>
  );
}

render(<App />, document.getElementById('app')!);
