/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Activity, HelpCircle, AlertTriangle, ShieldCheck, Info, Zap } from 'lucide-react';

// --- TYPE DECLARATIONS ---
export interface GeneInfo {
  id: string;
  name: string;
  geneName: string;
  chromosome: string;
  source: string;
  superpower: string;
  description: string;
  yValue: number; // Significance value on Manhattan plot
  impact: {
    oxygen: number;
    bones: number;
    sleep: number;
    pain: number;
    speed: number;
    buoyancy: number;
  };
}

// 6 Target Superhuman Genes based on the article
export const SUPERHUMAN_GENES: GeneInfo[] = [
  {
    id: 'epas1',
    name: 'High-Altitude Oxygen Efficiency',
    geneName: 'EPAS1',
    chromosome: 'Chr 2',
    source: 'Denisovan Introgression',
    superpower: 'Thin, efficient blood in hypoxic conditions',
    description: 'Prevents extreme red blood cell overproduction at high altitudes, keeping blood thin and preventing clots/strains while utilizing oxygen with maximum biological efficiency.',
    yValue: 9.8,
    impact: { oxygen: 90, bones: 0, sleep: 0, pain: 0, speed: 10, buoyancy: 0 }
  },
  {
    id: 'fam178b',
    name: 'Deep Sea CO₂ Buffering',
    geneName: 'FAM178B',
    chromosome: 'Chr 2',
    source: 'Denisovan Introgression',
    superpower: 'Blood pH balancing during breath-hold',
    description: 'Maintains blood pH balance by buffering toxic carbon dioxide build-up. Prevents the painful, panicked urge to breathe, allowing extreme underwater dives.',
    yValue: 8.2,
    impact: { oxygen: 85, bones: 0, sleep: 0, pain: 15, speed: 0, buoyancy: 0 }
  },
  {
    id: 'lrp5',
    name: 'Unbreakable Bones',
    geneName: 'LRP5',
    chromosome: 'Chr 11',
    source: 'Spontaneous Mutation (Gain-of-Function)',
    superpower: 'Hyper-dense, shatterproof skeletal structure',
    description: 'Triggers continuous bone density buildup without breakdown. Resulting in virtually unbreakable bones and zero osteoporosis risk, but significantly increases skeletal weight.',
    yValue: 7.9,
    impact: { oxygen: 0, bones: 100, sleep: 0, pain: 0, speed: -10, buoyancy: -60 }
  },
  {
    id: 'dec2',
    name: 'Super-Efficient Sleep',
    geneName: 'DEC2',
    chromosome: 'Chr 19',
    source: 'Spontaneous Mutation',
    superpower: 'Requires only 4-6 hours of sleep',
    description: 'Regulates wakefulness and circadian rhythm hormones, creating hyper-efficient sleep cycles. Individuals wake fully refreshed and energetic after minimal sleep with zero side effects.',
    yValue: 8.9,
    impact: { oxygen: 10, bones: 0, sleep: 95, pain: 0, speed: 10, buoyancy: 0 }
  },
  {
    id: 'faahout',
    name: 'Congenital Pain/Anxiety Immunity',
    geneName: 'FAAH-OUT',
    chromosome: 'Chr 1',
    source: 'Spontaneous Microdeletion',
    superpower: 'Feels zero pain, anxiety, or panic',
    description: 'Blocks breakdown of anandamide (the "bliss molecule"), flooding the system with endorphin-like effects. Causes complete immunity to physical pain, anxiety, and fast, low-scar healing.',
    yValue: 8.5,
    impact: { oxygen: 0, bones: 0, sleep: 10, pain: 100, speed: 0, buoyancy: 0 }
  },
  {
    id: 'actn3',
    name: 'Explosive Sprinter Muscle',
    geneName: 'ACTN3',
    chromosome: 'Chr 11',
    source: 'Explosive Fast-Twitch Muscle',
    superpower: 'Maximum fast-twitch muscle contraction power',
    description: 'Produces alpha-actinin-3, a protein exclusive to fast-twitch fibers. Supercharges muscular force for explosive, lightning-fast bursts of power and sprinting acceleration.',
    yValue: 8.1,
    impact: { oxygen: -20, bones: 15, sleep: 0, pain: 0, speed: 95, buoyancy: -10 }
  }
];

