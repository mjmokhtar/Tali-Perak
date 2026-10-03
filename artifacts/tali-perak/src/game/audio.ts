export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  volume = 0.6;
  muted = false;
  private timer: number | null = null;
  private beatAt = 0;
  private step = 0;
  private lowCord = false;

  private apply() {
    if (this.master) this.master.gain.value = this.muted ? 0 : this.volume * 0.5;
  }
  setVolume(v: number) { this.volume = v; this.apply(); }
  setMuted(m: boolean) { this.muted = m; this.apply(); }

  start() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = new AC();
    this.ctx = c;
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.apply();
    // rain: filtered noise
    const len = c.sampleRate * 2;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.4;
    const g = c.createGain(); g.gain.value = 0.12;
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start();
    // drone pad
    [55, 82.4, 110.2].forEach((fr, i) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr;
      const og = c.createGain(); og.gain.value = 0.07;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.08 + i * 0.05;
      const lg = c.createGain(); lg.gain.value = 0.03;
      lfo.connect(lg); lg.connect(og.gain);
      o.connect(og); og.connect(this.master!);
      o.start(); lfo.start();
    });
    this.timer = window.setInterval(() => this.tick(), 1700);
  }

  private tone(freq: number, dur: number, vol: number, type: OscillatorType = 'triangle', delay = 0) {
    const c = this.ctx; if (!c || !this.master) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  private tick() {
    if (this.ctx?.state !== 'running') return;
    // slow melancholic pentatonic (A minor-ish), sparse
    const scale = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
    const seq = [0, 2, 4, 3, 1, 2, 5, 4, 2, 0, 3, 1];
    if (Math.random() < 0.7) this.tone(scale[seq[this.step % seq.length]], 2.4, 0.12, 'triangle');
    this.step++;
  }

  pickup() {
    this.tone(660, 0.6, 0.18, 'sine');
    this.tone(880, 0.8, 0.14, 'sine', 0.12);
    this.tone(1318, 1.0, 0.1, 'sine', 0.26);
  }
  notice() { this.tone(330, 0.4, 0.12, 'square'); }

  setCord(cord: number, status: string) {
    if (this.ctx) {
      const paused = document.hidden || ['paused', 'lost', 'menu'].includes(status);
      if (paused && this.ctx.state === 'running') this.suspend();
      else if (!paused && this.ctx.state === 'suspended') this.resume();
    }
    this.lowCord = cord < 25 && status === 'playing';
    const c = this.ctx; if (!c || !this.lowCord) return;
    if (c.currentTime > this.beatAt) {
      this.tone(52, 0.25, 0.5, 'sine');
      this.tone(48, 0.25, 0.4, 'sine', 0.22);
      this.beatAt = c.currentTime + 1.1 - (30 - cord) / 60;
    }
  }

  suspend() { void this.ctx?.suspend(); }
  resume() { void this.ctx?.resume(); }
  destroy() { if (this.timer) clearInterval(this.timer); void this.ctx?.close(); this.ctx = null; }
}
