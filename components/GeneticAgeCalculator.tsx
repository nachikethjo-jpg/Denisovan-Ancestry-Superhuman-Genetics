/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Clock, TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';

interface GeneticAgeFactor {
  id: string;
  label: string;
  rateDelta: number; // Change to biological aging pace relative to 1.00x baseline
  mechanism: string;
  isPenalty?: boolean;
}

const GENE_AGING_PROFILES: Record<
  string,
  { label: string; rateDelta: number; mechanism: string }
> = {
  epas1: {
    label: 'EPAS1 (Vascular Oxygenation)',
    rateDelta: -0.07,
    mechanism: 'Reduces blood viscosity strain and chronic microvascular oxidative stress.',
  },
  fam178b: {
    label: 'FAM178B (Acid-Base Buffer)',
    rateDelta: -0.04,
    mechanism: 'Stabilizes carbonic blood pH buffering during metabolic oxygen dips.',
  },
  lrp5: {
    label: 'LRP5 (Skeletal Longevity)',
    rateDelta: -0.06,
    mechanism: 'Prevents age-related bone mineral density loss and osteoporotic frailty.',
  },
  dec2: {
    label: 'DEC2 (Circadian Repair)',
    rateDelta: -0.05,
    mechanism: 'Compresses restorative sleep recovery and lowers sleep-debt cortisol.',
  },
  faahout: {
    label: 'FAAH-OUT (Silent Wear vs. Low Stress)',
    rateDelta: 0.03,
    mechanism: 'Cuts stress cortisol, but absent pain warnings allow silent joint and tissue wear.',
  },
  actn3: {
    label: 'ACTN3 (Fast-Twitch Metabolic Load)',
    rateDelta: 0.04,
    mechanism: 'Preserves explosive muscle mass, but elevated anaerobic flux raises oxidative load.',
  },
};

interface GeneticAgeCalculatorProps {
  selectedGenes: string[];
}

