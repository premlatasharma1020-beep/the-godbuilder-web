(() => {
  const bucket = 'https://rnqhxeuxheahnddkglzq.supabase.co/storage/v1/object/public/app-releases';
  const latestManifest = `${bucket}/latest.json`;

  async function resolveLatestApk(manifestUrl = latestManifest, fetcher = fetch) {
    const response = await fetcher(manifestUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Release manifest unavailable');
    const release = await response.json();
    if (!Number.isInteger(release.versionCode) || release.versionCode < 1 ||
        !/^the-god-builder-\d+\.apk$/.test(release.apkPath || '') ||
        release.apkPath !== `the-god-builder-${release.versionCode}.apk` ||
        !/^[a-f\d]{64}$/i.test(release.sha256 || '')) {
      throw new Error('Invalid release manifest');
    }
    return `${bucket}/${encodeURIComponent(release.apkPath)}`;
  }

  async function updateDownloadLinks(doc = document, resolver = resolveLatestApk) {
    let url;
    try { url = await resolver(); } catch { return; }
    for (const link of doc.querySelectorAll('[data-latest-apk]')) link.href = url;
  }

  if (typeof document !== 'undefined') updateDownloadLinks();
  if (typeof module !== 'undefined') module.exports = { resolveLatestApk, updateDownloadLinks };
})();
