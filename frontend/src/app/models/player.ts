
export interface Player {
  id: string;
  name: string;
  sex: 'M' | 'F';
  isAdmin: boolean;
  isReady: boolean;
  isPlaying: boolean;
}
