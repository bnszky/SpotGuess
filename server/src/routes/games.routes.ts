import { Request, Response, Router } from 'express';
import { ID, Query } from 'node-appwrite';

import client, { databases, appwriteConfig, users } from '../config/appwrite';
import { Playlist, Song, Game } from '../types';

const router = Router();

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game
 *     description: Creates a new game entry in the database
 *     tags:
 *       - Games
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playlistId
 *               - userId
 *             properties:
 *               playlistId:
 *                 type: string
 *                 description: ID of the playlist for the game
 *               userId:
 *                 type: string
 *                 description: ID of the user playing the game
 *               correct_answers:
 *                 type: number
 *                 description: Number of correct answers
 *               questions_number:
 *                 type: number
 *                 description: Total number of questions in the game
 *     responses:
 *       201:
 *         description: Game created successfully
 *       400:
 *         description: Bad request - Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { playlistId, userId, correct_answers, questions_number } = req.body;
    
    if (!playlistId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'PlaylistId and userId are required',
      });
    }
    
    const newGame = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.gamesCollectionId,
      ID.unique(),
      {
        playlists: playlistId,
        player: userId,
        correct_answers,
        questions_number,
        finished_date: new Date().toISOString(),
      }
    );
    
    return res.status(201).json({
      success: true,
    });
    
  } catch (error) {
    console.error('Error creating game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create game',
    });
  }
});

/**
 * @swagger
 * /games/user/{userId}:
 *   get:
 *     summary: Get all games for a specific user
 *     description: Retrieves all game entries for a specific user
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 games:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No games found for the user
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }
    
    const games = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.gamesCollectionId,
      [Query.equal('player', userId)]
    );
    
    if (games.documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found for this user',
      });
    }
    
    return res.status(200).json(
        games.documents.map((game: Game) => ({
            id: game.$id,
            title: game.playlists.title,
            cover: game.playlists.cover,
            fans: game.playlists.fans,
            duration: game.playlists.duration,
            description: game.playlists.description,
            correct_answers: game.correct_answers,
            questions_number: game.questions_number,
            finished_date: game.finished_date,
            }))
    );
    
  } catch (error) {
    console.error('Error retrieving games:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve games',
    });
  }
});

/**
 * @swagger
 * /games/quiz/{id}:
 *   get:
 *     summary: Get quiz questions for a playlist
 *     description: Retrieves a set of quiz questions with multiple choice answers based on songs from the specified playlist
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the playlist to create questions from
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user accessing the quiz (must have access to the playlist)
 *       - in: query
 *         name: number
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of questions to generate
 *     responses:
 *       200:
 *         description: Quiz questions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   song:
 *                     type: object
 *                     description: The song to guess
 *                   answers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: Title of the song option
 *                         correct:
 *                           type: string
 *                           enum: ["true", "false"]
 *                           description: Whether this option is the correct answer
 *       400:
 *         description: Bad request - Missing required parameters
 *       403:
 *         description: Forbidden - User does not have access to this playlist
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Server error
 */
router.get('/quiz/:id', async (req: Request, res: Response) => {
    const playlistId = req.params.id;
    const userId = req.query.userId as string;
    const questionsNumber = req.query.number as unknown as number;
  
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
      
      return res.status(200).json(generateQuestions(playlist, questionsNumber));
    
    } catch (error: any) {
      console.error('Error getting playlist:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

function generateQuestions(playlist: Playlist, number: number) {
  const questionCount = Math.min(number, playlist.songs?.length || 0);
  
  if (!playlist.songs || questionCount === 0) {
    return [];
  }
  
  const shuffledTracks = [...playlist.songs].sort(() => Math.random() - 0.5);
  
  const questionTracks = shuffledTracks.slice(0, questionCount);
  
  return questionTracks.map(song => {
    const incorrectAnswers = playlist.songs
      .filter(track => track.id !== song.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
      
    let answers = [
      ...incorrectAnswers.map(track => ({
        title: track.title,
        isCorrect: "false"
      })),
      {
        title: song.title,
        isCorrect: "true"
      }
    ];
    
    answers = answers.sort(() => Math.random() - 0.5);
    
    return {
      song,
      answers
    };
  });
}

export default router;