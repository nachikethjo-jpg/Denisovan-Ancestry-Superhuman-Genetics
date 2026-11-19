/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const VALID_SHARE_GENE_IDS = new Set([
  'epas1',
  'fam178b',
  'lrp5',
  'dec2',
  'faahout',
  'actn3',
]);

export interface SharedGenomeUrlState {
  genes: string[];
  gwasGeneId: string | null;
  hasSharedParams: boolean;
}

/**
 * Parses CRISPR Lab gene selections (`genes`) and GWAS peak selection (`gwas`)
 * from a URL search string, validating every identifier against the allowed vault.
 */
export function parseShareStateFromSearch(search: string): SharedGenomeUrlState {
  const params = new URLSearchParams(search);
  const rawGenes = params.get('genes');
  const rawGwas = params.get('gwas');

  const genes: string[] = [];
  if (rawGenes) {
    const seen = new Set<string>();
    for (const token of rawGenes.split(',')) {
      const normalized = token.trim().toLowerCase();
      if (VALID_SHARE_GENE_IDS.has(normalized) && !seen.has(normalized)) {
        seen.add(normalized);
        genes.push(normalized);
      }
    }
  }

  const normalizedGwas = rawGwas ? rawGwas.trim().toLowerCase() : null;
  const gwasGeneId =
    normalizedGwas && VALID_SHARE_GENE_IDS.has(normalizedGwas) ? normalizedGwas : null;

  return {
    genes,
    gwasGeneId,
    hasSharedParams: genes.length > 0 || gwasGeneId !== null,
  };
}

/**
 * Builds an absolute shareable URL encoding the current CRISPR Lab genes and GWAS peak.
 */
export function buildShareUrl(options: {
  genes: string[];
  gwasGeneId: string | null;
  section?: 'crispr' | 'gwas';
}): string {
  if (typeof window === 'undefined') return '';

  const cleanGenes = Array.from(
    new Set(
      options.genes
        .map((g) => g.trim().toLowerCase())
        .filter((g) => VALID_SHARE_GENE_IDS.has(g))
    )
  );

  const cleanGwas =
    options.gwasGeneId && VALID_SHARE_GENE_IDS.has(options.gwasGeneId.toLowerCase())
      ? options.gwasGeneId.toLowerCase()
      : null;

  const url = new URL(window.location.origin + window.location.pathname);

  if (cleanGenes.length > 0) {
    url.searchParams.set('genes', cleanGenes.join(','));
  }
  if (cleanGwas) {
    url.searchParams.set('gwas', cleanGwas);
  }
  if (options.section) {
    url.hash = options.section;
  }

  return url.toString();
}

/**
 * Synchronizes the browser address bar query string with current state using replaceState.
 */
export function syncUrlWithState(options: {
  genes: string[];
  gwasGeneId: string | null;
}): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const cleanGenes = Array.from(
    new Set(
      options.genes
        .map((g) => g.trim().toLowerCase())
        .filter((g) => VALID_SHARE_GENE_IDS.has(g))
    )
  );

  if (cleanGenes.length > 0) {
    url.searchParams.set('genes', cleanGenes.join(','));
  } else {
    url.searchParams.delete('genes');
  }

  if (options.gwasGeneId && VALID_SHARE_GENE_IDS.has(options.gwasGeneId.toLowerCase())) {
    url.searchParams.set('gwas', options.gwasGeneId.toLowerCase());
  } else {
    url.searchParams.delete('gwas');
  }

  const nextRelative = `${url.pathname}${url.search}${url.hash}`;
  const currentRelative = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextRelative !== currentRelative) {
    window.history.replaceState(null, '', nextRelative);
  }
}

/**
 * Copies text to clipboard using the modern Clipboard API with a safe textarea fallback
 * for sandboxed iframe environments.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const succeeded = document.execCommand('copy');
      document.body.removeChild(textarea);
      return succeeded;
    } catch {
      return false;
    }
  }

  return false;
}