// --- 1. INTERACTIVE INTROGRESSION DIAGRAM ---
export const AdaptiveIntrogressionDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      title: '1. Ancient Encounter',
      subtitle: '50,000 Years Ago',
      desc: 'As modern humans migrated out of Africa into Eurasia, they encountered and interbred with Denisovans (extinct cousin species). In doing so, modern humans inherited fragments of ancient DNA.',
      visual: (
        <div className="relative w-full h-40 bg-stone-900 rounded-lg flex items-center justify-center overflow-hidden border border-stone-800">
          <div className="absolute top-0 left-0 text-[9px] font-mono p-2 text-stone-500">EURASIAN HYBRIDIZATION REGION</div>
          {/* Visualizing Interbreeding */}
          <div className="flex items-center gap-12 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border-2 border-blue-500 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">Sapiens</div>
              <span className="text-[10px] text-stone-400 mt-2">Modern Ancestors</span>
            </div>
            
            <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 relative flex items-center justify-center">
              <span className="absolute text-[10px] text-purple-300 font-bold bg-stone-900 px-1 border border-stone-800 rounded -top-3">Admixture</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center text-white text-[10px] font-bold animate-pulse">Denisovan</div>
              <span className="text-[10px] text-stone-400 mt-2">Extinct Hominins</span>
            </div>
          </div>
          <div className="absolute bottom-3 text-xs font-serif text-purple-200">Recombination delivers EPAS1 & FAM178B variants</div>
        </div>
      )
    },
    {
      title: '2. Geographical Splitting',
      subtitle: '40,000 Years Ago',
      desc: 'Sapiens populations split and migrated. One group crossed into the frigid, low-oxygen Tibetan Plateau. Another migrated to Southeast Asia, taking up a maritime, coastal existence (ancestral Bajau).',
      visual: (
        <div className="relative w-full h-40 bg-stone-900 rounded-lg flex items-center justify-center overflow-hidden border border-stone-800">
          <div className="absolute top-0 left-0 text-[9px] font-mono p-2 text-stone-500">DIVERGENT MIGRATIONS</div>
          
          <div className="flex justify-around w-full px-6 relative z-10">
            <div className="flex flex-col items-center">
              <div className="text-xl">🏔️</div>
              <span className="text-xs font-bold text-sky-400">Tibetan Plateau</span>
              <span className="text-[10px] text-stone-400">Extreme Altitude</span>
            </div>
            <div className="flex flex-col items-center justify-center text-stone-500">
              <div className="text-sm">← (Eurasian Hub) →</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl">🌊</div>
              <span className="text-xs font-bold text-teal-400">S.E. Asian Coasts</span>
              <span className="text-[10px] text-stone-400">Deep-Sea Diving</span>
            </div>
          </div>
          <div className="absolute bottom-3 text-xs font-serif text-stone-300">Dormant genes carried to the absolute limits of survival</div>
        </div>
      )
    },
    {
      title: '3. Adaptive Selection',
      subtitle: '10,000 Years Ago - Present',
      desc: 'Natural selection acts like a sieve. In thin mountain air, those with the Denisovan EPAS1 gene survive without thickened blood. In coastal waters, those with the Denisovan FAM178B gene dive deeper for food. Non-carriers face extreme biological strains.',
      visual: (
        <div className="relative w-full h-40 bg-stone-900 rounded-lg flex flex-col items-center justify-center overflow-hidden border border-stone-800 px-4">
          <div className="absolute top-0 left-0 text-[9px] font-mono p-2 text-stone-500">ADAPTIVE INTROGRESSION SELECTION</div>
          <div className="grid grid-cols-2 gap-6 w-full text-center relative z-10">
            <div className="border border-sky-900/30 bg-sky-950/20 p-2 rounded">
              <div className="text-[11px] font-bold text-sky-400">EPAS1 Variant (Tibetans)</div>
              <div className="text-[9px] text-stone-300 mt-1">Saves from altitude hypoxia. Spreads to 90%+ of population.</div>
            </div>
            <div className="border border-teal-900/30 bg-teal-950/20 p-2 rounded">
              <div className="text-[11px] font-bold text-teal-400">FAM178B Variant (Bajau)</div>
              <div className="text-[9px] text-stone-300 mt-1">Buffers CO2 toxicity. Spreads to dive-reliant sea nomads.</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-stone-200 w-full max-w-2xl mx-auto my-6">
      <h3 className="font-serif text-xl mb-1 text-stone-900 text-center">Adaptive Introgression: Sky & Sea</h3>
      <p className="text-xs text-stone-500 mb-6 text-center">
        How ancient Denisovan genomes gave modern humans "pre-packaged" evolutionary advantages.
      </p>

      {/* Step Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-all ${activeStep === idx ? 'bg-stone-900 text-white border-stone-900 shadow-sm' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'}`}
          >
            <div className="font-bold text-[9px] uppercase text-stone-400">{step.subtitle}</div>
            <div className="truncate">{step.title.split('. ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Visual Canvas Area */}
      <div className="mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {steps[activeStep].visual}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Narrative block */}
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 min-h-[96px] flex flex-col justify-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Historical Dynamics:</div>
        <p className="text-xs text-stone-600 leading-relaxed">{steps[activeStep].desc}</p>
      </div>
    </div>
  );
};

