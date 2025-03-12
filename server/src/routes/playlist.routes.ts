import { Request, Response, Router } from 'express';
import { Query } from 'node-appwrite';

import client, { databases, appwriteConfig, users } from '../config/appwrite';
import { Playlist, Song, Game } from '../types';

const router = Router();

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get user playlists
 *     tags: [Playlists]
 *     security:
 *       - JWT: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Authentication required
 */
router.get('/', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    
    const playlists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.playlistCollectionId,
      [Query.search("users", userId)]
    );
    
    return res.status(200).json(playlists.documents);
  } catch (error: any) {
    console.error('Error getting playlists:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /playlists/verify:
 *   get:
 *     summary: Verify and extract ID from a playlist link
 *     tags: [Playlists]
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist URL to verify
 *     responses:
 *       200:
 *         description: Playlist ID extracted successfully
 *       400:
 *         description: Playlist link is required
 *       404:
 *         description: Invalid playlist link
 */
router.get('/verify', async (req: Request, res: Response) => {
  const playlistLink = req.query.url as string;

  if (!playlistLink) {
    return res.status(400).json({ error: 'Playlist link is required' });
  }

  try {
    const response = await fetch(playlistLink, { redirect: 'manual' });

    if (response.status === 301 || response.status === 302) {
      const finalUrl = response.headers.get('location');

      if (!finalUrl) {
        return res.status(404).json({ error: 'Failed to resolve the shortened URL' });
      }

      const urlParams = new URL(finalUrl).pathname.split('/');
      const playlistId = urlParams[urlParams.length - 1];

      if (!playlistId) {
        return res.status(404).json({ error: 'Failed to extract playlist ID from the final URL' });
      }

      return res.status(200).json({ playlistId });
    } else if (response.status === 404) {
      return res.status(404).json({ error: 'The playlist link is invalid or expired (404 Not Found)' });
    } else {
      return res.status(500).json({ error: `Failed to resolve the shortened URL: HTTP status ${response.status}` });
    }
  } catch (error: any) {
    console.error('Error verifying playlist link:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /playlists/{id}:
 *   post:
 *     summary: Get playlist details and songs
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Playlist retrieved successfully
 *       400:
 *         description: Required parameters missing
 */
router.post('/:id', async (req: Request, res: Response) => {
  const playlistId = req.params.id;
  const userId = req.query.userId as string;

  if (!playlistId) {
    return res.status(400).json({ error: 'Playlist ID is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const response = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
    
    if (response.status !== 200) {
      return res.status(response.status).json({ 
        error: `Failed to fetch the playlist: HTTP status ${response.status}` 
      });
    }
    
    const data = await response.json();

    const songs: Song[] = data.tracks.data.map((song: any) => ({
      id: song.id.toString(),
      title: song.title,
      artist: song.artist.name,
      cover: song.album.cover_medium,
      preview: song.preview,
    }));

    const playlistData: Playlist = {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      cover: data.picture_medium,
      fans: data.fans,
      duration: data.duration,
      songs
    };

    try {
      const existingPlaylist = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.playlistCollectionId,
        playlistId.toString()
      );
      
      const users = existingPlaylist.users || [];
      if (!users.includes(userId)) {
        users.push(userId);
        
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.playlistCollectionId,
          playlistId.toString(),
          { users }
        );
      }
      
      console.log("Using existing playlist");
    } catch (err) {
      console.log("Creating new playlist");
      let songIds: string[] = [];

      if (playlistData.songs) {
        const songPromises = playlistData.songs.map(async (song) => {
          try {
            await databases.getDocument(
              appwriteConfig.databaseId,
              appwriteConfig.songsCollectionId,
              song.id.toString()
            );
            songIds.push(song.id.toString());
          } catch (songErr) {
            try{
                await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.songsCollectionId,
                song.id.toString(),
                {
                    title: song.title,
                    artist: song.artist,
                    id: song.id.toString(),
                    preview: song.preview,
                    cover: song.cover,
                    playlists: [playlistData.id],
                }
                );
                songIds.push(song.id.toString());
            } catch (error) {
                console.error('Error creating song:', error);
            }
          }
        });

        await Promise.all(songPromises);

        const newPlaylist = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.playlistCollectionId,
            playlistId.toString(),
            {
              title: playlistData.title,
              description: playlistData.description,
              cover: playlistData.cover,
              id: playlistId.toString(),
              users: [userId],
              fans: playlistData.fans,
              duration: playlistData.duration,
              added_date: new Date().toISOString(),
              songs: songIds,
            }
          );
      }
    }

    return res.status(200).json({ message: "Playlist created successfully" });
  } catch (error: any) {
    console.error('Error getting playlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function removeSystemAttributes(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeSystemAttributes(item));
  }
  
  const cleanedObj: Record<string, any> = {};
  for (const key in obj) {
    if (!key.startsWith('$')) {
      cleanedObj[key] = removeSystemAttributes(obj[key]);
    }
  }
  
  return cleanedObj;
}

/**
 * @swagger
 * /playlists/all:
 *   get:
 *     summary: Get all playlists for a user without songs and user details
 *     tags: [Playlists]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Playlists retrieved successfully
 *       400:
 *         description: User ID is required
 */
router.get('/all', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const playlists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.playlistCollectionId,
    );
    
    const userPlaylists = playlists.documents.filter(playlist => {
      if (!playlist.users || !Array.isArray(playlist.users)) return false;
      
      return playlist.users.some(user => {
        if (user.$id) return user.$id === userId;
        return false;
      });
    });
    
    const cleanedPlaylists = await Promise.all(userPlaylists.map(async (playlist) => {
      let lastPlayed = null;
      
      try {
        const game = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.gamesCollectionId,
          [Query.equal("playlists", playlist.$id)]
        );

        console.log("Game:", game);
        lastPlayed = game.documents.length > 0 ? game.documents[0].finished_date : null;
      } catch (gameError) {
        console.error('Error fetching game for playlist:', playlist.id, gameError);
      }

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description || '',
        cover: playlist.cover || '',
        fans: playlist.fans || 0,
        duration: playlist.duration || 0,
        added_date: playlist.added_date || new Date().toISOString(),
        last_played: lastPlayed,
      };
    }));
    
    return res.status(200).json(cleanedPlaylists);
  } catch (error: any) {
    console.error('Error getting all playlists:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Get songs for a playlist
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Playlist ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Songs retrieved successfully
 *       400:
 *         description: Playlist ID is required
 */
router.get('/:id', async (req: Request, res: Response) => {
    const playlistId = req.params.id;
    const userId = req.query.userId as string;
  
    if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
    }
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      let playlist;
      
      try {
        playlist = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.playlistCollectionId,
          playlistId.toString()
        );
      } catch (docError: any) {
        if (docError.code === 404 || docError.type === 'document_not_found') {
          console.log('Playlist not found with ID:', playlistId);
          return res.status(404).json({ error: 'Playlist not found' });
        }
        throw docError;
      }
      
      if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found' });
      }

      if (!playlist.users || !Array.isArray(playlist.users)) {
        return res.status(403).json({ error: 'You do not have access to this playlist' });
      }
      
      const hasAccess = playlist.users.some(user => 
        (typeof user === 'string' && user === userId) || 
        (typeof user === 'object' && user.$id === userId)
      );
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this playlist' });
      }
      
      const cleanedPlaylist = removeSystemAttributes(playlist);
      cleanedPlaylist.users = null;
      
      return res.status(200).json(cleanedPlaylist);
    
    } catch (error: any) {
      console.error('Error getting playlist:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
