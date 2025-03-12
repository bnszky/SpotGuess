export interface AppwriteConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  userCollectionId: string;
  playlistCollectionId: string;
  songsCollectionId: string;
  apiKey: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserSignInRequest {
  email: string;
  password: string;
}

export interface UserSignOutRequest {
  sessionId: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  preview: string;
  playlists?: string[];
}

export interface Game {
    id: string;
    playlists: string;
    player: string;
    correct_answers: number;
    questions_number: number;
    finished_date: Date;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  fans: number;
  duration: number;
  songs?: Song[];
  users?: string[];
  added_date?: string;
}
