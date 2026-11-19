/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, BookmarkCheck, BookOpen } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

export interface GeneticTermEntry {
  key: string;
  term: string;
  pronunciation: string;
  category: string;
  plainDefinition: string;
  example: string;
}

export const GENETIC_GLOSSARY: Record<string, GeneticTermEntry> = {
  'adaptive-introgression': {
    key: 'adaptive-introgression',
    term: 'Adaptive Introgression',
    pronunciation: 'uh-DAP-tiv in-troh-GRESH-un',
    category: 'Evolutionary Genomics',
    plainDefinition:
      'When two related species interbreed and a useful gene variant from one species spreads rapidly in the other because it helps individuals survive in a harsh environment.',
    example:
      'Early modern humans inherited the EPAS1 altitude gene from Denisovans, which later helped Tibetans thrive above 14,000 feet.',
  },
  phenotype: {
    key: 'phenotype',
    term: 'Phenotype',
    pronunciation: 'FEE-noh-type',
    category: 'Molecular Genetics',
    plainDefinition:
      'The observable physical or biological traits of an organism—such as bone density, spleen size, blood oxygen levels, or sleep needs—shaped by genes and environment.',
    example:
      'A 50% larger spleen in Bajau freedivers is a physiological phenotype linked to variation near the PDE10A gene.',
  },
  epas1: {
    key: 'epas1',
    term: 'EPAS1 Gene',
    pronunciation: 'EE-pass-one',
    category: 'Hypoxia Physiology',
    plainDefinition:
      'A master oxygen-sensing gene (encoding HIF-2α) that controls how many red blood cells the body makes when oxygen is scarce.',
    example:
      'The Denisovan EPAS1 variant dampens red blood cell overproduction at high altitude so blood stays fluid rather than dangerously thick.',
  },
  fam178b: {
    key: 'fam178b',
    term: 'FAM178B Gene',
    pronunciation: 'fam-one-seven-eight-BEE',
    category: 'Marine Adaptation',
    plainDefinition:
      'A gene involved in carbonic anhydrase activity that helps balance blood acidity by buffering dissolved carbon dioxide during long breath-holds.',
    example:
      'Inherited from Denisovans, this variant helps Bajau divers resist the urgent panic reflex triggered by CO₂ buildup underwater.',
  },
  hypoxia: {
    key: 'hypoxia',
    term: 'Hypoxia',
    pronunciation: 'hy-POK-see-uh',
    category: 'Respiratory Biology',
    plainDefinition:
      'A state in which body tissues do not receive enough oxygen—commonly experienced on high mountain plateaus or during deep breath-hold dives.',
    example:
      'At Everest Base Camp (17,600 ft), each breath contains roughly half the available oxygen molecules compared to sea level.',
  },
  admixture: {
    key: 'admixture',
    term: 'Genetic Admixture',
    pronunciation: 'ad-MIKS-cher',
    category: 'Population Genetics',
    plainDefinition:
      'The mixing of DNA between two previously separated populations or hominin lineages through interbreeding, creating a mosaic genome.',
    example:
      'Modern Melanesian and Philippine Ayta genomes retain up to 5% Denisovan DNA from ancient admixture events in Eurasia and Island Southeast Asia.',
  },
  recombination: {
    key: 'recombination',
    term: 'Genetic Recombination',
    pronunciation: 'ree-kom-bih-NAY-shun',
    category: 'Chromosomal Biology',
    plainDefinition:
      'The natural shuffling of DNA segments between paired chromosomes when egg and sperm cells form, creating new combinations of ancestral gene variants.',
    example:
      'Over thousands of generations, recombination trimmed long stretches of Denisovan chromosomes down to compact, useful blocks like the EPAS1 region.',
  },
  gwas: {
    key: 'gwas',
    term: 'Genome-Wide Association Study (GWAS)',
    pronunciation: 'GEE-wahss',
    category: 'Statistical Genomics',
    plainDefinition:
      'A large-scale scan comparing millions of DNA markers across thousands of people to pinpoint exact genetic locations statistically tied to a trait or disease.',
    example:
      'Each towering peak on a Manhattan plot marks a chromosome region where a variant strongly predicts an extreme human trait.',
  },
  'gain-of-function': {
    key: 'gain-of-function',
    term: 'Gain-of-Function Mutation',
    pronunciation: 'GAYN-ov-FUNK-shun',
    category: 'Molecular Genetics',
    plainDefinition:
      'A DNA change that gives a protein stronger activity or a brand-new capability rather than shutting it down.',
    example:
      'A gain-of-function change in LRP5 keeps bone-building signals switched on continuously, producing unusually dense, fracture-resistant skeletons.',
  },
  microdeletion: {
    key: 'microdeletion',
    term: 'Microdeletion',
    pronunciation: 'MY-kroh-dee-LEE-shun',
    category: 'Structural Genomics',
    plainDefinition:
      'A tiny missing stretch of chromosome—often too small to see under a standard microscope—that removes or disrupts regulatory DNA.',
    example:
      'A microdeletion in the FAAH-OUT pseudogene reduces FAAH enzyme activity, leading to lifelong insensitivity to pain and anxiety.',
  },
  anandamide: {
    key: 'anandamide',
    term: 'Anandamide',
    pronunciation: 'uh-NAN-duh-myde',
    category: 'Neurochemistry',
    plainDefinition:
      'A naturally produced endocannabinoid signaling molecule in the nervous system that dampens pain signals, lowers fear, and supports wound recovery.',
    example:
      'When FAAH enzyme breakdown is silenced, elevated anandamide levels block acute pain perception.',
  },
  'crispr-cas9': {
    key: 'crispr-cas9',
    term: 'CRISPR-Cas9',
    pronunciation: 'KRIS-per kass-NINE',
    category: 'Gene Editing',
    plainDefinition:
      'A programmable molecular tool using a guide RNA and the Cas9 enzyme to locate a precise DNA sequence, cut it, and insert or edit targeted letters.',
    example:
      'Clinically approved to treat sickle-cell disease, CRISPR could theoretically introduce rare protective alleles directly into human cells.',
  },
  pde10a: {
    key: 'pde10a',
    term: 'PDE10A Gene',
    pronunciation: 'pee-dee-ee-ten-AY',
    category: 'Endocrine Genetics',
    plainDefinition:
      'A gene regulating thyroid hormone signaling, which in turn influences organ growth—including the size of the human spleen.',
    example:
      'Natural selection on PDE10A in Bajau populations enlarges the spleen so it can inject extra oxygen-rich red blood cells during dives.',
  },
  haplotype: {
    key: 'haplotype',
    term: 'Haplotype',
    pronunciation: 'HAP-loh-type',
    category: 'Population Genetics',
    plainDefinition:
      'A cluster of neighboring DNA variants located together on the same chromosome that tend to be inherited as a single linked block.',
    example:
      'A 32,000-base-pair haplotype around EPAS1 in Tibetans matches the Altai Denisovan genome almost letter for letter.',
  },
  nociception: {
    key: 'nociception',
    term: 'Nociception',
    pronunciation: 'noh-sih-SEP-shun',
    category: 'Neurophysiology',
    plainDefinition:
      'The nervous system’s rapid sensory alarm network that detects heat, pressure, or tissue injury and signals the brain to withdraw from danger.',
    example:
      'Without functioning nociception, individuals can suffer silent burns or joint wear because no warning pain registers.',
  },
};

