/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GeneticTerm } from './GeneticTermOverlay';

export interface PopulationAncestryDatum {
  id: string;
  population: string;
  shortLabel: string;
  region: 'Oceania' | 'Southeast Asia' | 'East Asia' | 'South Asia' | 'Eurasia & Americas' | 'Africa';
  denisovanPct: number;
  neanderthalPct: number;
  modernBaselinePct: number;
  keyLoci: string;
  highlightNote: string;
  sourceCitation: string;
}

type AncestryMetricMode = 'total' | 'denisovan' | 'neanderthal';

const POPULATION_ANCESTRY_DATA: PopulationAncestryDatum[] = [
  {
    id: 'ayta-magbukon',
    population: 'Philippine Ayta Magbukon',
    shortLabel: 'Ayta',
    region: 'Southeast Asia',
    denisovanPct: 5.0,
    neanderthalPct: 1.8,
    modernBaselinePct: 93.2,
    keyLoci: 'Immune receptor & skin barrier alleles',
    highlightNote:
      'Holds the highest genome-wide proportion of Denisovan ancestry documented in any living human population, reflecting an independent Island Southeast Asia admixture wave.',
    sourceCitation: 'Larena et al., Current Biology (2021)',
  },
  {
    id: 'papuan-melanesian',
    population: 'Papuan & Melanesian',
    shortLabel: 'Papuan',
    region: 'Oceania',
    denisovanPct: 4.8,
    neanderthalPct: 2.0,
    modernBaselinePct: 93.2,
    keyLoci: 'TNFAIP3, HLA immune diversity',
    highlightNote:
      'Carries ~4.8% Denisovan DNA from at least two distinct ancient pulses, enriching innate immunity pathways adapted to tropical pathogens.',
    sourceCitation: 'Reich et al., Nature (2010); Jacobs et al., Cell (2019)',
  },
  {
    id: 'indigenous-australian',
    population: 'Indigenous Australian',
    shortLabel: 'Australian',
    region: 'Oceania',
    denisovanPct: 3.6,
    neanderthalPct: 2.1,
    modernBaselinePct: 94.3,
    keyLoci: 'Metabolic & immune HLA loci',
    highlightNote:
      'Shares the deep Sahul Denisovan admixture pulse alongside Melanesian populations after early coastal migrations across Wallacea.',
    sourceCitation: 'Malaspinas et al., Nature (2016)',
  },
  {
    id: 'bajau',
    population: 'Bajau Sea Nomads',
    shortLabel: 'Bajau',
    region: 'Southeast Asia',
    denisovanPct: 0.8,
    neanderthalPct: 1.9,
    modernBaselinePct: 97.3,
    keyLoci: 'FAM178B (CO₂ pH buffer) & PDE10A',
    highlightNote:
      'Retains targeted Denisovan ancestry around FAM178B that modulates blood CO₂ buffering during prolonged breath-hold freediving.',
    sourceCitation: 'Ilardo et al., Cell (2018)',
  },
  {
    id: 'tibetan',
    population: 'Tibetan Highlanders',
    shortLabel: 'Tibetan',
    region: 'East Asia',
    denisovanPct: 0.4,
    neanderthalPct: 2.2,
    modernBaselinePct: 97.4,
    keyLoci: 'EPAS1 (87% haplotype frequency)',
    highlightNote:
      'Although genome-wide Denisovan ancestry is modest (~0.4%), intense high-altitude selection drove the Denisovan EPAS1 haplotype to ~87% frequency on the Tibetan Plateau.',
    sourceCitation: 'Huerta-Sánchez et al., Nature (2014)',
  },
  {
    id: 'east-asian',
    population: 'East Asian (Han & Japanese)',
    shortLabel: 'East Asian',
    region: 'East Asia',
    denisovanPct: 0.2,
    neanderthalPct: 2.3,
    modernBaselinePct: 97.5,
    keyLoci: 'WARS2 / TBX15, keratin & lipid loci',
    highlightNote:
      'Carries the highest average Neanderthal proportion (~2.3%) plus trace Denisovan segments inherited from dual Eurasian admixture pulses.',
    sourceCitation: 'Browning et al., Cell (2018)',
  },
  {
    id: 'indigenous-americas',
    population: 'Indigenous Americas',
    shortLabel: 'Americas',
    region: 'Eurasia & Americas',
    denisovanPct: 0.12,
    neanderthalPct: 2.1,
    modernBaselinePct: 97.78,
    keyLoci: 'MUC19 & TBX15 cold-adaptation loci',
    highlightNote:
      'Inherited archaic East Asian and Siberian haplotypes across Beringia, including Denisovan-like variants linked to cold metabolism and mucosal immunity.',
    sourceCitation: 'Racimo et al., Mol. Biol. Evol. (2017)',
  },
  {
    id: 'south-asian',
    population: 'South Asian',
    shortLabel: 'South Asian',
    region: 'South Asia',
    denisovanPct: 0.15,
    neanderthalPct: 1.9,
    modernBaselinePct: 97.95,
    keyLoci: 'Immune & sensory receptor clusters',
    highlightNote:
      'Shows widespread low-level Denisovan and Neanderthal segments reflecting ancient gene flow across the Indian subcontinent.',
    sourceCitation: 'Sankararaman et al., Current Biology (2016)',
  },
  {
    id: 'european',
    population: 'European',
    shortLabel: 'European',
    region: 'Eurasia & Americas',
    denisovanPct: 0.04,
    neanderthalPct: 2.0,
    modernBaselinePct: 97.96,
    keyLoci: 'TLR1/6/10 innate immunity & BNC2',
    highlightNote:
      'Carries roughly 2.0% Neanderthal DNA from the primary Out-of-Africa Levantine encounter, with only minimal trace Denisovan ancestry.',
    sourceCitation: 'Prüfer et al., Science (2017)',
  },
  {
    id: 'sub-saharan-african',
    population: 'Sub-Saharan African',
    shortLabel: 'African',
    region: 'Africa',
    denisovanPct: 0.02,
    neanderthalPct: 0.3,
    modernBaselinePct: 99.68,
    keyLoci: 'Ancestral H. sapiens diversity baseline',
    highlightNote:
      'Serves as the primary modern Homo sapiens baseline with minimal Eurasian archaic introgression (~0.3% Neanderthal from ancient back-migrations into Africa).',
    sourceCitation: 'Chen et al., Cell (2020)',
  },
];

