
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PALETTES, DEFAULT_SETTINGS } from './constants';
import { PixelSettings, Palette, DitherMethod } from './types';
import { ControlSlider } from './components/ControlSlider';
import { hexToRgb, applyDithering } from './utils/imageProcessing';

// Icons
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const MovieIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const DITHER_METHODS: { id: DitherMethod, name: string }[] = [
  { id: 'NONE', name: 'No Dither' },
  { id: 'FLOYD_STEINBERG', name: 'Floyd-Steinberg' },
  { id: 'ATKINSON', name: 'Atkinson' },
  { id: 'JARVIS_JUDICE_NINKE', name: 'Jarvis-Judice-Ninke' },
  { id: 'STUCKI', name: 'Stucki' },
  { id: 'BAYER_2X2', name: 'Bayer 2x2' },
  { id: 'BAYER_4X4', name: 'Bayer 4x4' },
  { id: 'BAYER_8X8', name: 'Bayer 8x8' },
  { id: 'CLUSTERED_4X4', name: 'Clustered 4x4' }
];

const App: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<PixelSettings>(DEFAULT_SETTINGS);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [customPalettes, setCustomPalettes] = useState<Palette[]>([]);
  const [isCreatingPalette, setIsCreatingPalette] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [newPaletteColors, setNewPaletteColors] = useState<string[]>(['#ffffff']);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const requestRef = useRef<number>();

  // Load custom palettes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pixelart_custom_palettes');
    if (saved) {
      try {
        setCustomPalettes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load custom palettes", e);
      }
    }
  }, []);

  // Save custom palettes to localStorage
  useEffect(() => {
    localStorage.setItem('pixelart_custom_palettes', JSON.stringify(customPalettes));
  }, [customPalettes]);

  const allPalettes = useMemo(() => [...PALETTES, ...customPalettes], [customPalettes]);

  const processFrame = useCallback((source: HTMLImageElement | HTMLVideoElement) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height;

    if (canvas.width !== sourceWidth || canvas.height !== sourceHeight) {
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
    }

    const scale = 1 / settings.pixelSize;
    const sw = Math.max(1, Math.floor(sourceWidth * scale));
    const sh = Math.max(1, Math.floor(sourceHeight * scale));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sw;
    tempCanvas.height = sh;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    tempCtx.imageSmoothingEnabled = false;
    tempCtx.filter = `blur(${settings.blur}px) contrast(${settings.contrast}) brightness(${settings.brightness}) saturate(${settings.saturation})`;
    tempCtx.drawImage(source, 0, 0, sw, sh);

    const imageData = tempCtx.getImageData(0, 0, sw, sh);
    const palette = allPalettes.find(p => p.id === settings.paletteId) || allPalettes[0];
    const paletteRgb = palette.colors.map(hexToRgb);

    applyDithering(imageData.data, sw, sh, paletteRgb, settings.dithering, settings.ditherMethod);
    tempCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height);
  }, [settings, allPalettes]);

  const animate = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
      processFrame(videoRef.current);
      if (isRecording) {
        setRecordProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [processFrame, isRecording]);

  useEffect(() => {
    if (videoUrl) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (image) {
      processFrame(image);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [videoUrl, image, animate, processFrame]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setImage(null);
      setVideoUrl(url);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setVideoUrl(null);
          setImage(img);
          const initialPixelSize = Math.max(2, Math.floor(img.width / 200));
          setSettings(s => ({ ...s, pixelSize: initialPixelSize }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const startVideoRecording = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    setIsRecording(true);
    setRecordProgress(0);
    chunksRef.current = [];

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    video.currentTime = 0;
    await video.play();

    const stream = canvas.captureStream(30); 
    
    if ((video as any).captureStream) {
      const videoStream = (video as any).captureStream();
      videoStream.getAudioTracks().forEach((track: MediaStreamTrack) => stream.addTrack(track));
    } else if ((video as any).mozCaptureStream) {
       const videoStream = (video as any).mozCaptureStream();
       videoStream.getAudioTracks().forEach((track: MediaStreamTrack) => stream.addTrack(track));
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pixel-video-${Date.now()}.webm`;
      link.click();
      setIsRecording(false);
      setRecordProgress(0);
    };

    recorder.start();
    video.onended = () => recorder.stop();
  };

  const handleAddCustomPalette = () => {
    if (!newPaletteName.trim() || newPaletteColors.length === 0) return;
    const newPalette: Palette = {
      id: `custom-${Date.now()}`,
      name: newPaletteName,
      colors: [...newPaletteColors]
    };
    setCustomPalettes([...customPalettes, newPalette]);
    setSettings(s => ({ ...s, paletteId: newPalette.id }));
    setIsCreatingPalette(false);
    setNewPaletteName('');
    setNewPaletteColors(['#ffffff']);
  };

  const deleteCustomPalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPalettes(customPalettes.filter(p => p.id !== id));
    if (settings.paletteId === id) {
      setSettings(s => ({ ...s, paletteId: PALETTES[0].id }));
    }
  };

  const addColorToNewPalette = (color: string) => {
    setNewPaletteColors([...newPaletteColors, color]);
  };

  const removeColorFromNewPalette = (idx: number) => {
    setNewPaletteColors(newPaletteColors.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617]">
      <aside className="w-full lg:w-96 bg-[#0f172a] border-r border-slate-800 p-6 overflow-y-auto max-h-screen flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="pixel-font text-white text-lg">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">PixelArt Studio</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Pro Designer</p>
          </div>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 group"
        >
          <UploadIcon />
          <span className="font-semibold">Upload Photo / MP4</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,video/mp4"
          />
        </button>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <SettingsIcon /> Resolution & Texture
            </h2>
            <ControlSlider 
              label="Pixel Scale" 
              value={settings.pixelSize} 
              min={1} max={64} step={1} 
              onChange={(v) => setSettings(s => ({ ...s, pixelSize: v }))} 
            />
            
            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Dither Algorithm
              </label>
              <select 
                value={settings.ditherMethod}
                onChange={(e) => setSettings(s => ({ ...s, ditherMethod: e.target.value as DitherMethod }))}
                className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                {DITHER_METHODS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <ControlSlider 
              label="Dither Amount" 
              value={settings.dithering} 
              min={0} max={1} step={0.01} 
              onChange={(v) => setSettings(s => ({ ...s, dithering: v }))} 
            />
            <ControlSlider 
              label="Blur" 
              value={settings.blur} 
              min={0} max={5} step={0.1} 
              onChange={(v) => setSettings(s => ({ ...s, blur: v }))} 
            />
          </section>

          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Color Grading</h2>
            <ControlSlider label="Contrast" value={settings.contrast} min={0.5} max={2} step={0.1} onChange={(v) => setSettings(s => ({ ...s, contrast: v }))} />
            <ControlSlider label="Brightness" value={settings.brightness} min={0.5} max={1.5} step={0.05} onChange={(v) => setSettings(s => ({ ...s, brightness: v }))} />
            <ControlSlider label="Saturation" value={settings.saturation} min={0} max={2} step={0.1} onChange={(v) => setSettings(s => ({ ...s, saturation: v }))} />
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Palettes</h2>
              <button 
                onClick={() => setIsCreatingPalette(!isCreatingPalette)}
                className="text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase flex items-center gap-1"
              >
                <PlusIcon /> {isCreatingPalette ? 'Cancel' : 'New Palette'}
              </button>
            </div>

            {isCreatingPalette && (
              <div className="mb-4 p-4 bg-slate-900 border border-blue-500/30 rounded-xl space-y-3">
                <input 
                  type="text" 
                  placeholder="Palette Name"
                  className="w-full bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-lg text-white outline-none focus:border-blue-500"
                  value={newPaletteName}
                  onChange={e => setNewPaletteName(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {newPaletteColors.map((c, idx) => (
                    <div key={idx} className="relative group/color">
                      <div className="w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: c }} />
                      <button 
                        onClick={() => removeColorFromNewPalette(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/color:opacity-100 transition-opacity"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => colorInputRef.current?.click()}
                    className="w-6 h-6 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white"
                  >
                    <PlusIcon />
                  </button>
                  <input 
                    type="color" 
                    ref={colorInputRef} 
                    className="hidden" 
                    onChange={e => addColorToNewPalette(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleAddCustomPalette}
                  disabled={!newPaletteName || newPaletteColors.length === 0}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase rounded-lg"
                >
                  Save Palette
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {allPalettes.map(palette => (
                <button
                  key={palette.id}
                  onClick={() => setSettings(s => ({ ...s, paletteId: palette.id }))}
                  className={`w-full p-3 rounded-lg border flex items-center justify-between group/p transition-all ${
                    settings.paletteId === palette.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[11px] ${settings.paletteId === palette.id ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                      {palette.name}
                    </span>
                    <div className="flex gap-1">
                      {palette.colors.slice(0, 8).map((color, idx) => (
                        <div key={idx} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                      {palette.colors.length > 8 && <span className="text-[8px] text-slate-600">+{palette.colors.length - 8}</span>}
                    </div>
                  </div>
                  {palette.id.startsWith('custom-') && (
                    <button 
                      onClick={(e) => deleteCustomPalette(palette.id, e)}
                      className="opacity-0 group-hover/p:opacity-100 p-1 hover:text-red-400 text-slate-600 transition-opacity"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
           {videoUrl ? (
             <button 
              disabled={isRecording}
              onClick={startVideoRecording}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
                isRecording 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
              }`}
            >
              <MovieIcon />
              {isRecording ? `Recording ${Math.floor(recordProgress)}%` : 'Export Pixel Video'}
            </button>
           ) : (
             <button 
              disabled={!image}
              onClick={downloadImage}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
                image 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <DownloadIcon />
              Export Image
            </button>
           )}
          <p className="text-[10px] text-center text-slate-600 mt-4 uppercase tracking-widest font-mono">
            PixelArt Studio v3.0
          </p>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {!image && !videoUrl ? (
            <div className="text-center p-12 border-4 border-dashed border-slate-800 rounded-3xl max-w-md bg-slate-900/20 backdrop-blur-sm">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400">
                <MovieIcon />
              </div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2">Retro Media Studio</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Transform any photo or MP4 into pixel art. Define your own palettes and export in high quality.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
              >
                Upload Media
              </button>
            </div>
          ) : (
            <div className={`group relative max-w-full max-h-full rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 transition-colors duration-500 ${isRecording ? 'border-red-600' : 'border-slate-800'}`}>
              {isRecording && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" /> REC
                </div>
              )}
              
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[75vh] block object-contain"
              />
              
              {videoUrl && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                   <video 
                    ref={videoRef}
                    src={videoUrl}
                    className="hidden"
                    loop={!isRecording}
                    muted
                    playsInline
                    onLoadedMetadata={() => videoRef.current?.play()}
                  />
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()}
                      className="text-white hover:text-blue-400"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-100" 
                        style={{ width: `${recordProgress || (videoRef.current ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