interface GeneticTermProps {
  termKey: keyof typeof GENETIC_GLOSSARY | string;
  children?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export const GeneticTerm: React.FC<GeneticTermProps> = ({
  termKey,
  children,
  variant = 'light',
}) => {
  const entry = GENETIC_GLOSSARY[termKey];
  const { isTermBookmarked, toggleBookmarkTerm, user } = useFirebase();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  }>({ top: 0, left: 0, placement: 'top' });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cardWidth = 320;
    const estimatedHeight = 225;
    const margin = 12;

    const showBelow = rect.top < estimatedHeight + 24;
    const placement: 'top' | 'bottom' = showBelow ? 'bottom' : 'top';
    const top = showBelow ? rect.bottom + 10 : rect.top - 10;

    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, left));

    setCoords({ top, left, placement });
  }, []);

  const clearCloseTimer = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleOpen = () => {
    clearCloseTimer();
    updatePosition();
    setOpen(true);
  };

  const handleScheduleClose = () => {
    clearCloseTimer();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    if (!open) return;
    const handleScrollOrResize = () => updatePosition();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  if (!entry) {
    return <span>{children}</span>;
  }

  const bookmarked = isTermBookmarked(entry.key);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    try {
      await toggleBookmarkTerm({
        termKey: entry.key,
        termLabel: entry.term,
        category: entry.category,
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerClasses =
    variant === 'dark'
      ? 'inline cursor-help font-medium text-amber-200 border-b border-dotted border-amber-400/70 hover:text-amber-100 hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-xs transition-colors duration-150'
      : 'inline cursor-help font-medium text-stone-900 border-b border-dotted border-amber-700/60 hover:bg-amber-100/60 hover:border-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/50 rounded-xs transition-colors duration-150';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleOpen}
        onMouseLeave={handleScheduleClose}
        onFocus={handleOpen}
        onBlur={handleScheduleClose}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            handleOpen();
          }
        }}
        aria-describedby={open ? `glossary-card-${entry.key}` : undefined}
        className={triggerClasses}
      >
        {children ?? entry.term}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id={`glossary-card-${entry.key}`}
            role="tooltip"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={handleScheduleClose}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: 320,
              transform:
                coords.placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
              zIndex: 9999,
            }}
            className="bg-white text-stone-800 border border-stone-200 rounded-xl shadow-[0_14px_38px_-10px_rgba(20,20,19,0.24)] p-4 transition-opacity duration-150"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <BookOpen size={12} className="text-amber-700 shrink-0" />
                  <span className="truncate">{entry.category}</span>
                </div>
                <h4 className="font-serif text-base font-semibold text-stone-900 leading-snug mt-0.5">
                  {entry.term}
                </h4>
                <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                  /{entry.pronunciation}/
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleToggleSave}
                title={
                  user
                    ? bookmarked
                      ? 'Remove from notebook'
                      : 'Save term to notebook'
                    : 'Sign in with Google to save term'
                }
                className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap ${
                  bookmarked
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                <span>{saving ? '...' : bookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              {entry.plainDefinition}
            </p>

            <div className="mt-3 pt-2.5 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 leading-relaxed">
                <span className="font-semibold text-stone-700">Example: </span>
                {entry.example}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
