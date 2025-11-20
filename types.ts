export enum GameState {
  IDLE = 'IDLE',
  LOADING_ASSETS = 'LOADING_ASSETS',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export enum CatState {
  SLEEPING = 'SLEEPING',
  STIRRING = 'STIRRING', // Warning phase
  AWAKE = 'AWAKE',
}

export interface GameConfig {
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
}

export interface CatReaction {
  mood: string;
  message: string;
}

export interface GameAssets {
  sleepingBg: string;
  awakeBg: string;
}