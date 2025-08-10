import React, { useEffect, useMemo, useRef, useState } from 'react';
import RouteCard from './components/RouteCard';

// Inline type for the manifest shape we care about
type ManifestData = Record<string, unknown>;

type WorkerOk = { ok: true; manifest: ManifestData };
type WorkerErr = { ok: false; error: string };

function useClipboardToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error'>('success');

  const show = (msg: string, kind: 'success' | 'error' = 'success') => {
    setType(kind);
    setMessage(msg);
  };

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(id);
  }, [message]);

  return { message, type, show };
}

async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (e) {}
}

function buildWorker() {
  const worker = new Worker(new URL('./workers/manifestWorker.ts', import.meta.url), { type: 'module' });
  return worker;
}

function extractRoutes(manifest: ManifestData): string[] {
  const reserved = new Set(['sortedPages', '__rewrites']);
  return Object.keys(manifest)
    .filter((key) => Array.isArray((manifest as any)[key]) && !reserved.has(key) && !key.startsWith('__'))
    .sort();
}

export default function App() {
  const [rawContent, setRawContent] = useState('');
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [manifest, setManifest] = useState<ManifestData>({});
  const [routes, setRoutes] = useState<string[]>([]);
  const [filter, setFilter] = useState('');

  const { message, type, show } = useClipboardToast();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = buildWorker();
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const filteredRoutes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((r) => r.toLowerCase().includes(q));
  }, [routes, filter]);

  const handleParse = async (contentOverride?: string) => {
    const content = (contentOverride ?? rawContent).trim();
    setManifest({});
    setRoutes([]);
    if (!content) {
      show('Input is empty. Please paste the manifest content.', 'error');
      return;
    }

    const worker = workerRef.current;
    if (!worker) {
      show('Internal error: worker not initialized.', 'error');
      return;
    }

    const response: WorkerOk | WorkerErr = await new Promise((resolve) => {
      const onMessage = (e: MessageEvent) => {
        worker.removeEventListener('message', onMessage as any);
        resolve(e.data as WorkerOk | WorkerErr);
      };
      worker.addEventListener('message', onMessage as any);
      worker.postMessage({ content });
    });

    if (!response.ok) {
      show(`Failed to parse manifest: ${response.error}`, 'error');
      return;
    }

    const data: ManifestData = response.manifest;
    const pageRoutes = extractRoutes(data);
    if (pageRoutes.length === 0) {
      show('No routes found in the manifest.', 'error');
      return;
    }

    setManifest(data);
    setRoutes(pageRoutes);
  };

  const handleFetch = async () => {
    const targetUrl = url.trim();
    if (!targetUrl) {
      show('Please enter a URL.', 'error');
      return;
    }

    setIsFetching(true);
    try {
      const res = await fetch(targetUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const content = await res.text();
      setRawContent(content);
      await handleParse(content);
    } catch (e: any) {
      show(`Failed to fetch manifest. Please manually insert the content of the _buildManifest.js file. ${e?.message || ''}`.trim(), 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleClear = () => {
    setRawContent('');
    setUrl('');
    setManifest({});
    setRoutes([]);
    setFilter('');
  };

  const copyAllRoutes = async () => {
    if (routes.length === 0) return;
    await copyToClipboard(routes.join('\n'));
    show('All Routes Copied!', 'success');
  };

  const copyAllFilesWithExt = async (ext: string) => {
    if (!manifest || Object.keys(manifest).length === 0) return;
    const setFiles = new Set<string>();
    for (const route of Object.keys(manifest)) {
      const val = (manifest as any)[route];
      if (Array.isArray(val)) {
        for (const file of val) {
          if (typeof file === 'string' && file.endsWith(ext)) setFiles.add(file);
        }
      }
    }
    const arr = Array.from(setFiles).sort();
    if (arr.length > 0) {
      await copyToClipboard(arr.join('\n'));
      show(`All ${ext.toUpperCase()} files copied!`, 'success');
    } else {
      show(`No ${ext.toUpperCase()} files found to copy.`, 'error');
    }
  };

  const onCopy = async (text: string) => {
    await copyToClipboard(text);
    show('Copied!', 'success');
  };

  return (
    <div className="relative min-h-screen text-gray-100 flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-700/40 via-gray-900 to-sky-700/30 -z-10" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:bg-gray-900/40">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Next.js Build Manifest Parser</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 space-y-8 flex-1">
        <section className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl p-6 space-y-4">
            <div>
              <label htmlFor="manifestUrl" className="block text-sm font-medium text-white/80 mb-2">Fetch from URL</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input id="manifestUrl" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/_next/static/.../_buildManifest.js" className="flex-grow h-11 px-3 bg-gray-900/60 border border-white/10 rounded-md text-gray-100 placeholder:text-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-fira text-sm" />
                <button onClick={handleFetch} disabled={isFetching} className="h-11 inline-flex items-center justify-center gap-2 text-white font-semibold px-4 rounded-md transition-all duration-200 disabled:opacity-60 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-emerald-900/20">
                  {isFetching && (
                    <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span>Fetch & Parse</span>
                </button>
              </div>
              <p className="text-xs text-white/60 mt-2">If the request is blocked by CORS, download the file and paste its content below.</p>
            </div>

            <div className="text-center text-white/50 text-sm">OR</div>

            <div>
              <label htmlFor="manifestInput" className="block text-sm font-medium text-white/80 mb-2">Paste Manifest Content</label>
              <textarea id="manifestInput" rows={10} value={rawContent} onChange={(e) => setRawContent(e.target.value)} placeholder="self.__BUILD_MANIFEST = (function(s){...})(...);" className="w-full p-3 bg-gray-900/60 border border-white/10 rounded-md text-gray-100 placeholder:text-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-fira text-sm" />
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button onClick={() => handleParse()} className="h-11 w-full sm:w-auto flex-1 text-white font-semibold px-4 rounded-md transition-all duration-200 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-indigo-900/20">Parse Content</button>
                <button onClick={handleClear} className="h-11 w-full sm:w-auto flex-1 text-white font-semibold px-4 rounded-md transition-all duration-200 bg-gradient-to-r from-slate-600/60 to-slate-700/60 hover:from-slate-600 hover:to-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 shadow-md shadow-slate-900/10">Clear All</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white/80">Tools</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 w-24">Filter</span>
                <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="/docs, /about" className="flex-1 h-10 px-3 bg-gray-900/60 border border-white/10 rounded-md text-gray-100 placeholder:text-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={copyAllRoutes} className="h-10 w-full text-white font-medium px-4 rounded-md transition-all bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-emerald-900/20">Copy All Routes</button>
                <button onClick={() => copyAllFilesWithExt('.js')} className="h-10 w-full text-white font-medium px-4 rounded-md transition-all bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-sky-900/20">Copy All JS Files</button>
                <button onClick={() => copyAllFilesWithExt('.css')} className="h-10 w-full text-white font-medium px-4 rounded-md transition-all bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-rose-900/20 sm:col-span-2">Copy All CSS Files</button>
              </div>
              <div className="text-xs text-white/60">{routes.length > 0 ? `Discovered ${routes.length} Routes` : 'No routes parsed yet'}</div>
            </div>
          </div>
        </section>

        {routes.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Routes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoutes.map((route) => (
                <RouteCard key={route} route={route} files={(manifest as any)[route] as string[]} onCopy={onCopy} />
              ))}
            </div>
          </section>
        )}
      </main>

      {message && (
        <div className={`fixed bottom-5 right-5 z-50 text-white py-2 px-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-bounce`}>
          <p>{message}</p>
        </div>
      )}

      <footer className="border-t border-white/10 bg-gray-900/60 backdrop-blur py-6 mt-auto">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base text-white/70">
            <span>Built by</span>
            <a href="https://x.com/Sharo_k_h" className="font-semibold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent hover:from-indigo-300 hover:to-sky-300 transition-colors">Sharo_k_h :)</a>
            
          </div>
        </div>
      </footer>
    </div>
  );
} 