const REGION_PALETTE: Record<
  PopulationAncestryDatum['region'],
  { fill: string; stroke: string; text: string }
> = {
  Oceania: { fill: '#9A6B2F', stroke: '#784F1E', text: '#FFFFFF' },
  'Southeast Asia': { fill: '#0F766E', stroke: '#115E59', text: '#FFFFFF' },
  'East Asia': { fill: '#334155', stroke: '#1E293B', text: '#FFFFFF' },
  'South Asia': { fill: '#64748B', stroke: '#475569', text: '#FFFFFF' },
  'Eurasia & Americas': { fill: '#78716C', stroke: '#57534E', text: '#FFFFFF' },
  Africa: { fill: '#D6D3D1', stroke: '#A8A29E', text: '#1C1917' },
};

function getMetricValue(d: PopulationAncestryDatum, mode: AncestryMetricMode): number {
  if (mode === 'denisovan') return d.denisovanPct;
  if (mode === 'neanderthal') return d.neanderthalPct;
  return Number((d.denisovanPct + d.neanderthalPct).toFixed(2));
}

interface PackNodeDatum {
  name: string;
  datum?: PopulationAncestryDatum;
  value?: number;
  children?: PackNodeDatum[];
}

export const DenisovanBubbleChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mode, setMode] = useState<AncestryMetricMode>('total');
  const [selectedId, setSelectedId] = useState<string>('papuan-melanesian');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeDatum = useMemo(() => {
    const targetId = hoveredId ?? selectedId;
    return (
      POPULATION_ANCESTRY_DATA.find((d) => d.id === targetId) ??
      POPULATION_ANCESTRY_DATA[1]
    );
  }, [hoveredId, selectedId]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = 560;
    const height = 430;

    const rootData: PackNodeDatum = {
      name: 'populations',
      children: POPULATION_ANCESTRY_DATA.map((datum) => {
        const raw = getMetricValue(datum, mode);
        // Apply a small floor so 0.02% baseline bubbles stay visible and selectable
        const visualWeight = Math.max(raw, mode === 'denisovan' ? 0.14 : 0.35);
        return {
          name: datum.id,
          datum,
          value: visualWeight,
        };
      }),
    };

    const hierarchy = d3
      .hierarchy<PackNodeDatum>(rootData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const packLayout = d3
      .pack<PackNodeDatum>()
      .size([width - 16, height - 16])
      .padding(8);

    const packedRoot = packLayout(hierarchy);
    const leaves = packedRoot.leaves();

    const svg = d3.select(svgEl);
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    let container = svg.select<SVGGElement>('g.bubble-layer');
    if (container.empty()) {
      container = svg.append('g').attr('class', 'bubble-layer').attr('transform', 'translate(8,8)');
    }

    const nodes = container
      .selectAll<SVGGElement, d3.HierarchyCircularNode<PackNodeDatum>>('g.bubble-node')
      .data(leaves, (d) => d.data.name);

    const nodesEnter = nodes
      .enter()
      .append('g')
      .attr('class', 'bubble-node')
      .attr('tabindex', '0')
      .attr('role', 'button')
      .style('cursor', 'pointer')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodesEnter
      .append('circle')
      .attr('class', 'bubble-halo')
      .attr('r', 0)
      .attr('fill', 'none')
      .attr('stroke', '#1C1917')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0);

    nodesEnter
      .append('circle')
      .attr('class', 'bubble-main')
      .attr('r', 0)
      .attr('stroke-width', 1.5);

    nodesEnter
      .append('text')
      .attr('class', 'bubble-name')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-family', 'Inter, sans-serif')
      .style('font-weight', '600');

    nodesEnter
      .append('text')
      .attr('class', 'bubble-value')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
      .style('font-variant-numeric', 'tabular-nums');

    const merged = nodesEnter.merge(nodes);

    merged
      .attr('aria-label', (d) => {
        const item = d.data.datum!;
        return `${item.population}: ${getMetricValue(item, mode)}% shared ancient hominin DNA`;
      })
      .on('mouseenter', (_event, d) => {
        if (d.data.datum) setHoveredId(d.data.datum.id);
      })
      .on('mouseleave', () => {
        setHoveredId(null);
      })
      .on('click', (_event, d) => {
        if (d.data.datum) setSelectedId(d.data.datum.id);
      })
      .on('keydown', (event: KeyboardEvent, d) => {
        if ((event.key === 'Enter' || event.key === ' ') && d.data.datum) {
          event.preventDefault();
          setSelectedId(d.data.datum.id);
        }
      });

    const t = d3.transition().duration(380).ease(d3.easeCubicOut);

    merged
      .transition(t)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    merged
      .select<SVGCircleElement>('circle.bubble-main')
      .transition(t)
      .attr('r', (d) => Math.max(16, d.r))
      .attr('fill', (d) => {
        const region = d.data.datum!.region;
        return REGION_PALETTE[region].fill;
      })
      .attr('stroke', (d) => {
        const region = d.data.datum!.region;
        return REGION_PALETTE[region].stroke;
      })
      .attr('fill-opacity', (d) => {
        const id = d.data.datum!.id;
        if (hoveredId && hoveredId !== id && selectedId !== id) return 0.72;
        return 0.94;
      });

    merged
      .select<SVGCircleElement>('circle.bubble-halo')
      .transition(t)
      .attr('r', (d) => Math.max(16, d.r) + 4)
      .attr('opacity', (d) => {
        const id = d.data.datum!.id;
        return id === selectedId || id === hoveredId ? 0.9 : 0;
      });

    merged
      .select<SVGTextElement>('text.bubble-name')
      .text((d) => {
        const item = d.data.datum!;
        if (d.r < 24) return item.shortLabel.slice(0, 5);
        return item.shortLabel;
      })
      .attr('dy', (d) => (d.r >= 32 ? '-0.25em' : '0.1em'))
      .style('font-size', (d) => `${Math.max(9, Math.min(13, d.r * 0.27))}px`)
      .attr('fill', (d) => REGION_PALETTE[d.data.datum!.region].text);

    merged
      .select<SVGTextElement>('text.bubble-value')
      .text((d) => {
        const val = getMetricValue(d.data.datum!, mode);
        return d.r >= 26 ? `${val.toFixed(val < 0.2 ? 2 : 1)}%` : '';
      })
      .attr('dy', '1.05em')
      .style('font-size', (d) => `${Math.max(9, Math.min(12, d.r * 0.24))}px`)
      .attr('fill', (d) => REGION_PALETTE[d.data.datum!.region].text)
      .attr('fill-opacity', 0.9);

    nodes.exit().remove();
  }, [mode, selectedId, hoveredId]);

  const totalArchaic = Number(
    (activeDatum.denisovanPct + activeDatum.neanderthalPct).toFixed(2)
  );

  return (
    <div className="w-full max-w-5xl mx-auto mt-14 bg-[#F9F8F4] border border-stone-200 rounded-xl p-6 md:p-8">
      {/* Header & Interactive Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <p className="text-xs font-mono text-stone-500">
            Paleogenomic Comparison · Shared Archaic Ancestry
          </p>
          <h3 className="font-serif text-2xl text-stone-900 mt-1">
            Ancient Hominin DNA Across Modern Populations
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 max-w-2xl leading-relaxed">
            Bubble area scales by genome-wide percentage of archaic DNA inherited via{' '}
            <GeneticTerm termKey="admixture">admixture</GeneticTerm>. Hover or select any
            population bubble to compare Denisovan, Neanderthal, and modern{' '}
            <em>Homo sapiens</em> proportions.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Archaic ancestry filter"
          className="inline-flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg self-start md:self-auto shrink-0"
        >
          {(
            [
              { id: 'total', label: 'All Archaic' },
              { id: 'denisovan', label: 'Denisovan' },
              { id: 'neanderthal', label: 'Neanderthal' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: D3 Bubble Chart + Paleogenomic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-stretch">
        {/* Left: D3 SVG Stage */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-stone-200 rounded-lg p-4">
          <div className="w-full flex items-center justify-center">
            <svg
              ref={svgRef}
              className="w-full h-auto max-h-[420px] select-none"
              role="img"
              aria-label="D3 bubble chart showing percentage of Denisovan and Neanderthal DNA shared across modern populations"
            />
          </div>

          {/* Region Color Legend (unboxed clean metadata) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 mt-2 border-t border-stone-100 text-[11px] text-stone-600">
            {(Object.keys(REGION_PALETTE) as PopulationAncestryDatum['region'][]).map(
              (region) => (
                <div key={region} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full border"
                    style={{
                      backgroundColor: REGION_PALETTE[region].fill,
                      borderColor: REGION_PALETTE[region].stroke,
                    }}
                  />
                  <span>{region}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right: Population Dossier */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-stone-200 rounded-lg p-6">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
              <span>{activeDatum.region}</span>
              <span className="font-mono tabular-nums text-stone-400">
                Total Archaic {totalArchaic.toFixed(2)}%
              </span>
            </div>

            <h4 className="font-serif text-2xl text-stone-900 mt-1">
              {activeDatum.population}
            </h4>

            {/* Tabular Metric Trio */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-stone-100">
              <div>
                <div className="text-[11px] text-stone-500">Denisovan</div>
                <div className="text-xl font-mono font-semibold tabular-nums text-amber-800 mt-0.5">
                  {activeDatum.denisovanPct.toFixed(
                    activeDatum.denisovanPct < 0.2 ? 2 : 1
                  )}
                  <span className="text-xs font-normal text-stone-400 ml-0.5">%</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500">Neanderthal</div>
                <div className="text-xl font-mono font-semibold tabular-nums text-teal-800 mt-0.5">
                  {activeDatum.neanderthalPct.toFixed(1)}
                  <span className="text-xs font-normal text-stone-400 ml-0.5">%</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500">Modern Baseline</div>
                <div className="text-xl font-mono font-semibold tabular-nums text-stone-800 mt-0.5">
                  {activeDatum.modernBaselinePct.toFixed(1)}
                  <span className="text-xs font-normal text-stone-400 ml-0.5">%</span>
                </div>
              </div>
            </div>

            {/* Comparative Proportion Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] text-stone-500 mb-1.5">
                <span>Archaic vs. Modern H. sapiens Genome Split</span>
                <span className="font-mono tabular-nums">100.0%</span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex border border-stone-200/80">
                <div
                  style={{ width: `${Math.max(activeDatum.denisovanPct * 4, 0.8)}%` }}
                  className="bg-amber-700 h-full transition-all duration-300"
                  title={`Denisovan: ${activeDatum.denisovanPct}%`}
                />
                <div
                  style={{ width: `${Math.max(activeDatum.neanderthalPct * 4, 1.2)}%` }}
                  className="bg-teal-700 h-full transition-all duration-300"
                  title={`Neanderthal: ${activeDatum.neanderthalPct}%`}
                />
                <div className="bg-stone-300 flex-1 h-full" title="Modern H. sapiens baseline" />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-stone-500 mt-1.5">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-amber-700" />
                  Denisovan (4× visual scale)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-teal-700" />
                  Neanderthal (4× visual scale)
                </span>
              </div>
            </div>

            {/* Key Adaptive Loci */}
            <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
              <div>
                <div className="text-[11px] font-medium text-stone-500">
                  Notable Introgressed Loci
                </div>
                <div className="text-xs font-mono text-stone-800 mt-0.5">
                  {activeDatum.keyLoci}
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeDatum.highlightNote}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <span>Reference</span>
            <span className="font-mono text-stone-500 text-right">
              {activeDatum.sourceCitation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