// --- 2. INTERACTIVE MANHATTAN PLOT DIAGRAM ---
export const ManhattanPlotDiagram: React.FC<{ onSelectGene: (gene: GeneInfo) => void; selectedGene: GeneInfo | null }> = ({ onSelectGene, selectedGene }) => {
  const [hoveredNode, setHoveredNode] = useState<GeneInfo | null>(null);

  // Generate background noise points for the Manhattan plot to look real
  const [backgroundPoints] = useState(() => {
    const points: Array<{ chr: number; y: number; xOffset: number }> = [];
    for (let chr = 1; chr <= 23; chr++) {
      const numPoints = Math.floor(Math.random() * 12) + 6;
      for (let i = 0; i < numPoints; i++) {
        points.push({
          chr,
          y: Math.random() * 3.8 + 0.5, // Well below standard significance threshold of 5.0
          xOffset: 10 + Math.random() * 80 // Spread horizontally
        });
      }
    }
    return points;
  });

  return (
    <div className="flex flex-col p-6 bg-stone-950 text-stone-100 rounded-xl border border-stone-800 shadow-xl my-6 w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-serif text-xl text-nobel-gold">Genome-Wide Association Study (GWAS)</h3>
          <p className="text-stone-400 text-xs mt-1">
            Manhattan Plot: Tall peaks represent genetic variants with high statistical correlation to extreme phenotypes.
          </p>
        </div>
        <div className="bg-stone-900 border border-stone-800 rounded px-2.5 py-1 text-[10px] font-mono text-stone-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>SIGNIFICANCE SIGNAL ACTIVE</span>
        </div>
      </div>

      {/* Plot Area */}
      <div className="relative w-full h-64 border-b border-l border-stone-700 bg-stone-900/40 rounded p-4 flex flex-col justify-between mt-2">
        {/* Horizontal Threshold Line at Y = 5.0 */}
        <div className="absolute left-0 right-0 h-[1px] bg-red-500/60 border-t border-dashed border-red-500 z-10" style={{ bottom: '50%' }}>
          <span className="absolute right-2 -top-4 text-[8px] font-mono text-red-400 tracking-wider">GENOME-WIDE SIGNIFICANCE THRESHOLD (-log10 p = 5.0)</span>
        </div>

        {/* Y Axis grid lines */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-5">
          <div className="w-full h-[1px] bg-stone-300"></div>
          <div className="w-full h-[1px] bg-stone-300"></div>
          <div className="w-full h-[1px] bg-stone-300"></div>
          <div className="w-full h-[1px] bg-stone-300"></div>
        </div>

        {/* Plot Graph Container */}
        <div className="relative w-full h-full flex items-end">
          {/* Background scatter noise */}
          {backgroundPoints.map((pt, i) => {
            const leftPercent = ((pt.chr - 1) / 23) * 94 + (pt.xOffset / 100) * 3;
            const bottomPercent = (pt.y / 10) * 100;
            return (
              <div
                key={`bg-${i}`}
                className="absolute w-1 h-1 bg-stone-600 rounded-full opacity-40 pointer-events-none"
                style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
              />
            );
          })}

          {/* Spikes / Target Genes */}
          {SUPERHUMAN_GENES.map((gene) => {
            // Extract numerical chromosome number
            const chrNum = parseInt(gene.chromosome.replace('Chr ', '')) || 23;
            // Map horizontal index
            const leftPercent = ((chrNum - 1) / 23) * 94 + 2;
            const bottomPercent = (gene.yValue / 10) * 100;
            
            const isSelected = selectedGene?.id === gene.id;
            const isHovered = hoveredNode?.id === gene.id;

            return (
              <div key={gene.id}>
                {/* Vertical Line Spike representation */}
                <div 
                  className={`absolute w-[2px] transition-all duration-300 pointer-events-none ${isSelected ? 'bg-nobel-gold/50' : 'bg-stone-800'}`}
                  style={{ left: `${leftPercent}%`, bottom: 0, height: `${bottomPercent}%` }}
                />

                {/* Interactive Clickable Node */}
                <button
                  onClick={() => onSelectGene(gene)}
                  onMouseEnter={() => setHoveredNode(gene)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`absolute w-3 h-3 -ml-1 -mb-1 rounded-full border transition-all duration-200 z-20 ${isSelected ? 'bg-nobel-gold border-white scale-125 shadow-[0_0_12px_#C5A059]' : 'bg-red-500 border-stone-950 hover:bg-nobel-gold hover:scale-125'}`}
                  style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Chromosome Labels */}
        <div className="absolute left-0 right-0 -bottom-6 flex justify-between px-2 text-[8px] font-mono text-stone-500">
          <span>Chr 1</span>
          <span>Chr 4</span>
          <span>Chr 8</span>
          <span>Chr 11</span>
          <span>Chr 15</span>
          <span>Chr 19</span>
          <span>Chr 23 (X)</span>
        </div>
      </div>

      {/* Details Box */}
      <div className="mt-8 bg-stone-900 border border-stone-800 rounded-lg p-4 min-h-[140px] relative overflow-hidden transition-all duration-300">
        <AnimatePresence mode="wait">
          {selectedGene ? (
            <motion.div
              key={selectedGene.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-nobel-gold text-stone-950 rounded font-sans">{selectedGene.chromosome}</span>
                  <span className="text-xs font-mono font-bold text-stone-300">Gene: {selectedGene.geneName}</span>
                  <span className="text-[10px] text-stone-400 font-serif italic">({selectedGene.source})</span>
                </div>
                <h4 className="font-serif text-lg text-white font-medium">{selectedGene.name}</h4>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">{selectedGene.description}</p>
                <div className="text-[10px] font-mono text-nobel-gold mt-2 font-bold uppercase tracking-wider">
                  SUPERPOWER: {selectedGene.superpower}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 border border-stone-800 bg-stone-950 rounded-lg text-center shrink-0 w-24">
                <div className="text-[8px] font-mono uppercase tracking-wider text-stone-500 leading-tight">P-Value Significance</div>
                <div className="text-2xl font-serif text-nobel-gold font-bold mt-1">10<sup className="text-xs">-{selectedGene.yValue.toFixed(0)}</sup></div>
                <span className="text-[9px] font-mono text-green-500 font-bold mt-1">★ EXTREME</span>
              </div>
            </motion.div>
          ) : hoveredNode ? (
            <div className="flex flex-col h-full justify-center">
              <h4 className="text-sm font-mono text-stone-300">Peak: Chromosome {hoveredNode.chromosome} ({hoveredNode.geneName})</h4>
              <p className="text-xs text-stone-500 mt-1">Click this signal node to extract physical adaptation details.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-28">
              <Info className="text-stone-600 mb-2" size={24} />
              <p className="text-xs text-stone-400 max-w-sm">
                Click any of the high <span className="text-red-400 font-bold">red peaks</span> in the Manhattan plot skyline to analyze specific superhuman genetic mutations.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- 3. GENE LAB SIMULATOR (COMBINATION & CRISPR LAB) ---
export const GeneLabSimulator: React.FC = () => {
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  const [viscosity, setViscosity] = useState<number>(1.0); // 1.0 (ideal) to 2.5 (thick)
  const [dangerAlerts, setDangerAlerts] = useState<string[]>([]);
  const [compIndex, setCompIndex] = useState<number>(100);

  // Aggregated physical metrics based on active splicing
  const [metrics, setMetrics] = useState({
    oxygen: 30, // baseline
    bones: 30,
    sleep: 30,
    pain: 30,
    speed: 30,
    buoyancy: 50 // baseline middle
  });

  const handleToggleGene = (id: string) => {
    setSelectedGenes((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleClear = () => {
    setSelectedGenes([]);
  };

  // Run business logic on combining genes
  useEffect(() => {
    const baseMetrics = { oxygen: 30, bones: 30, sleep: 30, pain: 30, speed: 30, buoyancy: 50 };
    let finalComp = 100;
    const alerts: string[] = [];

    selectedGenes.forEach((geneId) => {
      const gene = SUPERHUMAN_GENES.find((g) => g.id === geneId);
      if (gene) {
        baseMetrics.oxygen = Math.max(0, Math.min(100, baseMetrics.oxygen + gene.impact.oxygen));
        baseMetrics.bones = Math.max(0, Math.min(100, baseMetrics.bones + gene.impact.bones));
        baseMetrics.sleep = Math.max(0, Math.min(100, baseMetrics.sleep + gene.impact.sleep));
        baseMetrics.pain = Math.max(0, Math.min(100, baseMetrics.pain + gene.impact.pain));
        baseMetrics.speed = Math.max(0, Math.min(100, baseMetrics.speed + gene.impact.speed));
        baseMetrics.buoyancy = Math.max(0, Math.min(100, baseMetrics.buoyancy + gene.impact.buoyancy));
      }
    });

    // 1. Check for Sinking Sprinter Paradox (LRP5 bone density + FAM178B diving)
    if (selectedGenes.includes('lrp5') && selectedGenes.includes('fam178b')) {
      alerts.push(
        "🚨 THE SINKING SPRINTER PARADOX: Heavy skeleton density from LRP5 destroys your natural buoyancy. Staying afloat requires massive muscular strain, neutralizing the breath-hold capability of FAM178B."
      );
      finalComp -= 30;
    }

    // 2. Check for Oxygen Paradox (ACTN3 sprinter fast-twitch + EPAS1 altitude or FAM178B diving)
    if (selectedGenes.includes('actn3') && (selectedGenes.includes('epas1') || selectedGenes.includes('fam178b'))) {
      alerts.push(
        "🚨 THE OXYGEN PARADOX: Explosive fast-twitch muscle fibers from ACTN3 devour oxygen at a ferocious rate. This instantly drains the oxygen-conserving efficiency required for high altitude (EPAS1) or deep dives (FAM178B)."
      );
      finalComp -= 30;
    }

    // 3. Check for FAAH-OUT No-Pain danger + high athletic power
    if (selectedGenes.includes('faahout') && (selectedGenes.includes('actn3') || selectedGenes.includes('fam178b'))) {
      alerts.push(
        "⚠️ UNDETECTED TISSUE DAMAGE: Lacking physical pain receptors (FAAH-OUT) means you cannot detect explosive muscle tearing (ACTN3) or dangerous pressure builds in deep water (FAM178B), resulting in catastrophic, unnoticed tissue failure."
      );
      finalComp -= 15;
    }

    // Prevent negative index
    setCompIndex(Math.max(10, finalComp));
    setMetrics(baseMetrics);
    setDangerAlerts(alerts);
  }, [selectedGenes]);

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-sm border border-stone-200 w-full max-w-3xl mx-auto my-6">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl font-medium text-stone-900">CRISPR Splicing & Compatibility Simulator</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-lg mx-auto">
          Test the biological boundaries of human genetic modification. Splice different mutations together and watch physical trade-offs in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Interactive Toggles */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">Gene Splicing Vault</div>
          
          {SUPERHUMAN_GENES.map((gene) => {
            const isActive = selectedGenes.includes(gene.id);
            return (
              <button
                key={gene.id}
                onClick={() => handleToggleGene(gene.id)}
                className={`flex justify-between items-center p-3 rounded-lg border text-left transition-all ${isActive ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-1 ring-nobel-gold/50' : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'}`}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                    {gene.chromosome} • {gene.geneName}
                  </div>
                  <div className="text-xs font-bold font-serif leading-tight mt-0.5">{gene.name}</div>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isActive ? 'border-nobel-gold bg-nobel-gold/20 text-nobel-gold' : 'border-stone-300 bg-white'}`}>
                  {isActive ? <Zap size={10} /> : <div className="w-1.5 h-1.5 bg-transparent rounded-full" />}
                </div>
              </button>
            );
          })}

          {selectedGenes.length > 0 && (
            <button 
              onClick={handleClear}
              className="mt-2 text-center text-xs text-stone-400 hover:text-stone-800 font-mono transition-colors py-1.5 border border-dashed border-stone-200 rounded"
            >
              Reset / Reset Genome
            </button>
          )}
        </div>

        {/* Right Side: Attributes and Live Simulator Result */}
        <div className="md:col-span-7 bg-stone-50 border border-stone-200 p-5 rounded-xl">
          {/* Header Indicators */}
          <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
            <div>
              <div className="text-[9px] font-mono text-stone-400">GENOMIC PROFILE</div>
              <div className="text-sm font-bold font-serif text-stone-800">
                {selectedGenes.length === 0 ? "Baseline Lowlander Sapiens" : `Spliced Genome (${selectedGenes.length} Edits)`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono text-stone-400">MUTUAL SYNERGY INDEX</div>
              <div className={`text-sm font-bold font-mono ${compIndex > 70 ? 'text-green-600' : compIndex > 40 ? 'text-amber-500' : 'text-red-500 animate-pulse'}`}>
                {compIndex}% {compIndex > 70 ? '• Optimal' : compIndex > 40 ? '• Unstable' : '• Lethal Tradeoff'}
              </div>
            </div>
          </div>

          {/* Core Metrics Bars */}
          <div className="space-y-3">
            {[
              { label: "Oxygen Conservation (EPAS1 / FAM178B)", value: metrics.oxygen, color: "bg-blue-500" },
              { label: "Skeletal Density & Mass (LRP5)", value: metrics.bones, color: "bg-stone-600" },
              { label: "Sleep Cycle Efficiency (DEC2)", value: metrics.sleep, color: "bg-indigo-500" },
              { label: "Nociception Pain Immunity (FAAH-OUT)", value: metrics.pain, color: "bg-red-500" },
              { label: "Fast-Twitch Muscular Power (ACTN3)", value: metrics.speed, color: "bg-amber-500" },
              { label: "Static Buoyancy Level (Negative Sinking)", value: metrics.buoyancy, color: "bg-teal-500" }
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mb-0.5">
                  <span>{bar.label}</span>
                  <span className="font-bold">{bar.value}%</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${bar.color}`}
                    initial={{ width: '30%' }}
                    animate={{ width: `${bar.value}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 12 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dangers & Warnings Area */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {dangerAlerts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg space-y-2 max-h-48 overflow-y-auto"
                >
                  <div className="text-[10px] font-mono text-red-700 font-bold tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} /> BIOLOGICAL INCOMPATIBILITIES DETECTED
                  </div>
                  {dangerAlerts.map((alert, index) => (
                    <p key={index} className="text-[10px] text-red-600 leading-normal">{alert}</p>
                  ))}
                </motion.div>
              ) : selectedGenes.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg text-green-700 text-[10px] leading-relaxed flex items-center gap-2"
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  <div>
                    <strong>Splicing Stable:</strong> The current combination shows no lethal antagonistic biological trade-offs. The edited cell matrix remains metabolically viable.
                  </div>
                </motion.div>
              ) : (
                <div className="border border-dashed border-stone-300 p-4 text-center rounded-lg text-stone-400 text-xs font-serif italic">
                  Select mutations from the Left Panel to begin CRISPR recombination.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
