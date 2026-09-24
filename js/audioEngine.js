/**
 * NEXUS STUDIO - Web Audio API Tactile Sound Engine
 * Synthesizes dynamic micro-interactions & feedback tones natively
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.isMuted = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.enabled = true;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    if (!this.enabled || !this.ctx) {
      this.init();
    }
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playChime();
    }
    return !this.isMuted;
  }

  playHover() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.018, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      // Ignore audio error if user hasn't interacted
    }
  }

  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      // Ignore audio error
    }
  }

  playChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);
        
        gain.gain.setValueAtTime(0.03, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.04 + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.26);
      });
    } catch (e) {
      // Ignore
    }
  }

  playSuccess() {
    if (this.isMuted || !this.ctx) return;
    try {
      const chords = [440, 554.37, 659.25, 880]; // A Major arpeggio
      chords.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.36);
      });
    } catch (e) {
      // Ignore
    }
  }
}

export const soundEngine = new AudioEngine();
