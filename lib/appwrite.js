import { 
    APPWRITE_PLATFORM,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID,
    APPWRITE_PLAYLIST_COLLECTION_ID,
    APPWRITE_SONGS_COLLECTION_ID,
    APPWRITE_GAMES_COLLECTION_ID,
    APPWRITE_API_KEY,
    IP_ADDRESS,
    PORT
} from '@env';

export const appwriteConfig = {
    platform: APPWRITE_PLATFORM,
    endpoint: APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: APPWRITE_PROJECT_ID || '',
    databaseId: APPWRITE_DATABASE_ID || '',
    userCollectionId: APPWRITE_USER_COLLECTION_ID || '',
    playlistCollectionId: APPWRITE_PLAYLIST_COLLECTION_ID || '',
    songsCollectionId: APPWRITE_SONGS_COLLECTION_ID || '',
    gamesCollectionId: APPWRITE_GAMES_COLLECTION_ID || '',
    apiKey: APPWRITE_API_KEY || ''
};


export const API_BASE_URL = __DEV__ 
    ? `http://${IP_ADDRESS}:${PORT}`  // IP address
    : "https://your-production-api.com"; // For production

import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

const client = new Client()
client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

const account = new Account(client)
const avatars = new Avatars(client)
const databases = new Databases(client)
const storage = new Storage(client)

export const signUp = async (email, password, name) => {
    try{
        const newAccount =  await account.create(ID.unique(), email, password, name);

        if(!newAccount) {
            throw new Error('Failed to create account');
        }

        const avatarUrl = await avatars.getInitials(newAccount.name);

        await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, ID.unique(), {
            name: newAccount.name,
            email: newAccount.email,
            avatar: avatarUrl,
            accountId: newAccount.$id
        });

        return await signIn(email, password);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export async function getAccount() {
    try {
        const currentAccount = await account.get();
  
        return currentAccount;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export async function getCurrentUser() {
    try {
      const currentAccount = await getAccount();
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
  
      if (!currentUser) throw Error;
  
      return currentUser.documents[0];
    } catch (error) {
      console.log(error);
      return null;
    }
}

export async function signOut() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
}

export async function verifyPlaylistLink(playlistLink){
    if (!playlistLink) {
        throw new Error('Playlist link is required');
    }

    try {
        // Define server URL using the base URL
        const serverUrl = `${API_BASE_URL}/playlists/verify`;
        
        // Make request to server endpoint
        const response = await fetch(`${serverUrl}?url=${encodeURIComponent(playlistLink)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to verify playlist link');
        }
        
        const data = await response.json();
        return data.playlistId;
    } catch (error) {
        console.log('Error verifying playlist link:', error);
        throw error;
    }
}

export async function getPlaylist(playlistId) {

    const user = await getCurrentUser();
    const userId = user.$id;

    if (!playlistId || !userId) {
        throw new Error('Playlist ID and User ID are required');
    }

  try {
    const postResponse = await fetch(`${API_BASE_URL}/playlists/${playlistId}?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      throw new Error(errorData.error || 'Failed to register playlist access');
    }

    const getResponse = await fetch(`${API_BASE_URL}/playlists/${playlistId}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      const errorData = await getResponse.json();
      throw new Error(errorData.error || 'Failed to fetch playlist data');
    }

    // Return the JSON response
    return await getResponse.json();
  } catch (error) {
    console.log('Error fetching playlist:', error);
    throw error;
  }
}

export async function sendResult(playlistId, questionNumber, correctAnswers){
    if (!playlistId || !questionNumber || !correctAnswers) {
        throw new Error('Playlist ID, question number, and correct answers are required');
    }

    try {
        const currentUser = await getCurrentUser();
        const userId = currentUser.$id;

        const response = await fetch(`${API_BASE_URL}/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playlistId,
                userId,
                "questions_number": questionNumber,
                "correct_answers": correctAnswers
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send result');
        }

        return await response.json();
    } catch (error) {
        console.log('Error sending result:', error);
        throw error;
    }
}

export async function getPlaylists(){
    try {
        const currentUser = await getCurrentUser();
        const userId = currentUser.$id;

        const response = await fetch(`${API_BASE_URL}/playlists/all?userId=${userId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch playlists');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching playlists:', error);
        throw error;
    }
}

export async function getHistory(){
    try {
        const currentUser = await getCurrentUser();
        const userId = currentUser.$id;

        const response = await fetch(`${API_BASE_URL}/games/user/${userId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching history:', error);
        throw error;
    }
}

export async function getQuestions(playlistId, numberOfQuestions){
    if (!playlistId || !numberOfQuestions) {
        throw new Error('Playlist ID and number of questions are required');
    }

    try {
        const userId = (await getCurrentUser()).$id;

        const response = await fetch(`${API_BASE_URL}/games/quiz/${playlistId}?userId=${userId}&number=${numberOfQuestions}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch questions');
        }
        return await response.json();
    } catch (error) {
        console.log('Error fetching questions:', error);
        throw error;
    }
}