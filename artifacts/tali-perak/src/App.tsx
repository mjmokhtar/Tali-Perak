import { useCallback, useEffect, useRef, useState } from 'react';
import { Game, MEMORIES, HOME_MEMORY_REQUIREMENT, countMemories, getCollectedMemories, type State } from '@/game/engine';
import { STORY } from '@/game/story';
import { render, VW, VH } from '@/game/render';
import { GameAudio } from '@/game/audio';

type Panel = null | 'journal' | 'help' | 'settings';
type Save = { slot: number; name: string; chapter: number; cord: number; savedAt: number | string } | null;

const CHAPTER_TITLES = ['Bab 1 - Jalan Hujan', 'Bab 2 - Kota Lampu', 'Bab 3 - Rumah yang Menunggu', 'Bab 4 - Jam Kunjungan', 'Bab 5 - Pilihan'];
const OBJECTIVES = [
  'Kumpulkan sedikitnya 2 kenangan, lalu menujulah ke cahaya di ujung jalan.',
  'Kumpulkan sedikitnya 2 kenangan, rasuki lampu gerbang, lalu menuju rumah.',
  STORY.homeObjective,
  STORY.hospitalObjective,
  STORY.icuObjective,
];

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem('tali-perak-prefs') || '');
    if (!p || typeof p.vol !== 'number' || !Number.isFinite(p.vol) || typeof p.muted !== 'boolean') throw new Error('Invalid preferences');
    return { vol: Math.max(0, Math.min(1, p.vol)), muted: p.muted };
  }
  catch { return { vol: 0.6, muted: false }; }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const audioRef = useRef<GameAudio>(new GameAudio());
  const keysRef = useRef<Set<string>>(new Set());
  const [st, setSt] = useState<State | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [name, setName] = useState('Laras');
  const [slot, setSlot] = useState(0);
  const [saves, setSaves] = useState<Save[]>([]);
  const [scale, setScale] = useState(3);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [view, setView] = useState<'main' | 'new' | 'continue'>('main');
  const [journalSlot, setJournalSlot] = useState(-1);

  const refreshSaves = useCallback(() => {
    setSaves((gameRef.current?.getSaves() ?? []) as Save[]);
  }, []);

  useEffect(() => {
    const game = new Game((s) => setSt({ ...s }));
    gameRef.current = game;
    setSt({ ...game.state });
    refreshSaves();
    const audio = audioRef.current;
    audio.setVolume(prefs.vol); audio.setMuted(prefs.muted);

    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.25, (now - last) / 1000); last = now;
      const s = game.state;
      if (s.status !== 'menu' && s.status !== 'paused') {
        acc += dt;
        while (acc >= 1 / 60) { game.update(1 / 60, keysRef.current); acc -= 1 / 60; }
      } else acc = 0;
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) render(ctx, game, now / 1000);
      audio.setCord(game.state.cord, game.state.status);
    };
    raf = requestAnimationFrame(loop);

    const pause = () => {
      keysRef.current.clear();
      if (game.state.status === 'playing' || game.state.status === 'dialogue') game.setPaused(true);
      audio.suspend();
    };
    const vis = () => { if (document.hidden) pause(); };
    const typing = (e: Event) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    };
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const k = e.key.toLowerCase();
      const s = game.state.status;
      const active = s === 'playing' || s === 'dialogue';
      if (active && (k.startsWith('arrow') || k === ' ' || k === 'spacebar')) e.preventDefault();
      if (k === 'escape') {
        keysRef.current.clear();
        if (s === 'playing' || s === 'dialogue') game.setPaused(true);
        else if (s === 'paused') { setPanel(null); game.setPaused(false); audio.resume(); }
        return;
      }
      if (e.repeat) { if (active) keysRef.current.add(k); return; }
      if (s === 'dialogue' && (k === 'z' || k === ' ' || k === 'enter')) { game.closeDialogue(); return; }
      if (s === 'playing' && (k === 'z' || k === ' ' || k === 'enter')) game.act();
      keysRef.current.add(k);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', vis);
      game.destroy(); audio.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fit = () => setScale(Math.max(1, Math.floor(Math.min(window.innerWidth / VW, window.innerHeight / VH))));
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // audio cues
  const prevFrag = useRef(0);
  useEffect(() => {
    if (!st) return;
    if (st.fragments.length > prevFrag.current) audioRef.current.pickup();
    prevFrag.current = st.fragments.length;
  }, [st]);

  const setPref = (p: Partial<{ vol: number; muted: boolean }>) => {
    const n = { ...prefs, ...p };
    setPrefs(n);
    try { localStorage.setItem('tali-perak-prefs', JSON.stringify(n)); }
    catch { setSaveFail(true); }
    audioRef.current.setVolume(n.vol); audioRef.current.setMuted(n.muted);
  };

  const g = gameRef.current;
  const begin = () => { audioRef.current.start(); };
  const [saveFail, setSaveFail] = useState(false);
  const [confirmOver, setConfirmOver] = useState(false);
  const newGame = () => {
    keysRef.current.clear(); setConfirmOver(false); begin(); g?.start(name.trim() || 'Laras', slot + 1); refreshSaves(); setView('main'); setPanel(null); };
  const cont = (s: number) => { begin(); if (g?.load(s + 1)) { setView('main'); setPanel(null); } };
  const resume = () => { setPanel(null); g?.setPaused(false); audioRef.current.resume(); };
  const toMenu = () => {
    if (!g) return;
    if (!g.save()) { setSaveFail(true); return; }
    g.destroy();
    window.location.reload();
  };
  const touch = (k: string, on: boolean) => { if (on) keysRef.current.add(k); else keysRef.current.delete(k); };

  const status = st?.status ?? 'menu';
  const area = g?.area;
  const menuMode = status === 'menu';
  const latestSave = saves.reduce((best, s, i) => (s && (best < 0 || String(s.savedAt) > String(saves[best]?.savedAt)) ? i : best), -1);
  const journalIdx = journalSlot >= 0 && saves[journalSlot] ? journalSlot : latestSave;
  const collected = new Set<string>(menuMode
    ? (journalIdx >= 0 ? getCollectedMemories(journalIdx + 1) : [])
    : [...(st?.fragments ?? []), ...(st?.objects ?? []).filter((o) => o.startsWith('spent-')).map((o) => o.slice(6))]);
  const found = (id: string) => collected.has(id);
  const fmt = (v: number | string) => { try { return new Date(v).toLocaleString('id-ID'); } catch { return ''; } };

  const journal = (
    <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
      {menuMode && journalIdx < 0 && (
        <p className="text-[15px] opacity-80" data-testid="text-journal-empty">Belum ada simpanan. Mulai perjalanan untuk mengumpulkan kenangan.</p>
      )}
      {menuMode && saves.filter(Boolean).length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {saves.map((s, i) => s && (
            <button key={i} className="btn" style={journalIdx === i ? { background: '#f6cf62', color: '#070b18' } : undefined}
              onClick={() => setJournalSlot(i)} data-testid={`journal-slot-${i}`}>Slot {i + 1}: {s.name}</button>
          ))}
        </div>
      )}
      {MEMORIES.map((m) => (
        <div key={m.id} className="border-l-4 pl-3" style={{ borderColor: found(m.id) ? '#f6cf62' : '#2b2250' }} data-testid={`memory-${m.id}`}>
          <div className="disp text-[11px]" style={{ color: found(m.id) ? '#f6cf62' : '#4b4f78' }}>{found(m.id) ? m.title : '??? kenangan belum ditemukan'}</div>
          {found(m.id) && <p className="text-[15px] leading-snug">{m.text}</p>}
        </div>
      ))}
    </div>
  );

  const help = (
    <ul className="space-y-2 text-[16px] leading-snug">
      <li>Gerak: WASD atau tombol panah.</li>
      <li>Z / Spasi / Enter: bicara, nyalakan, atau masuk ke cahaya.</li>
      <li>Esc: jeda. Permainan juga berhenti saat jendela tidak aktif.</li>
      <li>Dinding biasa bisa kamu tembus sebagai arwah. Tanah bercahaya teal adalah tempat suci, dan itu tidak bisa ditembus.</li>
       <li>Tali perak menipis seiring waktu. Berdirilah dekat lampu kuning agar ia pulih. Garis garam bukan tempat beristirahat.</li>
      <li>Hantu hanya mengejar sampai kamu kehabisan tali. Tidak ada yang melompat ke arahmu.</li>
    </ul>
  );

  const settings = (
    <div className="space-y-4">
      <label className="block disp text-[11px]">Volume
        <input type="range" min={0} max={1} step={0.05} value={prefs.vol} onChange={(e) => setPref({ vol: Number(e.target.value) })} className="w-full accent-[#f6cf62]" data-testid="slider-volume" />
      </label>
      <button className="btn" onClick={() => setPref({ muted: !prefs.muted })} data-testid="button-mute">{prefs.muted ? 'Suara: mati' : 'Suara: hidup'}</button>
    </div>
  );

  const modal = (title: string, body: React.ReactNode, back?: () => void) => (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#070b18]/80 z-20">
      <div className="panel p-5 w-full max-w-lg max-h-full overflow-y-auto fade">
        <h2 className="disp text-[#f6cf62] mb-3 text-sm">{title}</h2>
        {body}
        {back && <button className="btn mt-4" onClick={back} data-testid="button-back">Kembali</button>}
      </div>
    </div>
  );

  const slotList = (onPick: (i: number) => void, cont: boolean) => (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => {
        const s = saves[i];
        return (
          <button key={i} className="btn w-full text-left" disabled={cont && !s} onClick={() => onPick(i)} data-testid={`slot-${i}`}
            style={!cont && slot === i ? { background: '#f6cf62', color: '#070b18' } : undefined}>
            Slot {i + 1}: {s ? `${s.name} / Bab ${s.chapter + 1} / tali ${Math.round(s.cord)}% / ${fmt(s.savedAt)}` : 'kosong'}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070b18] select-none">
      <div className="relative" style={{ width: VW * scale, height: VH * scale }}>
        <canvas ref={canvasRef} width={VW} height={VH} className="game" style={{ width: VW * scale, height: VH * scale }} data-testid="canvas-game" />

        {/* HUD */}
        {st && (status === 'playing' || status === 'dialogue') && area && (
          <div className="absolute inset-x-0 top-0 p-2 pointer-events-none flex justify-between items-start gap-2" style={{ fontSize: Math.max(11, scale * 4) }}>
            <div className="panel px-2 py-1 max-w-[62%]">
              <div className="disp text-[#f6cf62]" style={{ fontSize: '0.8em' }} data-testid="text-chapter">{CHAPTER_TITLES[st.chapter]} / {area.name}</div>
              <div className="leading-tight opacity-90" data-testid="text-objective">{OBJECTIVES[st.chapter]}</div>
              {st.notice && <div className="text-[#3fa7a0]" data-testid="text-notice">{st.notice}</div>}
            </div>
            <div className="panel px-2 py-1 w-[34%]">
              <div className="disp" style={{ fontSize: '0.7em' }}>Tali perak</div>
              <div className="h-2 bg-[#101a3c] border border-[#2b2250]">
                <div className="h-full" style={{ width: `${Math.max(0, Math.min(100, st.cord))}%`, background: st.cord < 30 ? '#c4566e' : '#f6cf62' }} data-testid="bar-cord" />
              </div>
              <div style={{ fontSize: '0.8em' }}>Kenangan {st.fragments.length}/{MEMORIES.length}</div>
            </div>
          </div>
        )}

        {/* Dialogue */}
        {st?.status === 'dialogue' && st.dialogue && (
          <div className="absolute inset-x-0 bottom-0 p-3 z-10">
            <div className="panel p-3 fade" style={{ fontSize: Math.max(13, scale * 5) }}>
              <div className="disp text-[#f6cf62]" style={{ fontSize: '0.7em' }} data-testid="text-dialogue-title">{st.dialogue.title}</div>
              <p className="leading-snug whitespace-pre-line" data-testid="text-dialogue">{st.dialogue.text}</p>
              <button className="btn mt-2" onClick={() => g?.closeDialogue()} data-testid="button-continue">Lanjut (Z)</button>
            </div>
          </div>
        )}

        {/* Touch controls */}
        {(status === 'playing') && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none md:hidden z-10">
            <div className="grid grid-cols-3 gap-1 pointer-events-auto">
              {[['', ''], ['arrowup', '^'], ['', ''], ['arrowleft', '<'], ['arrowdown', 'v'], ['arrowright', '>']].map(([k, l], i) => k ? (
                <button key={i} className="btn !p-3 opacity-70" onPointerDown={() => touch(k, true)} onPointerUp={() => touch(k, false)} onPointerLeave={() => touch(k, false)} data-testid={`touch-${k}`}>{l}</button>
              ) : <span key={i} />)}
            </div>
            <button className="btn pointer-events-auto self-end !p-4 opacity-70" onClick={() => g?.act()} data-testid="touch-act">Z</button>
          </div>
        )}
        {(status === 'playing') && (
           <button className="btn absolute bottom-2 right-2 z-10 hidden md:block" onClick={() => { keysRef.current.clear(); g?.setPaused(true); }} aria-label="Jeda permainan">Jeda (Esc)</button>
        )}

        {/* Main menu */}
        {status === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-20 bg-[#070b18]/55">
             <div className="w-full max-w-md max-h-full overflow-y-auto text-center fade">
              <div className="disp text-[10px] opacity-70 mb-1">Sebuah perjalanan arwah pulang</div>
              <h1 className="disp title text-4xl md:text-5xl mb-1" data-testid="text-title">TALI PERAK</h1>
              <p className="mb-5 text-[15px] opacity-80">Hujan belum berhenti di kota yang tidak ada di peta. Seutas tali perak masih mengikatmu ke rumah.</p>
              {view === 'main' && (
                <div className="flex flex-col gap-2 items-stretch">
                  <button className="btn" onClick={() => { refreshSaves(); setView('new'); }} data-testid="button-new">Mulai baru</button>
                  <button className="btn" onClick={() => { refreshSaves(); setView('continue'); }} disabled={!saves.some(Boolean)} data-testid="button-continue-menu">Lanjutkan</button>
                  <button className="btn" onClick={() => { refreshSaves(); setJournalSlot(-1); setPanel('journal'); }} data-testid="button-journal">Jurnal kenangan</button>
                  <button className="btn" onClick={() => setPanel('help')} data-testid="button-help">Cara bermain</button>
                  <button className="btn" onClick={() => setPanel('settings')} data-testid="button-settings">Pengaturan</button>
                </div>
              )}
              {view === 'new' && (
                <div className="panel p-4 text-left space-y-3">
                  <label className="disp text-[11px] block">Namamu
                    <input className="field mt-1" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} data-testid="input-name" />
                  </label>
                  {slotList((i) => { setSlot(i); setConfirmOver(false); }, false)}
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => (saves[slot] && !confirmOver ? setConfirmOver(true) : newGame())} data-testid="button-start">{confirmOver ? 'Ya, timpa dan berangkat' : 'Berangkat'}</button>
                    <button className="btn" onClick={() => setView('main')} data-testid="button-cancel">Batal</button>
                  </div>
                  {saves[slot] && <div className="text-[#c4566e] text-sm">Slot ini akan ditimpa.</div>}
                </div>
              )}
              {view === 'continue' && (
                <div className="panel p-4 text-left space-y-3">
                  {slotList(cont, true)}
                  <button className="btn" onClick={() => setView('main')} data-testid="button-cancel">Kembali</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pause */}
        {status === 'paused' && !panel && modal('Jeda', (
          <div className="flex flex-col gap-2">
            {saveFail && <div className="text-[#c4566e] text-sm">Gagal menyimpan. Penyimpanan peramban mungkin penuh atau dinonaktifkan.</div>}
            {st?.notice && <div className="text-[#c4566e] text-sm" data-testid="text-pause-notice">{st.notice}</div>}
            <button className="btn" onClick={resume} data-testid="button-resume">Lanjut</button>
            <button className="btn" onClick={() => { const ok = g?.save(); refreshSaves(); if (!ok) setSaveFail(true); else setSaveFail(false); }} data-testid="button-save">Simpan</button>
            <button className="btn" onClick={() => setPanel('journal')} data-testid="button-journal">Jurnal kenangan</button>
            <button className="btn" onClick={() => setPanel('help')} data-testid="button-help">Cara bermain</button>
            <button className="btn" onClick={() => setPanel('settings')} data-testid="button-settings">Pengaturan</button>
            <button className="btn" onClick={toMenu} data-testid="button-quit">Simpan dan keluar</button>
          </div>
        ))}


        {/* Lost */}
        {status === 'lost' && modal('Talimu terputus', (
          <div>
            <p className="mb-3 text-[16px]">Hujan menelan langkahmu. Rumah terasa semakin jauh, dan namamu hampir terlupa. Ini bukan akhir yang kamu cari, tapi ia tetap sebuah akhir: <b className="text-[#c4566e]">Terlupakan</b>.</p>
            <div className="flex gap-2">
              <button className="btn" disabled={!saves[(st?.slot ?? 1) - 1]} onClick={() => cont((st?.slot ?? 1) - 1)} data-testid="button-retry">Coba lagi dari simpanan</button>
              <button className="btn" onClick={() => window.location.reload()} data-testid="button-menu">Menu utama</button>
            </div>
          </div>
        ))}

        {/* Final choice */}
        {status === 'choice' && st && modal(STORY.choice.title, (
          <div>
            <p className="mb-2 text-[16px]">{STORY.choice.text}</p>
            <p className="mb-3 text-sm opacity-70" data-testid="text-memory-count">
              Ingatan terkumpul: {countMemories(st)}/{MEMORIES.length}. Pulang membutuhkan {HOME_MEMORY_REQUIREMENT}.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button className="btn" disabled={countMemories(st) < HOME_MEMORY_REQUIREMENT} onClick={() => g?.chooseEnding('home')} data-testid="button-ending-home">Pulang ke tubuhku</button>
              <button className="btn" onClick={() => g?.chooseEnding('letgo')} data-testid="button-ending-letgo">Melepas dan berpamitan</button>
              <button className="btn" onClick={() => g?.cancelChoice()} data-testid="button-choice-cancel">Belum, tunggu dulu</button>
            </div>
          </div>
        ))}

        {/* Ending */}
        {status === 'complete' && st && modal(STORY.endings[st.ending ?? 'letgo'].title, (
          <div>
            <p className="mb-2 text-[16px]" data-testid="text-ending">{STORY.endings[st.ending ?? 'letgo'].text}</p>
            <p className="mb-3 text-sm opacity-70">Terima kasih sudah berjalan sampai sini, {st.name}. Ingatan terkumpul: {countMemories(st)}/{MEMORIES.length}. Waktu: {Math.round(st.elapsed)} detik.</p>
            <div className="flex gap-2">
              <button className="btn" onClick={() => setPanel('journal')} data-testid="button-journal">Jurnal</button>
              <button className="btn" onClick={() => window.location.reload()} data-testid="button-menu">Menu utama</button>
            </div>
          </div>
        ))}

        {/* Panels sit above the ending and choice screens */}
        {panel === 'journal' && modal('Jurnal kenangan', journal, () => setPanel(null))}
        {panel === 'help' && modal('Cara bermain', help, () => setPanel(null))}
        {panel === 'settings' && modal('Pengaturan', settings, () => setPanel(null))}
      </div>
    </div>
  );
}

export default App;
