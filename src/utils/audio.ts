// Web Audio API Synthesizer for sweet tactile audio feedback without external assets
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPluckSound(index: number) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Dynamic sweet tone: alternates or scales pitch slightly based on the step index
    // A nice clean kalimba/marimba like pluck
    const baseFreq = 261.63; // C4
    const pentatonicScales = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25, 2.5, 3];
    const multiplier = pentatonicScales[index % pentatonicScales.length];
    
    osc.frequency.setValueAtTime(baseFreq * multiplier, ctx.currentTime);
    osc.type = 'triangle'; // Sweet, hollow wooden sound

    // Fast pluck envelope
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.warn('Audio play blocked or unsupported', error);
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Beautiful rolling arpeggio of chimes (pentatonic major sweep in F# / Db)
    const tones = [311.13, 369.99, 415.30, 466.16, 554.37, 622.25, 739.99, 830.61, 932.33];

    tones.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, now + delay);
      osc.type = 'sine'; // pure crystal clear bell sound

      gainNode.gain.setValueAtTime(0.0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.2, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  } catch (error) {
    console.warn('Success audio blocked or unsupported', error);
  }
}
