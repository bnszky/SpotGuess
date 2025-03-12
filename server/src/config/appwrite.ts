import { Client, Account, Avatars, Databases, Users } from 'node-appwrite';
import { AppwriteConfig } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Appwrite configuration
export const appwriteConfig: AppwriteConfig = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '',
  databaseId: process.env.APPWRITE_DATABASE_ID || '',
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID || '',
  playlistCollectionId: process.env.APPWRITE_PLAYLIST_COLLECTION_ID || '',
  songsCollectionId: process.env.APPWRITE_SONGS_COLLECTION_ID || '',
  gamesCollectionId: process.env.APPWRITE_GAMES_COLLECTION_ID || '',
  apiKey: process.env.APPWRITE_API_KEY || ''
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.apiKey);

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const users = new Users(client);
export default client;
