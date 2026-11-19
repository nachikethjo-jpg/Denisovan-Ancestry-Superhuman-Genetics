/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DnaHelixScene, SpleenScubaScene, HimalayanAltitudeScene } from './components/QuantumScene';
import { 
  AdaptiveIntrogressionDiagram, 
  ManhattanPlotDiagram, 
  GeneLabSimulator, 
  SUPERHUMAN_GENES, 
  GeneInfo 
} from './components/Diagrams';
import { 
  ArrowDown, 
  Menu, 
  X, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  Compass, 
  CheckCircle, 
  HelpCircle,
  Dna,
  Heart,
  Eye,
  Settings
} from 'lucide-react';

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Altitude Section State
  const [altitude, setAltitude] = useState<number>(14000); // 14,000 feet default (Tibetan Plateau)
  const [isTibetan, setIsTibetan] = useState<boolean>(true);

  // Dive Section State
  const [diveDepth, setDiveDepth] = useState<number>(150); // 150 feet default
  
  // GWAS selected gene
  const [selectedGene, setSelectedGene] = useState<GeneInfo | null>(SUPERHUMAN_GENES[0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-stone-900 selection:text-white antialiased">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-3 border-b border-stone-200/50' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm pb-0.5">🧬</div>
            <span className="font-serif font-bold text-base tracking-wider text-stone-900">
              GENE.MOSAIC <span className="font-normal text-stone-500 text-xs tracking-normal">2026</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-widest text-stone-600">
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Legacy</a>
            <a href="#sky-sea" onClick={scrollToSection('sky-sea')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Sky & Sea</a>
            <a href="#gwas" onClick={scrollToSection('gwas')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">GWAS Peak</a>
            <a href="#crispr" onClick={scrollToSection('crispr')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">CRISPR Lab</a>
            <a href="#ethics" onClick={scrollToSection('ethics')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase">Ethics</a>
            <a 
              href="#crispr" 
              onClick={scrollToSection('crispr')} 
              className="px-4 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors shadow-sm text-[10px] tracking-widest uppercase"
            >
              Splice Genome
            </a>
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-6 text-lg font-serif"
          >
            <a href="#intro" onClick={scrollToSection('intro')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase text-stone-500">Denisovan Legacy</a>
            <a href="#sky-sea" onClick={scrollToSection('sky-sea')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase text-stone-500">Sky & Sea</a>
            <a href="#gwas" onClick={scrollToSection('gwas')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase text-stone-500">GWAS Discovery</a>
            <a href="#crispr" onClick={scrollToSection('crispr')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase text-stone-500">CRISPR Lab</a>
            <a href="#ethics" onClick={scrollToSection('ethics')} className="hover:text-stone-900 transition-colors cursor-pointer uppercase text-stone-500">Ethics & Risks</a>
            <a 
              href="#crispr" 
              onClick={scrollToSection('crispr')} 
              className="px-6 py-2.5 bg-stone-900 text-white rounded-full shadow-lg text-xs tracking-widest uppercase mt-4"
            >
              Splice Genome
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-[#141413]">
        <DnaHelixScene />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(20,20,19,0.3)_0%,rgba(20,20,19,0.85)_60%,rgba(20,20,19,1)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center mt-8">
          <div className="inline-block mb-4 px-3 py-1 border border-stone-700 text-stone-400 text-[10px] tracking-[0.25em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/5">
            Genomics & Paleoanthropology • Nature Editorial
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal leading-tight mb-6 text-stone-100">
            EPAS1 <br/><span className="italic font-light text-stone-400 text-2xl md:text-4xl block mt-2">Denisovan Ancestry's Evolutionary Gift</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-stone-400 font-light leading-relaxed mb-12">
            Tens of thousands of years ago, early humans interbred with now-extinct Denisovans. Today, that ancient encounter equips modern populations to conquer extreme Himalayan altitudes and deep-sea aquatic pressures.
          </p>
          
          <div className="flex justify-center">
             <a href="#intro" onClick={scrollToSection('intro')} className="group flex flex-col items-center gap-2 text-xs font-bold tracking-widest text-stone-400 hover:text-white transition-colors cursor-pointer">
                <span>ENTER THE NARRATIVE</span>
                <span className="p-2 border border-stone-800 rounded-full group-hover:border-stone-500 transition-colors bg-white/5">
                    <ArrowDown size={14} />
                </span>
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* Intro Section */}
        <section id="intro" className="py-24 bg-white border-b border-stone-200">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Adaptive Introgression</span>
              <h2 className="font-serif text-3xl md:text-4xl mb-6 leading-tight text-stone-900 mt-1">The Mosaic Hominin</h2>
              <div className="w-12 h-1 bg-stone-900 mb-6"></div>
              <p className="text-sm text-stone-500 leading-relaxed font-light">
                Modern humans are not a single, isolated branch on the evolutionary tree, but rather a complex genetic mosaic. Through <strong className="text-stone-800 font-semibold">adaptive introgression</strong>, interbreeding with extinct sister species introduced powerful, ready-made genetic variants that natural selection carved into survival tools.
              </p>
            </div>
            
            <div className="md:col-span-7 text-sm text-stone-600 leading-relaxed space-y-6">
              <p>
                <span className="text-4xl float-left mr-3 mt-[-4px] font-serif text-stone-900 font-bold">W</span>hen geneticists sequenced the specific Tibetan variant of the <strong className="text-stone-900 font-semibold">EPAS1 gene</strong>, they discovered it was so profoundly divergent from other modern human DNA that simple recent mutation was statistically impossible.
              </p>
              <p>
                In 2014, researchers discovered a near-perfect match in the DNA of a <strong className="text-stone-900 font-semibold">Denisovan</strong>—an extinct hominin whose fossil remains were found in a Siberian cave. Early Sapiens pioneers interbred with Denisovans, incorporating these genes. Later, as humans ascended the high Tibetan Plateau and settled Southeast Asia’s archipelagos, this dormant genetic legacy was activated.
              </p>
              <p className="text-stone-500 italic">
                Below, click through the steps of this epic evolutionary transaction to see how genes travelled thousands of years to conquer both sky and sea.
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <AdaptiveIntrogressionDiagram />
          </div>
        </section>

        {/* Dual Simulation Section: Sky and Sea */}
        <section id="sky-sea" className="py-24 bg-[#F5F4F0] border-b border-stone-200">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Interactive Physiology Simulator</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-1 text-stone-900">Physiological Frontiers: Sky vs. Sea</h2>
              <p className="text-xs text-stone-500 mt-2">
                Configure altitude and diving depths below to observe the immediate cellular responses of the EPAS1 and FAM178B mutations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* SKY: Tibetan Altitude (EPAS1) */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">SKY ADAPTATION: EPAS1</span>
                    <span className="text-xs font-mono font-bold text-stone-400">Altitude: {altitude.toLocaleString()} FT</span>
                  </div>
                  
                  <h3 className="font-serif text-xl mt-3 text-stone-900">Tibet's Hypoxia Defense</h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">
                    For lowland humans, oxygen depletion at extreme altitudes forces the body to overproduce red blood cells. This thickens the blood, leading to blood clots, strokes, and chronic mountain sickness. Tibetans carry the Denisovan <strong className="text-stone-800">EPAS1</strong> variant, which prevents this hyper-response, allowing thin, highly efficient blood flow in thin air.
                  </p>

                  {/* Interactivity controls */}
                  <div className="my-6 space-y-4">
                    <div>
                      <label className="flex justify-between text-[11px] font-mono text-stone-500 mb-1">
                        <span>ALTITUDE LEVEL (FEET)</span>
                        <span className="font-bold text-stone-700">{altitude} ft</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="20000" 
                        step="1000"
                        value={altitude} 
                        onChange={(e) => setAltitude(parseInt(e.target.value))}
                        className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-stone-400 mt-1">
                        <span>Sea Level</span>
                        <span>Mt. Everest Base (17,600ft)</span>
                      </div>
                    </div>

                    <div className="flex gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className={isTibetan ? 'text-green-500' : 'text-red-500 animate-pulse'} />
                        <span className="text-xs font-medium text-stone-700">Genetic Variant Profile</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setIsTibetan(true)}
                          className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${isTibetan ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-400'}`}
                        >
                          Tibetan (EPAS1)
                        </button>
                        <button 
                          onClick={() => setIsTibetan(false)}
                          className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors ${!isTibetan ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-400'}`}
                        >
                          Lowlander (Default)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Himalayan visual */}
                <div className="h-56 relative rounded-lg overflow-hidden border border-stone-200 mt-2">
                  <HimalayanAltitudeScene altitude={altitude} isTibetan={isTibetan} />
                </div>
              </div>

              {/* SEA: Bajau Freediving (FAM178B & Spleen size) */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">SEA ADAPTATION: FAM178B</span>
                    <span className="text-xs font-mono font-bold text-stone-400">Dive Depth: {diveDepth} FT</span>
                  </div>

                  <h3 className="font-serif text-xl mt-3 text-stone-900">Sea Nomad Spleen & CO₂ Buffer</h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">
                    The Bajau "Sea Nomads" spend up to 60% of their working day diving to extreme depths. They possess a thyroid-related gene mutation (<strong className="text-stone-800">PDE10A</strong>) which expands their spleen by 50% to act as a biological scuba tank of red blood cells. Crucially, they also inherited a Denisovan variant of the <strong className="text-stone-800">FAM178B</strong> gene, which buffers CO₂ buildup to keep blood from becoming acidic and prevent breath-hold panic.
                  </p>

                  {/* Interactivity controls */}
                  <div className="my-6 space-y-4">
                    <div>
                      <label className="flex justify-between text-[11px] font-mono text-stone-500 mb-1">
                        <span>DIVE DEPTH (FEET)</span>
                        <span className="font-bold text-stone-700">{diveDepth} ft</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="250" 
                        step="10"
                        value={diveDepth} 
                        onChange={(e) => setDiveDepth(parseInt(e.target.value))}
                        className="w-full accent-stone-800 h-1 bg-stone-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-stone-400 mt-1">
                        <span>Wading</span>
                        <span>Traditional Diving Limit (230ft)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] text-stone-600 font-mono">
                      <div className="flex justify-between">
                        <span>MAMMALIAN DIVING REFLEX:</span>
                        <span className="text-teal-600 font-bold uppercase">{diveDepth > 10 ? "Active • Heart Rate Slowed" : "Inactive"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D Spleen contraction visual */}
                <div className="h-56 relative rounded-lg overflow-hidden border border-stone-200 mt-2">
                  <SpleenScubaScene diveDepth={diveDepth} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Genome Explorer / Manhattan Plot Section */}
        <section id="gwas" className="py-24 bg-white border-b border-stone-200">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Genome-Wide Association Study</span>
              <h2 className="font-serif text-3xl md:text-4xl mt-1 text-stone-900">Mapping the Superhuman Baselines</h2>
              <p className="text-xs text-stone-500 mt-2">
                We discover these traits by comparison baselines. Click on the Manhattan peaks below to isolate specific mutations discovered in outliers of the general population.
              </p>
            </div>

            <ManhattanPlotDiagram onSelectGene={setSelectedGene} selectedGene={selectedGene} />
            
            {/* Cards for other traits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                { title: "Unbreakable Bones (LRP5)", emoji: "🦴", desc: "A gain-of-function mutation continuous-rebuilds skeletal mass, creating bones that withstand major vehicle collisions without fractures." },
                { title: "The Short Sleeper (DEC2)", emoji: "⏱️", desc: "Circadian rhythm acceleration enables fully rested, high-energy cognitive capacity on only 4 to 6 hours of sleep nightly with no fatigue." },
                { title: "Pain & Panic Immunity", emoji: "🧠", desc: "A microdeletion in FAAH-OUT stops breakdown of the bliss molecule anandamide. Zero pain registry, low anxiety, hyper-healing." },
                { title: "Explosive Fast-Twitch", emoji: "⚡", desc: "The ACTN3 sprinter gene produces critical fast-twitch actinin-3 protein, fueling Olympic-level explosive acceleration." }
              ].map((card, i) => (
                <div key={i} className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="text-2xl mb-3">{card.emoji}</div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">{card.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recombination Splicing CRISPR Lab */}
        <section id="crispr" className="py-24 bg-[#F5F4F0] border-b border-stone-200">
          <div className="container mx-auto px-6">
            <GeneLabSimulator />
          </div>
        </section>

        {/* Ethics, Downside, and Discovery Science */}
        <section id="ethics" className="py-24 bg-white">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Downside Column */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-stone-500" /> EVOLUTIONARY TRADE-OFFS & DOWNSIDES
                </span>
                <h3 className="font-serif text-2xl md:text-3xl mt-1 text-stone-900">The Cost of Perfection</h3>
                <div className="w-12 h-1 bg-stone-900 my-4"></div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Every "superpower" has an evolutionary price. Natural evolution doesn't optimize for vanity or comfort; it optimizes strictly for localized reproductive survival. Over-engineering specific traits degrades secondary architectures.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Pain is a Crucial Bio-Alarm",
                    text: "Pain-free mutants like Jo Cameron frequently suffer severe silent burns, orthopedic degradation, and joint destruction because their bodies do not scream a warning to stop or withdraw."
                  },
                  {
                    title: "The Viscosity Squeeze",
                    text: "If lowlanders attempt to duplicate high-altitude hemoglobin retention without the EPAS1 throttle, blood dangerously thickens into viscous sludge, destroying capillaries and triggering early coronary failures."
                  },
                  {
                    title: "Skeletal Ballast vs. Buoyancy",
                    text: "LRP5 unbreakable skeletons significantly weigh down human ballast. In aquatic environments, carriers sink. Swimming to safety requires twice the physical calorie expenditure, exposing them to drowning."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="text-stone-900 font-serif font-bold text-sm bg-stone-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{idx+1}</div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase font-sans tracking-wider">{item.title}</h4>
                      <p className="text-xs text-stone-500 leading-relaxed mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CRISPR Ethics and Discovery Column */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono flex items-center gap-1.5">
                  <Compass size={12} className="text-stone-500" /> ETHICAL HORIZONS
                </span>
                <h3 className="font-serif text-2xl md:text-3xl mt-1 text-stone-900">Forcing the Genome: CRISPR-Cas9</h3>
                <div className="w-12 h-1 bg-stone-900 my-4"></div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  While statistical probabilities guarantee a natural "super-mutant" with all five traits will never exist, biotechnology bypasses standard probability. CRISPR-Cas9 serves as molecular scissors to cut out standard sequences and splice in Denisovan or outlier variants.
                </p>
              </div>

              <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="font-serif italic text-base text-stone-900 font-bold mb-2">"Fixing Disease vs. Upgrading Baselines"</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Right now, CRISPR is approved only to reverse lethal pathologies like sickle-cell anemia. However, the mechanism does not distinguish therapeutic correction from cosmetic or capability upgrading. Splicing LRP5, DEC2, or EPAS1 into embryonic lineages is technically feasible—forcing an engineered human class that standard natural selection never would have permitted.
                </p>
                <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center text-[10px] font-mono text-stone-400">
                  <span>BIOETHICS COMMITTEE REVIEW</span>
                  <span className="text-stone-500 font-bold">STATUS: DRAFTING POLICY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">GWAS SCANNING</div>
                  <div className="text-lg font-serif font-bold text-stone-900 mt-1">3.2B</div>
                  <p className="text-[10px] text-stone-500 mt-1">Base pairs mapped simultaneously across populations to locate outliers.</p>
                </div>
                <div className="border border-stone-200 rounded-lg p-4">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">SENSITIVITY</div>
                  <div className="text-lg font-serif font-bold text-stone-900 mt-1">10<sup className="text-xs">-9</sup></div>
                  <p className="text-[10px] text-stone-500 mt-1">P-value thresholds ensuring pinpoint isolation of causal loci.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Editorial Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 border-t border-stone-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-1 flex items-center justify-center md:justify-start gap-2">
                  <span>🧬</span> GENE.MOSAIC
                </div>
                <p className="text-xs max-w-sm">Anthropological & Genetic Exploration of Denisovan Legacies and Spontaneous Mutational Superpowers.</p>
            </div>
            <div className="flex gap-6 text-[10px] font-mono tracking-widest text-stone-500 uppercase">
              <a href="#intro" className="hover:text-stone-300 transition-colors">Intro</a>
              <a href="#sky-sea" className="hover:text-stone-300 transition-colors">Simulations</a>
              <a href="#gwas" className="hover:text-stone-300 transition-colors">GWAS Plot</a>
              <a href="#crispr" className="hover:text-stone-300 transition-colors">CRISPR Lab</a>
            </div>
        </div>
        <div className="text-center mt-12 text-[10px] text-stone-600 font-mono">
            Research compiled from 23andMe, Nature Medicine (2014/2018), and Bio-Anthropological reports. Generated by AI Coding Agent.
        </div>
      </footer>
    </div>
  );
};

export default App;