export const GeneticAgeCalculator: React.FC<GeneticAgeCalculatorProps> = ({
  selectedGenes,
}) => {
  const [chronologicalAge, setChronologicalAge] = useState<number>(38);

  const calculation = useMemo(() => {
    const factors: GeneticAgeFactor[] = [];

    for (const geneId of selectedGenes) {
      const profile = GENE_AGING_PROFILES[geneId];
      if (profile) {
        factors.push({
          id: geneId,
          label: profile.label,
          rateDelta: profile.rateDelta,
          mechanism: profile.mechanism,
        });
      }
    }

    // Antagonistic trade-off penalties synced with CRISPR Lab paradoxes
    if (selectedGenes.includes('actn3') && selectedGenes.includes('lrp5')) {
      factors.push({
        id: 'paradox-inertia',
        label: 'Inertial Acceleration Conflict (ACTN3 + LRP5)',
        rateDelta: 0.07,
        mechanism: 'Heavy skeletal limb inertia elevates tendon shear and joint impact wear during explosive bursts.',
        isPenalty: true,
      });
    }

    if (selectedGenes.includes('lrp5') && selectedGenes.includes('fam178b')) {
      factors.push({
        id: 'paradox-sinking',
        label: 'Sinking Sprinter Load (LRP5 + FAM178B)',
        rateDelta: 0.06,
        mechanism: 'Dense skeletal ballast elevates mechanical and cardiovascular exertion.',
        isPenalty: true,
      });
    }

    if (
      selectedGenes.includes('actn3') &&
      (selectedGenes.includes('epas1') || selectedGenes.includes('fam178b'))
    ) {
      factors.push({
        id: 'paradox-oxygen',
        label: 'Oxygen Paradox Stress (ACTN3 conflict)',
        rateDelta: 0.09,
        mechanism: 'High-burn fast-twitch fibers directly oppose oxygen-conserving pathways.',
        isPenalty: true,
      });
    }

    if (
      selectedGenes.includes('faahout') &&
      (selectedGenes.includes('actn3') ||
        selectedGenes.includes('fam178b') ||
        selectedGenes.includes('lrp5'))
    ) {
      factors.push({
        id: 'paradox-damage',
        label: 'Unmonitored Tissue Trauma (FAAH-OUT conflict)',
        rateDelta: 0.11,
        mechanism: 'Missing nociception masks repetitive muscle tears, joint impingement, and pressure injury.',
        isPenalty: true,
      });
    }

    const totalRateDelta = factors.reduce((acc, f) => acc + f.rateDelta, 0);
    // Clamp aging pace between 0.72x and 1.38x so projections remain physiologically bounded
    const pace = Math.max(0.72, Math.min(1.38, Number((1 + totalRateDelta).toFixed(2))));

    // Adult aging divergence begins compounding after biological maturity (~18 years)
    const adultYears = Math.max(0, chronologicalAge - 18);
    const geneticAge = Number((18 + adultYears * pace).toFixed(1));
    const ageDelta = Number((geneticAge - chronologicalAge).toFixed(1));

    // Projected healthspan delta at age 80 relative to baseline
    const projectedDeltaAt80 = Number((62 * (pace - 1)).toFixed(1));

    return {
      factors,
      pace,
      geneticAge,
      ageDelta,
      projectedDeltaAt80,
      adultYears,
    };
  }, [selectedGenes, chronologicalAge]);

  const statusMeta = useMemo(() => {
    if (selectedGenes.length === 0 || Math.abs(calculation.ageDelta) < 0.2) {
      return {
        label: 'Human Baseline Pace',
        toneClass: 'text-stone-700',
        icon: <Minus size={13} className="text-stone-500" />,
      };
    }
    if (calculation.ageDelta < 0) {
      return {
        label: 'Slower Biological Aging',
        toneClass: 'text-teal-700',
        icon: <TrendingDown size={13} className="text-teal-700" />,
      };
    }
    return {
      label: 'Accelerated Physiological Wear',
      toneClass: 'text-red-700',
      icon: <TrendingUp size={13} className="text-red-700" />,
    };
  }, [selectedGenes.length, calculation.ageDelta]);

  // Build SVG Dual-Curve Lifespan Comparison (Ages 18 to 90)
  const chartSpec = useMemo(() => {
    const svgW = 360;
    const svgH = 128;
    const padL = 32;
    const padR = 14;
    const padT = 14;
    const padB = 22;
    const plotW = svgW - padL - padR;
    const plotH = svgH - padT - padB;

    const minAge = 18;
    const maxAge = 90;
    const maxBioAge = 115;

    const xScale = (age: number) => padL + ((age - minAge) / (maxAge - minAge)) * plotW;
    const yScale = (bioAge: number) =>
      padT + plotH - ((Math.min(maxBioAge, bioAge) - minAge) / (maxBioAge - minAge)) * plotH;

    const baselinePath = `M ${xScale(minAge)} ${yScale(minAge)} L ${xScale(maxAge)} ${yScale(maxAge)}`;

    const splicedEndBio = 18 + (maxAge - 18) * calculation.pace;
    const splicedPath = `M ${xScale(minAge)} ${yScale(minAge)} L ${xScale(maxAge)} ${yScale(splicedEndBio)}`;

    const currentX = xScale(chronologicalAge);
    const currentBaseY = yScale(chronologicalAge);
    const currentBioY = yScale(calculation.geneticAge);

    return {
      svgW,
      svgH,
      padL,
      padT,
      plotW,
      plotH,
      baselinePath,
      splicedPath,
      currentX,
      currentBaseY,
      currentBioY,
      xScale,
      yScale,
    };
  }, [chronologicalAge, calculation.pace, calculation.geneticAge]);

  const paceStroke =
    calculation.pace < 1 ? '#0F766E' : calculation.pace > 1 ? '#B91C1C' : '#57534E';

  return (
    <div className="mt-6 pt-6 border-t border-stone-200">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500">
            <Clock size={13} className="text-stone-400" />
            <span>Physiological Longevity Model</span>
          </div>
          <h4 className="font-serif text-lg text-stone-900 mt-0.5">
            Genetic Age Calculator
          </h4>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-medium">
          {statusMeta.icon}
          <span className={statusMeta.toneClass}>{statusMeta.label}</span>
        </div>
      </div>

      {/* Chronological Age Scrubber */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <label htmlFor="chronological-age-slider" className="font-medium text-stone-700">
            Chronological Age (Baseline Reference)
          </label>
          <span className="font-mono font-semibold tabular-nums text-stone-900">
            {chronologicalAge} yrs
          </span>
        </div>
        <input
          id="chronological-age-slider"
          type="range"
          min={18}
          max={90}
          step={1}
          value={chronologicalAge}
          onChange={(e) => setChronologicalAge(parseInt(e.target.value, 10))}
          className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1 tabular-nums">
          <span>18 yrs</span>
          <span>40 yrs</span>
          <span>65 yrs</span>
          <span>90 yrs</span>
        </div>
      </div>

      {/* Primary KPI Strip + Trajectory Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Numeric Readouts */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-stone-500">Estimated Genetic Age</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-semibold tabular-nums text-stone-900">
                {calculation.geneticAge.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-stone-400">yrs</span>
              <span
                className={`text-xs font-mono font-semibold tabular-nums ml-auto ${
                  calculation.ageDelta < 0
                    ? 'text-teal-700'
                    : calculation.ageDelta > 0
                      ? 'text-red-700'
                      : 'text-stone-500'
                }`}
              >
                {calculation.ageDelta > 0 ? '+' : ''}
                {calculation.ageDelta.toFixed(1)} yrs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-stone-100">
            <div>
              <div className="text-[11px] text-stone-500">Aging Pace</div>
              <div className="text-base font-mono font-semibold tabular-nums text-stone-900 mt-0.5">
                {calculation.pace.toFixed(2)}×
              </div>
              <div className="text-[10px] text-stone-400">vs. 1.00× baseline</div>
            </div>
            <div>
              <div className="text-[11px] text-stone-500">At Age 80</div>
              <div
                className={`text-base font-mono font-semibold tabular-nums mt-0.5 ${
                  calculation.projectedDeltaAt80 < 0
                    ? 'text-teal-700'
                    : calculation.projectedDeltaAt80 > 0
                      ? 'text-red-700'
                      : 'text-stone-800'
                }`}
              >
                {calculation.projectedDeltaAt80 > 0 ? '+' : ''}
                {calculation.projectedDeltaAt80.toFixed(1)} yrs
              </div>
              <div className="text-[10px] text-stone-400">compounded shift</div>
            </div>
          </div>
        </div>

        {/* Right: Dual-Line Biological Trajectory SVG */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span>Biological vs. Chronological Trajectory</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 border-t border-dashed border-stone-400" />
                Baseline
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-3 border-t-2"
                  style={{ borderColor: paceStroke }}
                />
                Spliced
              </span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${chartSpec.svgW} ${chartSpec.svgH}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Biological aging trajectory comparing spliced genome (${calculation.geneticAge} years) against baseline (${chronologicalAge} years)`}
          >
            {/* Horizontal grid lines */}
            {[30, 60, 90].map((tick) => (
              <g key={tick}>
                <line
                  x1={chartSpec.padL}
                  x2={chartSpec.svgW - 14}
                  y1={chartSpec.yScale(tick)}
                  y2={chartSpec.yScale(tick)}
                  stroke="#E7E5E4"
                  strokeWidth="1"
                />
                <text
                  x={chartSpec.padL - 6}
                  y={chartSpec.yScale(tick) + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#78716C"
                  fontFamily="ui-monospace, monospace"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Vertical marker at selected chronological age */}
            <line
              x1={chartSpec.currentX}
              x2={chartSpec.currentX}
              y1={chartSpec.padT}
              y2={chartSpec.padT + chartSpec.plotH}
              stroke="#D6D3D1"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Human Baseline 1.00x dashed line */}
            <path
              d={chartSpec.baselinePath}
              fill="none"
              stroke="#A8A29E"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Spliced Genome trajectory line */}
            <path
              d={chartSpec.splicedPath}
              fill="none"
              stroke={paceStroke}
              strokeWidth="2.25"
            />

            {/* Baseline point */}
            <circle
              cx={chartSpec.currentX}
              cy={chartSpec.currentBaseY}
              r="3.2"
              fill="#FFFFFF"
              stroke="#78716C"
              strokeWidth="1.5"
            />

            {/* Spliced point */}
            <circle
              cx={chartSpec.currentX}
              cy={chartSpec.currentBioY}
              r="4.2"
              fill={paceStroke}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />

            {/* X-axis tick labels */}
            {[18, 40, 65, 90].map((tick) => (
              <text
                key={tick}
                x={chartSpec.xScale(tick)}
                y={chartSpec.svgH - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#78716C"
                fontFamily="ui-monospace, monospace"
              >
                {tick}y
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Per-Mutation Breakdown */}
      <div className="mt-4 bg-stone-50 border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-700">
            Physiological Contributors at Age {chronologicalAge}
          </span>
          <span className="text-[11px] font-mono text-stone-400">
            Educational estimate · Not clinical advice
          </span>
        </div>

        {calculation.factors.length === 0 ? (
          <p className="text-xs text-stone-500">
            Baseline human genome active (1.00× aging pace). Toggle mutations in the Gene
            Splicing Vault above to model how individual variants and trade-off paradoxes
            shift biological aging.
          </p>
        ) : (
          <div className="divide-y divide-stone-200/70">
            {calculation.factors.map((factor) => {
              const yearImpact = Number(
                (calculation.adultYears * factor.rateDelta).toFixed(1)
              );
              const isBeneficial = factor.rateDelta < 0;
              return (
                <div
                  key={factor.id}
                  className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                      {factor.isPenalty && (
                        <AlertTriangle size={12} className="text-red-600 shrink-0" />
                      )}
                      <span>{factor.label}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      {factor.mechanism}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <div
                      className={`text-xs font-semibold ${
                        isBeneficial ? 'text-teal-700' : 'text-red-700'
                      }`}
                    >
                      {yearImpact > 0 ? '+' : ''}
                      {yearImpact.toFixed(1)} yrs
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {factor.rateDelta > 0 ? '+' : ''}
                      {(factor.rateDelta * 100).toFixed(0)}% pace
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
