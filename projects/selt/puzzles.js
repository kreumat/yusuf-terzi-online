/**
 * puzzles.js - Predefined Puzzle Templates
 * 
 * This file contains template puzzles that users can select as starting points for their board games.
 * Each puzzle defines:
 *   - A name and description
 *   - An array of [x,y] coordinates representing active cells on the 9×11 grid
 *   - Optional custom START/FINISH positions
 *   - Optional suggested text content for specific cells
 * 
 * Coordinate System:
 *   - x ranges from 1 to 9 (columns, left to right)
 *   - y ranges from 1 to 11 (rows, top to bottom)
 *   - (1,1) is the top-left cell
 * 
 * This file is referenced by grid.js which loads these template patterns when users
 * select them from the dropdown menu.
 */

const PUZZLES = {
    /**
     * Snake Shaped Puzzle
     * 
     * Creates an S-shaped path that winds across the board.
     * Uses default START (9,1) and FINISH (1,11) positions.
     */
    "snake": {
        name: "Snake Shaped",
        description: "An S shaped path from start to finish",
        // The coordinates list includes all active cells
        // It should NOT include the START (9,1) and FINISH (1,11) positions as they are fixed
        coordinates: [
            [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
            [1, 2],
            [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3],
            [9, 4],
            [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5],
            [1, 6],	
            [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],
            [9, 8],	
            [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9],
            [1, 10]
        ],
        // Optional suggested texts for cells
        // These are provided as examples but are not automatically applied
        suggestedTexts: {
            // Format: "x,y": "text"
            "5,5": "The journey begins",
            "5,6": "Follow the path",
            "6,5": "Almost there",
            "6,6": "Nearly at center"
        }
    },
    
    /**
     * Crossways Puzzle
     * 
     * Creates a crossways pattern with multiple path options.
     * Uses default START (9,1) and FINISH (1,11) positions.
     */
    "crossways": {
        name: "Crossways",
        description: "A crossways pattern with multiple paths",
        // The coordinates list includes all active cells
        coordinates: [
            [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1],
            [1, 2], [4, 2], [6, 2], [9, 2],
            [1, 3], [4, 3], [5, 3], [6, 3], [9, 3],
            [1, 4], [4, 4], [7, 4], [8, 4], [9, 4], 
            [1, 5], [4, 5], [7, 5], [9, 5], 
            [1, 6], [2, 6], [3, 6], [4, 6], [6, 6], [7, 6], [8, 6], [9, 6], 
            [1, 7], [3, 7], [6, 7], [9, 7], 
            [1, 8], [2, 8], [3, 8], [6, 8], [9, 8], 
            [1, 9], [4, 9], [5, 9], [6, 9], [9, 9], 
            [1, 10], [4, 10], [6, 10], [9, 10], 
            [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11]
        ],
        // Optional suggested texts for cells
        suggestedTexts: {
            // Format: "x,y": "text"
            "5,3": "Choose your path",
            "4,6": "Cross junction",
            "6,9": "Almost there",
            "5,11": "Final stretch"
        }
    },
    
    /**
     * Whirlwind Puzzle
     * 
     * Creates a whirlwind pattern with custom START and FINISH positions.
     * Demonstrates how to specify custom positions instead of using the defaults.
     */
    "whirlwind": {
        name: "Whirlwind",
        description: "A whirlwind pattern with custom start and finish positions",
        // The coordinates list includes all active cells
        coordinates: [
            [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], 
            [9, 2], 
            [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [9, 3], 
            [1, 4], [7, 4], [9, 4], 
            [1, 5], [3, 5], [4, 5], [5, 5], [7, 5], [9, 5], 
            [1, 6], [3, 6], [5, 6], [7, 6], [9, 6], 
            [1, 7], [3, 7], [7, 7], [9, 7], 
            [1, 8], [3, 8], [7, 8], [9, 8], 
            [1, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [9, 9], 
            [1, 10], [9, 10], 
            [1, 11], [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11]
        ],
        // Custom start and finish positions
        // These override the defaults in grid.js
        startPosition: [1, 1],
        finishPosition: [5, 7],
        // Optional suggested texts for cells
        suggestedTexts: {
            // Format: "x,y": "text"
            "3,5": "Navigate the whirlwind",
            "7,5": "Finding your path",
            "5,9": "Almost there",
            "5,7": "Reach the finish"
        }
    },

    /**
     * Piston Puzzle
     * 
     * Creates a piston-like pattern with multiple start and finish positions.
     * Automatically sets 2 START and 2 FINISH positions.
     */
    "piston": {
        name: "Piston",
        description: "A piston-like pattern with dual start and finish positions.",
        coordinates: [
            [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], 
            [5, 2], 
            [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], 
            [1, 4], [9, 4],
            [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], 
            [5, 6],
            [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],  
            [1, 8], [9, 8], 
            [1, 9], [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], 
            [5, 10],
            [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11]
        ],
        // Multiple start and finish positions
        startPositions: [[1, 1], [9, 1]],
        finishPositions: [[1, 11], [9, 11]],
        // Suggested texts for cells
        suggestedTexts: {
            "5,5": "Center control",
            "5,9": "Final stretch"
        }
    },
    
    /**
     * The Castle Puzzle
     * 
     * Creates a castle-like pattern with multiple entrances.
     * Automatically sets 3 START positions and 1 FINISH position.
     */
    "castle": {
        name: "The Castle",
        description: "A castle-like pattern with three entrances and one exit.",
        coordinates: [
            [1, 2], [5, 2], [9, 2],
            [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], 
            [1, 4], [5, 4], [9, 4],
            [1, 5], [2, 5], [4, 5], [5, 5], [6, 5], [8, 5], [9, 5], 
            [2, 6], [4, 6], [6, 6], [8, 6], 
            [2, 7], [4, 7], [5, 7], [6, 7], [8, 7],  
            [2, 8], [5, 8], [8, 8], 
            [2, 9], [4, 9], [5, 9], [6, 9], [8, 9], 
            [2, 10], [4, 10], [6, 10], [8, 10], 
            [2, 11], [3, 11], [4, 11], [6, 11], [7, 11], [8, 11]
        ],
        // Multiple start positions and one finish position
        startPositions: [[1, 1], [5, 1], [9, 1]],
        finishPositions: [[5, 11]],
        // Suggested texts for cells
        suggestedTexts: {
            "5,5": "Throne room",
            "5,7": "Inner chamber",
            "5,9": "Secret passage"
        }
    },
    
    /**
     * Erzin Roads Puzzle
     * 
     * Creates a maze-like road pattern.
     * Automatically sets START at (1,1) and FINISH at (9,11).
     */
    "erzinRoads": {
        name: "Erzin Roads",
        description: "A winding road pattern with challenging paths.",
        coordinates: [
            [5, 1], [6, 1], [7, 1], [8, 1],
            [1, 2], [2, 2], [4, 2], [5, 2], [8, 2], [9, 2],
            [2, 3], [4, 3], [9, 3],
            [1, 4], [2, 4], [4, 4], [5, 4], [7, 4], [8, 4], [9, 4],
            [1, 5], [5, 5], [7, 5], 
            [1, 6], [2, 6], [4, 6], [5, 6], [7, 6], [8, 6], [9, 6],
            [2, 7], [4, 7], [9, 7],  
            [1, 8], [2, 8], [4, 8], [5, 8], [7, 8], [8, 8], [9, 8],
            [1, 9], [5, 9], [7, 9],
            [1, 10], [2, 10], [4, 10], [5, 10], [7, 10], [8, 10], [9, 10],
            [2, 11], [3, 11], [4, 11]
        ],
        // One start position and one finish position
        startPositions: [[1, 1]],
        finishPositions: [[9, 11]],
        // Suggested texts for cells
        suggestedTexts: {
            "5,2": "Crossroads",
            "8,5": "Mountain pass",
            "2,8": "Forest path",
            "5,10": "River crossing"
        }
    }
};