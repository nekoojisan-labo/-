import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cat, Rat, Footprints, AlertCircle, Wind, RotateCcw, Paintbrush } from 'lucide-react';
import { GameState, CatState, CatReaction, GameAssets } from '../types';
import { GAME_CONSTANTS } from '../constants';
import { getCatReaction, generateGameAssets } from '../services/geminiService';

export const GameCanvas: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [catState, setCatState] = useState<CatState>(CatState.SLEEPING);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isMoving, setIsMoving] = useState(false);
  const [catReaction, setCatReaction] = useState<CatReaction | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [assets, setAssets] = useState<GameAssets | null>(null);
  const [assetError, setAssetError] = useState(false);

  // --- Refs for Game Loop ---
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const stateTimerRef = useRef<number>(0);
  const graceTimerRef = useRef<number>(0);
  
  // Need refs for values accessed inside loop to avoid closure staleness
  const gameStateRef = useRef(GameState.IDLE);
  const catStateRef = useRef(CatState.SLEEPING);
  const isMovingRef = useRef(false);
  const progressRef = useRef(0);

  // Sync refs with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { catStateRef.current = catState; }, [catState]);
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // --- Initial Asset Generation ---
  useEffect(() => {
    const loadAssets = async () => {
      setGameState(GameState.LOADING_ASSETS);
      try {
        const generatedAssets = await generateGameAssets();
        setAssets(generatedAssets);
        setGameState(GameState.IDLE);
      } catch (e) {
        console.error(e);
        setAssetError(true);
        // Fallback to IDLE so they can play without images if really needed (layout handles null assets)
        setGameState(GameState.IDLE); 
      }
    };
    
    // Auto-load assets on mount
    loadAssets();
  }, []);

  // --- Game Loop Logic ---
  
  // Helper to linearly interpolate values based on current progress
  // progress 0 -> return start, progress 100 -> return end
  const getDifficultyScaledValue = useCallback((start: number, end: number) => {
    const t = Math.min(1, Math.max(0, progressRef.current / 100));
    return start + (end - start) * t;
  }, []);

  const scheduleNextCatState = useCallback(() => {
    const now = Date.now();
    
    if (catStateRef.current === CatState.SLEEPING) {
      // 1. Calculate Dynamic Sleep Time
      // As you get closer, cat sleeps less.
      const minSleep = getDifficultyScaledValue(GAME_CONSTANTS.SLEEP_MIN_START, GAME_CONSTANTS.SLEEP_MIN_END);
      const maxSleep = getDifficultyScaledValue(GAME_CONSTANTS.SLEEP_MAX_START, GAME_CONSTANTS.SLEEP_MAX_END);
      
      const sleepDuration = Math.random() * (maxSleep - minSleep) + minSleep;
      stateTimerRef.current = now + sleepDuration;
    
    } else if (catStateRef.current === CatState.STIRRING) {
      // 2. Calculate Dynamic Warning Time
      // As you get closer, reaction window shrinks.
      // Also add randomness so you can't memorize the rhythm.
      const baseWarnTime = getDifficultyScaledValue(GAME_CONSTANTS.WARN_TIME_START, GAME_CONSTANTS.WARN_TIME_END);
      const variance = (Math.random() * 2 - 1) * GAME_CONSTANTS.WARN_VARIANCE; // +/- variance
      
      // Ensure it doesn't get impossibly fast (floor at 400ms)
      const warnDuration = Math.max(400, baseWarnTime + variance);
      stateTimerRef.current = now + warnDuration;
    
    } else if (catStateRef.current === CatState.AWAKE) {
      // 3. Randomized Awake Time
      // Cat stares for a random amount of time
      const awakeDuration = Math.random() * (GAME_CONSTANTS.AWAKE_MAX - GAME_CONSTANTS.AWAKE_MIN) + GAME_CONSTANTS.AWAKE_MIN;
      stateTimerRef.current = now + awakeDuration;
    }
  }, [getDifficultyScaledValue]);

  const updateGame = (time: number) => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    const now = Date.now();

    // 1. Handle Cat State Transitions
    if (now >= stateTimerRef.current) {
      if (catStateRef.current === CatState.SLEEPING) {
        setCatState(CatState.STIRRING);
        scheduleNextCatState();
      } else if (catStateRef.current === CatState.STIRRING) {
        setCatState(CatState.AWAKE);
        scheduleNextCatState();
        graceTimerRef.current = now + GAME_CONSTANTS.GRACE_PERIOD; // Start grace period
      } else if (catStateRef.current === CatState.AWAKE) {
        setCatState(CatState.SLEEPING);
        scheduleNextCatState();
      }
    }

    // 2. Handle Movement
    if (isMovingRef.current) {
      // WIN CONDITION CHECK
      if (progressRef.current >= 100) {
        handleWin();
        return; // Stop loop
      }

      // LOSE CONDITION CHECK
      if (catStateRef.current === CatState.AWAKE && now > graceTimerRef.current) {
        handleGameOver();
        return; // Stop loop
      }

      // Update Progress
      if (gameStateRef.current === GameState.PLAYING) {
        const newProgress = Math.min(100, progressRef.current + GAME_CONSTANTS.MOVEMENT_SPEED);
        setProgress(newProgress);
      }
    }

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setProgress(0);
    setCatState(CatState.SLEEPING);
    setCatReaction(null);
    
    // Must reset refs manually for the loop
    progressRef.current = 0;
    catStateRef.current = CatState.SLEEPING;
    
    scheduleNextCatState();
    
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleGameOver = async () => {
    cancelAnimationFrame(requestRef.current!);
    setGameState(GameState.GAME_OVER);
    setLoadingAI(true);
    const reaction = await getCatReaction('LOSS', progressRef.current);
    setCatReaction(reaction);
    setLoadingAI(false);
  };

  const handleWin = async () => {
    cancelAnimationFrame(requestRef.current!);
    setGameState(GameState.VICTORY);
    setLoadingAI(true);
    const reaction = await getCatReaction('WIN', 100);
    setCatReaction(reaction);
    setLoadingAI(false);
  };

  // --- Input Handlers ---
  const startMoving = () => setIsMoving(true);
  const stopMoving = () => setIsMoving(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStateRef.current === GameState.PLAYING) startMoving();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') stopMoving();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current!);
    };
  }, []);

  // --- Render Helpers ---
  const getCatStatusColor = () => {
    switch (catState) {
      case CatState.SLEEPING: return 'text-blue-200';
      case CatState.STIRRING: return 'text-yellow-400';
      case CatState.AWAKE: return 'text-red-500';
    }
  };

  const getOverlayGradient = () => {
    switch (catState) {
      case CatState.SLEEPING: return 'bg-blue-900/20';
      case CatState.STIRRING: return 'bg-yellow-500/20';
      case CatState.AWAKE: return 'bg-red-900/40';
      default: return 'bg-black/40';
    }
  };

  // Determine which background image to show
  const getCurrentBg = () => {
    if (!assets) return ''; // Should fall back to dark background
    if (catState === CatState.AWAKE) return assets.awakeBg;
    // Use sleeping BG for both sleeping and stirring (maybe apply effect for stirring)
    return assets.sleepingBg;
  };

  // --- Main Render ---

  if (gameState === GameState.LOADING_ASSETS) {
    return (
      <div className="relative w-full h-full bg-stone-900 flex flex-col items-center justify-center text-stone-200 p-8 text-center">
        <Paintbrush className="w-12 h-12 text-amber-400 animate-bounce mb-6" />
        <h2 className="font-serif text-2xl mb-2">Painting the Cat...</h2>
        <p className="text-stone-500 max-w-md animate-pulse">
          Generating custom game assets using AI. This may take a few moments.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none bg-stone-900"
      onMouseDown={startMoving}
      onMouseUp={stopMoving}
      onTouchStart={startMoving}
      onTouchEnd={stopMoving}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* --- Background Layer --- */}
      {assets && (
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out`}
          style={{ 
            backgroundImage: `url(${getCurrentBg()})`,
            transform: (catState === CatState.STIRRING ? 'scale(1.02) ' : 'scale(1.0) ') + (isMoving ? 'translateY(2px)' : ''),
            filter: catState === CatState.STIRRING ? 'blur(2px)' : 'none'
          }}
        />
      )}

      {/* If assets failed to load, show a placeholder pattern */}
      {!assets && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-700 via-stone-900 to-black" />
      )}
      
      {/* --- Mood Overlay --- */}
      <div className={`absolute inset-0 transition-colors duration-200 pointer-events-none ${getOverlayGradient()}`} />
      
      {/* --- Scanline/Retro Effect --- */}
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />

      {/* --- Game UI Layout --- */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        
        {/* Top Bar: Status */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className={`backdrop-blur-md p-4 rounded-2xl border shadow-lg transition-all duration-300 ${
            catState === CatState.AWAKE 
              ? 'bg-red-950/80 border-red-500/50 scale-110 origin-top-left' 
              : 'bg-black/40 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              {catState === CatState.SLEEPING && <span className="animate-float text-2xl">💤</span>}
              {catState === CatState.STIRRING && <AlertCircle className="w-8 h-8 text-yellow-400 animate-shake" />}
              {catState === CatState.AWAKE && <Cat className="w-8 h-8 text-red-500" />}
              
              <div className="flex flex-col text-white">
                <span className="text-xs uppercase tracking-widest opacity-70">Cat Status</span>
                <span className={`font-serif text-xl font-bold ${getCatStatusColor()}`}>
                  {catState === CatState.SLEEPING && "Deep Sleep"}
                  {catState === CatState.STIRRING && "Stirring..."}
                  {catState === CatState.AWAKE && "WATCHING!"}
                </span>
              </div>
            </div>
          </div>

           {/* Asset Error Warning */}
           {assetError && (
             <div className="text-xs text-red-400 bg-black/50 px-2 py-1 rounded">
               Failed to load images. Playing in low-fi mode.
             </div>
           )}
        </div>

        {/* Middle: Start/End Screens */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto z-10">
          {gameState === GameState.IDLE && (
            <div className="bg-stone-900/90 backdrop-blur-lg p-8 rounded-3xl border border-amber-500/30 text-center max-w-md shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Cat className="w-16 h-16 mx-auto text-amber-200 mb-4" />
              <h1 className="font-serif text-4xl text-amber-100 mb-2">Neko Stealth</h1>
              <p className="text-stone-400 mb-8 leading-relaxed">
                The guardian is asleep. Sneak past without waking it up.
                <br/>It gets harder as you get closer...
              </p>
              <button 
                onClick={startGame}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full shadow-lg shadow-amber-900/50 transition-all"
              >
                Start Sneaking
              </button>
            </div>
          )}

          {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
            <div className="bg-stone-900/95 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl animate-float">
              <div className="mb-6">
                 {gameState === GameState.VICTORY ? (
                   <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                     <Wind className="w-10 h-10 text-green-400" />
                   </div>
                 ) : (
                   <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                     <AlertCircle className="w-10 h-10 text-red-400" />
                   </div>
                 )}
              </div>
              
              <h2 className="font-serif text-3xl text-white mb-2">
                {gameState === GameState.VICTORY ? "Escaped!" : "Caught!"}
              </h2>

              {loadingAI ? (
                <div className="py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-xs text-stone-500">Listening to cat's thoughts...</p>
                </div>
              ) : (
                catReaction && (
                  <div className="bg-white/5 rounded-xl p-4 my-6 border border-white/5">
                    <div className="text-xs uppercase tracking-widest text-stone-500 mb-1">Cat's Mood: {catReaction.mood}</div>
                    <p className="font-serif text-lg italic text-stone-300">"{catReaction.message}"</p>
                  </div>
                )
              )}

              <button 
                onClick={startGame}
                className="group flex items-center justify-center gap-2 w-full py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Bottom: Progress Bar & Player */}
        <div className="relative w-full h-24 flex items-end">
          {/* Track */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-amber-200 to-amber-500 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Player Avatar (Mouse) */}
          <div 
            className="absolute bottom-4 transition-all duration-75 ease-linear transform -translate-x-1/2"
            style={{ left: `${progress}%` }}
          >
            <div className={`relative ${isMoving ? 'animate-bounce' : ''}`}>
               <div className="bg-stone-800 p-2 rounded-full border-2 border-amber-200 shadow-lg shadow-black/50">
                 <Rat className="w-6 h-6 text-stone-200" />
               </div>
               {/* "Sneaking" particles */}
               {isMoving && (
                 <Footprints className="absolute -bottom-2 -left-4 w-4 h-4 text-white/50 animate-ping" />
               )}
            </div>
          </div>
          
          {/* Finish Line */}
          <div className="absolute right-0 bottom-4 flex flex-col items-center">
             <div className="h-8 w-0.5 bg-white/50 mb-1"></div>
             <span className="text-xs text-white/70 font-bold uppercase">Goal</span>
          </div>
        </div>
        
        {/* Mobile Touch Area hint (bottom overlay) */}
        {gameState === GameState.PLAYING && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none md:hidden flex items-end justify-center pb-8">
            <span className="text-white/50 text-sm animate-pulse">Hold screen to move</span>
          </div>
        )}

      </div>
    </div>
  );
};