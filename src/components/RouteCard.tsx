import React from 'react';

export type RouteCardProps = {
  route: string;
  files: string[];
  onCopy: (text: string) => void;
};

export default function RouteCard({ route, files, onCopy }: RouteCardProps) {
  const copy = (items: string[]) => {
    if (items.length > 0) onCopy(items.join('\n'));
  };

  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-indigo-500/20 text-indigo-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-indigo-200 font-fira break-all">{route}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="inline-flex items-center gap-1 text-white text-xs font-medium py-1.5 px-3 rounded-full transition-all bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-indigo-900/20" onClick={() => copy(files)}>
            <svg className="opacity-90" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy All
          </button>
          <button className="inline-flex items-center gap-1 text-white text-xs font-medium py-1.5 px-3 rounded-full transition-all bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-sky-900/20" onClick={() => copy(jsFiles)}>
            <svg className="opacity-90" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M7 17h2v-2H7zM11 17h6v-2h-6zM7 13h10v-2H7zM7 9h10V7H7z"/></svg>
            Copy JS
          </button>
          <button className="inline-flex items-center gap-1 text-white text-xs font-medium py-1.5 px-3 rounded-full transition-all bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shadow-md shadow-rose-900/20" onClick={() => copy(cssFiles)}>
            <svg className="opacity-90" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 9h16"/></svg>
            Copy CSS
          </button>
        </div>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file} className="text-gray-200/90 font-fira text-sm flex items-center break-all">
              <span className="mr-2 text-indigo-400/70 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">└─</span>
              <span className="truncate">{file}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 