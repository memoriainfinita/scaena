// Registers the service worker and reports new versions without applying them: the user decides when.

export type ApplyUpdate = () => void;

export async function startServiceWorker(onUpdate: (apply: ApplyUpdate) => void): Promise<void> {
  const sw = navigator.serviceWorker;
  if (!sw || import.meta.env.DEV) return;

  // Reload once when the user accepts a new version. A version accepted in another tab does not reload this one.
  let accepted = false;
  let reloading = false;
  sw.addEventListener('controllerchange', () => {
    if (reloading || !accepted) return;
    reloading = true;
    location.reload();
  });

  const registration = await sw.register('./sw.js', { scope: './' });

  const offer = (worker: ServiceWorker) =>
    onUpdate(() => {
      accepted = true;
      worker.postMessage({ type: 'skip-waiting' });
    });
  if (registration.waiting && sw.controller) offer(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && sw.controller) offer(worker);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') registration.update().catch(() => {});
  });
}
