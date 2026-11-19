/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, BookOpen, Dna, LogOut, ArrowUpRight, Share2, Check } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { GENETIC_GLOSSARY } from './GeneticTermOverlay';
import { SUPERHUMAN_GENES } from './Diagrams';
import { buildShareUrl, copyTextToClipboard } from '../utils/shareState';

interface ResearchNotebookDrawerProps {
  open: boolean;
  onClose: () => void;
  onLoadGenome: (geneIds: string[]) => void;
  activeGwasGeneId?: string | null;
}

export const ResearchNotebookDrawer: React.FC<ResearchNotebookDrawerProps> = ({
  open,
  onClose,
  onLoadGenome,
  activeGwasGeneId = null,
}) => {
  const {
    user,
    savedGenomes,
    savedTerms,
    removeGenome,
    toggleBookmarkTerm,
    signOutUser,
  } = useFirebase();
  const [activeTab, setActiveTab] = useState<'genomes' | 'terms'>('genomes');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySavedLink = async (id: string, geneIds: string[]) => {
    const url = buildShareUrl({
      genes: geneIds,
      gwasGeneId: activeGwasGeneId,
      section: 'crispr',
    });
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="Research Notebook"
        className="relative z-10 w-full max-w-md bg-[#F9F8F4] h-full border-l border-stone-200 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-stone-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Synced Research Notebook</p>
            <h2 className="font-serif text-xl text-stone-900 truncate mt-0.5">
              {user.displayName || 'Researcher'}
            </h2>
            <p className="text-xs font-mono text-stone-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notebook"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Segmented Tab Controls */}
        <div className="px-6 pt-4 pb-3 bg-[#F9F8F4] border-b border-stone-200">
          <div className="grid grid-cols-2 gap-1 p-1 bg-stone-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('genomes')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'genomes'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Dna size={13} />
              <span>Saved Genomes ({savedGenomes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen size={13} />
              <span>Glossary ({savedTerms.length})</span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {activeTab === 'genomes' ? (
            savedGenomes.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
                <p className="font-serif text-base text-stone-900">No saved genomes yet</p>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Splice mutations in the CRISPR Lab below and click Save Profile to keep
                  track of your custom genomic combinations here.
                </p>
              </div>
            ) : (
              savedGenomes.map((item) => {
                const geneLabels = item.geneIds
                  .map((gid) => SUPERHUMAN_GENES.find((g) => g.id === gid)?.geneName || gid)
                  .join(' · ');

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-serif text-base font-semibold text-stone-900 truncate">
                          {item.label}
                        </h3>
                        <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                          {geneLabels}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold tabular-nums text-stone-700 shrink-0">
                        {item.synergyIndex}% synergy
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadGenome(item.geneIds);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-stone-900 hover:text-amber-800 transition-colors"
                        >
                          <span>Load in Lab</span>
                          <ArrowUpRight size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopySavedLink(item.id, item.geneIds)}
                          className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check size={13} className="text-teal-700" />
                          ) : (
                            <Share2 size={13} />
                          )}
                          <span>{copiedId === item.id ? 'Copied' : 'Copy Link'}</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGenome(item.id)}
                        aria-label={`Delete ${item.label}`}
                        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : savedTerms.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center">
              <p className="font-serif text-base text-stone-900">
                No bookmarked genetic terms
              </p>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Hover over any dotted genetic term in the text to open its simplified
                definition card, then click Save to build your personal glossary.
              </p>
            </div>
          ) : (
            savedTerms.map((saved) => {
              const entry = GENETIC_GLOSSARY[saved.termKey];
              return (
                <div
                  key={saved.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-stone-500">{saved.category}</p>
                      <h3 className="font-serif text-base font-semibold text-stone-900">
                        {saved.termLabel}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmarkTerm({
                          termKey: saved.termKey,
                          termLabel: saved.termLabel,
                          category: saved.category,
                        })
                      }
                      aria-label={`Remove ${saved.termLabel}`}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {entry && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {entry.plainDefinition}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">Stored privately in Firestore</span>
          <button
            type="button"
            onClick={async () => {
              await signOutUser();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
