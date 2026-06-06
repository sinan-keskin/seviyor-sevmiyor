import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, RotateCcw, Volume2, VolumeX, Sparkles, HelpCircle, History } from 'lucide-react';
import { Petal, PluckResult, GameHistoryEntry, Sparkle } from '../types';
import { DaisyFlower } from '../components/DaisyFlower';
import { playPluckSound, playSuccessChime } from '../utils/audio';
import { JSON_BLOB_URL } from './History';

// Odd numbers are ideal to guarantee the game starts with 'Seviyor', alternates perfectly, and ends on 'Seviyor'.
const ODD_PETAL_OPTIONS = [9, 11, 13, 15];

export default function Game() {
  const [totalPetals, setTotalPetals] = useState<number>(11);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastResult, setLastResult] = useState<PluckResult | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [pulseCore, setPulseCore] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState<number>(0);
  const [showResultBubble, setShowResultBubble] = useState<boolean>(false);

  // Whimsical affirmative texts to display alongside "SEVIYOR" final screens (Extended & unique)
  const loveAffirmations = [
    "Şüphen olmasın, kalbi sadece senin için atıyor! ✨",
    "Yıldızlar bile bu kaderi onaylıyor, büyük bir aşk kapında! 🔮",
    "Aklındaki kişi seni her an, her saniye çılgınca özlüyor! 💕",
    "Zamanı durdurup sadece seni seyretmek isteyen biri var! 🌌",
    "Onun kalbinin en derin köşesinde sadece senin tatlı gülüşün saklı! 🌸",
    "Ruh eşini buldun! Sana olan bağlılığı her geçen gün daha da güçleniyor. 💫",
    "Gözlerini kapattığında aklına gelen o özel insan, şu an senin hayalini kuruyor! 💭",
    "Sevgisi o kadar büyük ki, seninle geçireceği harika günlerin rüyasını görüyor! 🥰",
    "Sana karşı hissettiği duygular tamamen gerçek, saf ve çok derinlerde... 💖",
    "Onun dünyasındaki en parlak ve en güzel ışık sensin, bunu sakın unutma! 🌟",
    "Her rüyasında sana giden bir yol arayan, seni her an düşünen bir kalp var. 🧸",
    "Aşkınız tüm mesafeleri ve engelleri yenecek kadar güçlü, tutkulu ve kalıcı! 🚀",
    "Senin tek bir tatlı sözün, onun tüm dünyasını anında güzelleştirmeye yetiyor! 🌺",
    "Gönlünün kapısını sonuna kadar sadece senin için açmış sıcacık bir sevgi var! 🔐",
    "Kalbini tamamen senin kollarına emanet etmiş durumda, sana olan özlemi tarifsiz! 🤗"
  ];

  // Initialize a new floral setup
  const initGame = () => {
    // Pick a random odd number of petals (makes each attempt organic and unique)
    const count = ODD_PETAL_OPTIONS[Math.floor(Math.random() * ODD_PETAL_OPTIONS.length)];
    setTotalPetals(count);

    const generatedPetals: Petal[] = Array.from({ length: count }, (_, idx) => {
      // Calculate angle: distribute uniformly over 360 degrees
      const angle = idx * (360 / count);
      // Generate slight scale variances to make the flower organic and lifelike
      const scaleX = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const scaleY = 0.95 + Math.random() * 0.15; // 0.95 to 1.1

      return {
        id: idx,
        angle,
        isPlucked: false,
        scaleX,
        scaleY,
      };
    });

    setPetals(generatedPetals);
    setHistory([]);
    setLastResult(null);
    setIsGameOver(false);
    setSparkles([]);

    // Select an affirmation index different from the previous one so they never repeat consecutively
    setCurrentAffirmationIndex((prevIdx) => {
      let nextIdx = Math.floor(Math.random() * loveAffirmations.length);
      while (nextIdx === prevIdx) {
        nextIdx = Math.floor(Math.random() * loveAffirmations.length);
      }
      return nextIdx;
    });
  };

  // Run on mount
  useEffect(() => {
    initGame();

    // Prevent right clicks globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent dragging images or links to avoid weird browser ghost selection
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Automatically fade out the mid-game pluck result after 1.2 seconds
  useEffect(() => {
    if (history.length === 0) {
      setShowResultBubble(false);
      return;
    }
    setShowResultBubble(true);
    const timer = setTimeout(() => {
      setShowResultBubble(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [history.length]);

  // Generate magical sparkles floating around the click region
  const triggerSparkles = () => {
    const newSparkles: Sparkle[] = Array.from({ length: 6 }, (_, idx) => ({
      id: Date.now() + idx + Math.random(),
      x: 35 + Math.random() * 30, // center clustered
      y: 35 + Math.random() * 30, // center clustered
      size: 4 + Math.random() * 8, // 4px to 12px
      delay: Math.random() * 0.2,
    }));
    
    setSparkles((prev) => [...prev, ...newSparkles]);

    // Cleanup old sparkles to keep the memory footprint low
    setTimeout(() => {
      setSparkles((prev) => prev.slice(6));
    }, 1500);
  };

  // Handle plucking of a single petal
  const handlePetalPluck = (petalId: number) => {
    if (isGameOver) return;

    // Play tactile sound if toggled on
    if (soundEnabled) {
      playPluckSound(history.length);
    }

    // Trigger visual spark explosions
    triggerSparkles();

    // Pulse the flower core quickly for feel
    setPulseCore(true);
    setTimeout(() => setPulseCore(false), 200);

    // Update petal plucked state
    setPetals((prevPetals) =>
      prevPetals.map((p) => (p.id === petalId ? { ...p, isPlucked: true } : p))
    );

    // Calculate step info
    const nextStep = history.length + 1;
    
    // Random outcomes until the last petal. The final petal always outputs SEVIYOR.
    let result: PluckResult;
    if (nextStep === totalPetals) {
      result = 'SEVIYOR';
    } else {
      result = Math.random() < 0.5 ? 'SEVIYOR' : 'SEVMIYOR';
    }

    setLastResult(result);

    // Update history tracker
    const newEntry: GameHistoryEntry = {
      step: nextStep,
      petalId,
      result,
    };
    setHistory((prev) => [...prev, newEntry]);

    // Check if that was the final petal of the daisy
    if (nextStep === totalPetals) {
      setIsGameOver(true);

      // Save to global history
      fetch(JSON_BLOB_URL)
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) data = [];
          data.push({ date: new Date().toISOString(), result: 'SEVIYOR' });
          fetch(JSON_BLOB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(err => console.error("History update error", err));
        })
        .catch(err => console.error("History fetch error", err));

      // Play celestial harp sweep!
      if (soundEnabled) {
        setTimeout(() => playSuccessChime(), 600);
      }
    }
  };

  const randomAffirmation = loveAffirmations[currentAffirmationIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0b2e] font-sans flex flex-col justify-center items-center text-slate-100 p-4 sm:p-6 md:p-8">
      
      {/* Background Ambient Lights - Gorgeous Pink/Purple Gradients matching Immersive UI */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-glow-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-glow-2" />
        <div className="absolute -bottom-20 left-[20%] w-96 h-96 rounded-full bg-violet-700/15 blur-[140px] opacity-25 animate-glow-3" />
      </div>

      {/* Floating sparkles created dynamically on tap */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {sparkles.map((sp) => (
            <motion.div
              key={sp.id}
              className="absolute text-pink-300"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
              }}
              initial={{ scale: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                scale: [0, 1.2, 0.4],
                y: -120 - Math.random() * 80,
                x: (Math.random() - 0.5) * 100,
                opacity: [1, 0.9, 0],
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
              transition={{
                duration: 1.5,
                delay: sp.delay,
                ease: 'easeOut',
              }}
            >
              <Sparkles size={sp.size} className="fill-pink-200" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Board Container */}
      <main className="relative z-10 flex-grow w-full max-w-md mx-auto flex flex-col justify-center items-center py-6 sm:py-8">
        
        {/* Back-plate Glass Card */}
        <div className="w-full glass-card rounded-[3rem] p-6 sm:p-8 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden">
          
          {/* Glowing ambient light inside the card */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400/30 to-transparent" />
          
          {/* Decorative Elements inside the glass card to match Immersive UI */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-1/4 left-6 w-2 h-2 bg-white rounded-full opacity-20"></div>
            <div className="absolute bottom-1/4 right-6 w-3 h-3 bg-pink-400 rounded-full opacity-20"></div>
            <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-30"></div>
          </div>
          
          {/* Step description tracker */}
          <div className="text-center w-full z-10 mb-2 mt-4">
            <h1 className="text-white text-3xl font-light tracking-widest uppercase mb-2">
              Seviyor Sevmiyor
            </h1>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto"></div>
            <p className="text-pink-200/60 text-sm mt-4 tracking-wide font-light">
              {isGameOver
                ? 'Gelecek senin ellerinde...'
                : 'Başlamak için yapraklara dokun!'}
            </p>
          </div>

          {/* Interactive Flower Canvas Row */}
          <div className="relative my-4 flex items-center justify-center w-full min-h-[260px] sm:min-h-[300px]">
            <DaisyFlower
              petals={petals}
              onPluck={handlePetalPluck}
              isGameOver={isGameOver}
              pulseCore={pulseCore}
            />

            {/* Mid-game dynamic floating word indicator */}
            <AnimatePresence mode="popLayout">
              {showResultBubble && lastResult && !isGameOver && (
                <motion.div
                  key={history.length}
                  initial={{ opacity: 0, scale: 0.6, y: 15 }}
                  animate={{ opacity: 1, scale: 1.15, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -40 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-30"
                >
                  <span
                    className={`text-3xl font-serif italic px-8 py-3.5 rounded-full shadow-lg border backdrop-blur-md tracking-wider ${
                      lastResult === 'SEVIYOR'
                        ? 'bg-gradient-to-r from-rose-500/25 to-pink-500/25 border-pink-400/40 text-pink-100 shadow-pink-500/5 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                        : 'bg-gradient-to-r from-violet-500/25 to-purple-500/25 border-purple-400/40 text-purple-100 shadow-purple-500/5 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    }`}
                  >
                    {lastResult === 'SEVIYOR' ? 'Seviyor ❤️' : '💔 Sevmiyor'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Plucking History Beads Track */}
          <div className="w-full mt-2 z-10">
            {history.length > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold tracking-widest text-pink-300/40 uppercase">Yaprak Geçmişi</span>
                <div className="flex items-center justify-center flex-wrap gap-1.5 max-w-[280px]">
                  {history.map((h, i) => (
                    <motion.div
                      key={h.step}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        h.result === 'SEVIYOR'
                          ? 'bg-pink-500 border-pink-300 shadow-sm shadow-pink-500/30'
                          : 'bg-purple-600 border-purple-400'
                      }`}
                      title={`${h.step}. Yaprak: ${h.result}`}
                    />
                  ))}
                  {/* Future blank placeholders */}
                  {Array.from({ length: totalPetals - history.length }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-white/10 bg-white/5 opacity-50"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center text-pink-300/30 italic tracking-wider"
              >
                İlk yaprağı kopararak kaderini belirlemeye başla...
              </motion.p>
            )}
          </div>

        </div>
      </main>

      {/* Love Celebration Overlay - Triggered on last pluck */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0c0516]/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.15 }}
              className="w-full max-w-sm glass-card rounded-[3rem] p-8 border border-pink-400/30 shadow-2xl shadow-pink-500/20 text-center relative overflow-hidden"
            >
              {/* Internal radiant particle halos */}
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-pink-500/10 blur-2xl" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl" />

              {/* Decorative Elements inside celebration modal */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-1/4 left-6 w-2 h-2 bg-white rounded-full opacity-10"></div>
                <div className="absolute bottom-1/4 right-6 w-3 h-3 bg-pink-400 rounded-full opacity-15"></div>
              </div>

              {/* Glowing Beating Heart Visual Anchor */}
              <motion.div
                className="mx-auto w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 shadow-xl shadow-rose-500/30 relative"
                animate={{ scale: [1, 1.15, 0.98, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Heart size={44} className="text-white fill-white" />
                
                {/* Outward rings of romance waves */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-pink-300/50"
                  animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                />
              </motion.div>

              {/* Bold Celebration Headers */}
              <h2 className="text-6xl font-serif italic text-pink-100 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] mb-4">
                Seviyor!
              </h2>
              <span className="inline-block text-[10px] uppercase font-bold text-pink-300/60 tracking-widest bg-pink-900/40 border border-pink-500/20 px-3 py-1 rounded-full mb-6">
                Kader Tamamlandı
              </span>

              {/* Poetic Affirmative Love Blurbs */}
              <p className="text-sm text-pink-100/90 leading-relaxed font-normal mb-8 max-w-xs mx-auto">
                {randomAffirmation}
              </p>

              {/* Interactive Reset Action */}
              <button
                id="reset-btn"
                onClick={initGame}
                className="w-full py-3.5 rounded-2xl font-semibold tracking-wide bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                Yeniden Dene
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
