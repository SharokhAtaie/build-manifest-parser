// Self-contained worker to evaluate Next.js _buildManifest.js safely-ish by shadowing `self`
// and returning `self.__BUILD_MANIFEST` without touching the worker global.

export type WorkerRequest = {
  content: string;
};

export type WorkerResponse = {
  ok: true;
  manifest: Record<string, unknown>;
} | {
  ok: false;
  error: string;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { content } = event.data;

  try {
    const sandboxSelf: Record<string, unknown> = {};

    // Provide a local `self` parameter to the evaluated function so any references
    // to `self` inside the manifest code resolve to our sandbox object.
    const evaluator = new Function('self', `${content}; return self.__BUILD_MANIFEST;`) as (sandbox: Record<string, unknown>) => unknown;
    const manifest = evaluator(sandboxSelf) as Record<string, unknown>;

    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Manifest did not evaluate to an object.');
    }

    const response: WorkerResponse = { ok: true, manifest };
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const response: WorkerResponse = { ok: false, error: (err as Error).message };
    (self as unknown as Worker).postMessage(response);
  }
}; 