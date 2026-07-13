// Loads Mapbox GL JS from the CDN and resolves the global `mapboxgl`.
//
// We deliberately do NOT `import('mapbox-gl')` from npm: the esbuild-minified
// production bundle mangles Mapbox's inlined web-worker code, which throws
// "ReferenceError: <minified var> is not defined" during tile parsing and
// leaves a blank map (only in the minified prod build, not in `ng serve`).
// The pre-built CDN UMD ships an intact worker, sidestepping the bundler.
//
// Version is pinned to match the Mapbox CSS already loaded in index.html.

const MAPBOX_JS = 'https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.js';
let loader: Promise<any> | null = null;

export function loadMapbox(): Promise<any> {
  const existing = (window as any).mapboxgl;
  if (existing) return Promise.resolve(existing);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => {
      const gl = (window as any).mapboxgl;
      if (gl) resolve(gl);
      else reject(new Error('mapbox-gl loaded but global is missing'));
    };
    script.onerror = () => {
      loader = null; // allow a retry on next attempt
      reject(new Error('Failed to load mapbox-gl from CDN'));
    };
    document.head.appendChild(script);
  });
  return loader;
}
