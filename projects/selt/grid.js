/**
 * grid.js - Grid Creation and Management Module
 * 
 * This file manages the interactive grid creation process - the first step in the board game generation workflow.
 * It handles all grid interactions including:
 * - Generating the initial 9×11 grid
 * - Managing cell selection/deselection with colors
 * - Special cell types (START/FINISH positions)
 * - Adjacent cell highlighting
 * - Template loading from puzzles.js
 * - Grid data preparation for the next step (edit.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core DOM elements
    const elements = {
        grid: document.getElementById('grid'),
        saveBtn: document.getElementById('save-grid'),
        puzzleSelect: document.getElementById('puzzle-select'),
        colorOptions: document.querySelectorAll('.color-option'),
        startButton: document.getElementById('start-button'),
        finishButton: document.getElementById('finish-button'),
        validationMessage: document.getElementById('validation-message')
    };
    
    // Add clear grid button
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-grid';
    clearBtn.textContent = 'Clear Grid';
    clearBtn.classList.add('clear-btn');
    elements.puzzleSelect.parentNode.parentNode.insertBefore(clearBtn, elements.saveBtn);
    
    // Grid configuration
    const config = {
        rows: 11,
        cols: 9,
        currentColor: 'default',
        currentMode: 'regular', // 'regular', 'start', or 'finish'
        customGridCache: null
    };
    
    // Initialize grid data with coordinates format
    let gridData = initGridData();
    
    // Set initial highlight color class on grid
    elements.grid.classList.add(`highlight-color-${config.currentColor}`);
    
    // Coordinate conversion utilities
    const coords = {
        // Convert 1-based x,y coordinates to linear index
        toIndex: (x, y) => (y - 1) * config.cols + (x - 1),
        
        // Convert linear index to 1-based x,y coordinates
        fromIndex: (index) => ({
            x: (index % config.cols) + 1,
            y: Math.floor(index / config.cols) + 1
        }),
        
        // Convert 0-based row,col to 1-based x,y coordinates
        fromRowCol: (row, col) => ({ x: col + 1, y: row + 1 }),
        
        // Convert 1-based x,y coordinates to 0-based row,col
        toRowCol: (x, y) => ({ row: y - 1, col: x - 1 })
    };
    
    // Grid state utilities
    const gridState = {
        // Check if a coordinate is in the active cells array
        isActive: (x, y) => gridData.cells.some(cell => cell[0] === x && cell[1] === y),
        
        // Check if a coordinate is a Start position
        isStart: (x, y) => gridData.startPositions.some(pos => pos[0] === x && pos[1] === y),
        
        // Check if a coordinate is a Finish position
        isFinish: (x, y) => gridData.finishPositions.some(pos => pos[0] === x && pos[1] === y)
    };

    // DOM utilities
    const domUtils = {
        clearHighlights: () => {
            document.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
        },
        
        // Helper to add/remove multiple classes
        updateClasses: (element, classesToAdd = [], classesToRemove = []) => {
            classesToRemove.forEach(cls => element.classList.remove(cls));
            classesToAdd.forEach(cls => element.classList.add(cls));
        },
        
        // Find a cell by coordinates
        getCell: (x, y) => {
            const rowCol = coords.toRowCol(x, y);
            return document.querySelector(`.cell[data-row="${rowCol.row}"][data-col="${rowCol.col}"]`);
        },
        
        // Helper to remove color classes
        removeColorClasses: (element) => {
            const colorClasses = element.className.split(' ').filter(c => c.startsWith('color-'));
            colorClasses.forEach(colorClass => element.classList.remove(colorClass));
        }
    };
    
    // Initialize grid and set up event listeners
    function init() {
        generateGrid();
        setupEventListeners();
        
        // Initial validation
        updateSaveButtonState();
        
        // Initialize the previous selection value
        elements.puzzleSelect.dataset.previousValue = elements.puzzleSelect.value;
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Core buttons
        elements.saveBtn.addEventListener('click', saveGrid);
        clearBtn.addEventListener('click', clearGridConfirm);
        elements.puzzleSelect.addEventListener('change', loadSelectedPuzzle);
        
        // Start and Finish buttons
        elements.startButton.addEventListener('click', () => toggleSpecialMode('start'));
        elements.finishButton.addEventListener('click', () => toggleSpecialMode('finish'));
        
        // Document click for clearing highlights
        document.addEventListener('click', (event) => {
            if (!elements.grid.contains(event.target) && 
                event.target !== elements.startButton && 
                event.target !== elements.finishButton) {
                domUtils.clearHighlights();
            }
        });
        
        // Color palette
        elements.colorOptions.forEach(option => {
            option.addEventListener('click', () => selectColor(option));
        });
    }
    
    // Initialize grid data structure
    function initGridData() {
        return {
            rows: config.rows,
            cols: config.cols,
            cells: [], // [x,y] coordinates
            cellIndices: [], // linear indices for backwards compatibility
            cellColors: {}, // Colors for each cell using "x,y" as keys
            startPositions: [], // Start positions
            finishPositions: [] // Finish positions
        };
    }
    
    // Toggle between start/finish/regular modes
    function toggleSpecialMode(mode) {
        if (config.currentMode === mode) {
            // Turn off mode if it's already active
            config.currentMode = 'regular';
            elements[`${mode}Button`].classList.remove('active');
        } else {
            // Switch to mode
            config.currentMode = mode;
            domUtils.updateClasses(elements[`${mode}Button`], ['active'], []);
            
            // Turn off other special button if active
            const otherMode = mode === 'start' ? 'finish' : 'start';
            elements[`${otherMode}Button`].classList.remove('active');
            
            // Clear highlights when switching modes
            domUtils.clearHighlights();
        }
    }
    
    // Handle color selection
    function selectColor(option) {
        // Remove selected class from all options
        elements.colorOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Update current color
        config.currentColor = option.dataset.color;
        
        // Also switch back to regular mode
        config.currentMode = 'regular';
        elements.startButton.classList.remove('active');
        elements.finishButton.classList.remove('active');
        
        // Update grid highlight color class
        const highlightClasses = Array.from(elements.grid.classList)
            .filter(cls => cls.startsWith('highlight-color-'));
        domUtils.updateClasses(elements.grid, [`highlight-color-${config.currentColor}`], highlightClasses);
    }
    
    // Update save button state based on validation rules
    function updateSaveButtonState() {
        const hasStart = gridData.startPositions.length > 0;
        const hasFinish = gridData.finishPositions.length > 0;
        
        elements.saveBtn.disabled = !(hasStart && hasFinish);
        elements.validationMessage.classList.toggle('hidden', hasStart && hasFinish);
    }
    
    // Generate the grid structure with empty cells
    function generateGrid() {
        // Reset grid data
        gridData = initGridData();
        
        // Clear previous grid
        elements.grid.innerHTML = '';
        elements.grid.style.setProperty('--rows', config.rows);
        elements.grid.style.setProperty('--cols', config.cols);
        
        // Create grid cells
        for (let i = 0; i < config.rows; i++) {
            for (let j = 0; j < config.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Convert to 1-based coordinates for data attributes
                const coord = coords.fromRowCol(i, j);
                cell.dataset.x = coord.x;
                cell.dataset.y = coord.y;
                
                cell.addEventListener('click', () => handleCellClick(cell, i, j));
                elements.grid.appendChild(cell);
            }
        }
    }
    
    // Highlight cells adjacent to the selected cell
    function highlightAdjacentCells(row, col) {
        domUtils.clearHighlights();
        
        // Only highlight adjacent cells in regular mode
        if (config.currentMode !== 'regular') return;
        
        const directions = [
            { dr: -1, dc: 0 },  // up
            { dr: 1, dc: 0 },   // down
            { dr: 0, dc: -1 },  // left
            { dr: 0, dc: 1 }    // right
        ];
        
        directions.forEach(dir => {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            // Check if the adjacent cell is within bounds
            if (newRow >= 0 && newRow < config.rows && newCol >= 0 && newCol < config.cols) {
                const coord = coords.fromRowCol(newRow, newCol);
                
                // Skip if it's already active or is start/finish
                if (gridState.isActive(coord.x, coord.y) || 
                    gridState.isStart(coord.x, coord.y) || 
                    gridState.isFinish(coord.x, coord.y)) {
                    return;
                }
                
                const cell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                if (cell) {
                    cell.classList.add('highlight');
                }
            }
        });
    }
    
    // Handle different operations based on cell type
    function handleCellClick(cell, row, col) {
        const coord = coords.fromRowCol(row, col);
        const x = coord.x;
        const y = coord.y;
        const cellIndex = row * config.cols + col;
        const coordKey = `${x},${y}`;
        
        if (cell.classList.contains('start')) {
            handleStartRemoval(cell, x, y, cellIndex);
        } else if (cell.classList.contains('finish')) {
            handleFinishRemoval(cell, x, y, cellIndex);
        } else if (config.currentMode === 'start') {
            handleStartAddition(cell, x, y, cellIndex, coordKey);
        } else if (config.currentMode === 'finish') {
            handleFinishAddition(cell, x, y, cellIndex, coordKey);
        } else {
            handleRegularCellToggle(cell, x, y, cellIndex, coordKey, row, col);
        }
        
        // Cache grid if we're in custom mode
        if (!elements.puzzleSelect.value) {
            cacheCustomGrid();
        }
        
        // Update validation
        updateSaveButtonState();
    }
    
    // Handle removal of a Start cell
    function handleStartRemoval(cell, x, y, cellIndex) {
        cell.classList.remove('start', 'active');
        cell.textContent = '';
        
        // Remove from startPositions
        gridData.startPositions = gridData.startPositions.filter(pos => 
            !(pos[0] === x && pos[1] === y));
        
        // Always remove from active cells when a start tile is deselected
        // This ensures it won't be treated as an active tile with a color
        gridData.cells = gridData.cells.filter(coord => 
            !(coord[0] === x && coord[1] === y));
        gridData.cellIndices = gridData.cellIndices.filter(index => 
            index !== cellIndex);
        
        // Always remove from cellColors to prevent ghost tiles
        delete gridData.cellColors[`${x},${y}`];
        
        // If we're in regular mode, highlight adjacent cells after removing
        if (config.currentMode === 'regular') {
            domUtils.clearHighlights();
        }
    }
    
    // Handle removal of a Finish cell
    function handleFinishRemoval(cell, x, y, cellIndex) {
        cell.classList.remove('finish', 'active');
        cell.textContent = '';
        
        // Remove from finishPositions
        gridData.finishPositions = gridData.finishPositions.filter(pos => 
            !(pos[0] === x && pos[1] === y));
        
        // Always remove from active cells when a finish tile is deselected
        // This ensures it won't be treated as an active tile with a color
        gridData.cells = gridData.cells.filter(coord => 
            !(coord[0] === x && coord[1] === y));
        gridData.cellIndices = gridData.cellIndices.filter(index => 
            index !== cellIndex);
        
        // Always remove from cellColors to prevent ghost tiles
        delete gridData.cellColors[`${x},${y}`];
        
        // If we're in regular mode, highlight adjacent cells after removing
        if (config.currentMode === 'regular') {
            domUtils.clearHighlights();
        }
    }
    
    // Handle adding a Start cell
    function handleStartAddition(cell, x, y, cellIndex, coordKey) {
        // First, if it's a Finish cell, remove that designation
        if (cell.classList.contains('finish')) {
            cell.classList.remove('finish');
            gridData.finishPositions = gridData.finishPositions.filter(pos => 
                !(pos[0] === x && pos[1] === y));
        }
        
        // Add Start status
        cell.classList.add('start', 'active');
        cell.textContent = 'START';
        
        // Add to startPositions
        gridData.startPositions.push([x, y]);
        
        // Make sure it's in the active cells list
        if (!gridState.isActive(x, y)) {
            gridData.cells.push([x, y]);
            gridData.cellIndices.push(cellIndex);
        }
        
        // Remove any color classes
        domUtils.removeColorClasses(cell);
        
        // Remove from cellColors if it exists
        if (gridData.cellColors[coordKey]) {
            delete gridData.cellColors[coordKey];
        }
    }
    
    // Handle adding a Finish cell
    function handleFinishAddition(cell, x, y, cellIndex, coordKey) {
        // First, if it's a Start cell, remove that designation
        if (cell.classList.contains('start')) {
            cell.classList.remove('start');
            gridData.startPositions = gridData.startPositions.filter(pos => 
                !(pos[0] === x && pos[1] === y));
        }
        
        // Add Finish status
        cell.classList.add('finish', 'active');
        cell.textContent = 'FINISH';
        
        // Add to finishPositions
        gridData.finishPositions.push([x, y]);
        
        // Make sure it's in the active cells list
        if (!gridState.isActive(x, y)) {
            gridData.cells.push([x, y]);
            gridData.cellIndices.push(cellIndex);
        }
        
        // Remove any color classes
        domUtils.removeColorClasses(cell);
        
        // Remove from cellColors if it exists
        if (gridData.cellColors[coordKey]) {
            delete gridData.cellColors[coordKey];
        }
    }
    
    // Handle toggling a regular cell
    function handleRegularCellToggle(cell, x, y, cellIndex, coordKey, row, col) {
        // Toggle cell state
        if (cell.classList.contains('active')) {
            // Deactivate cell
            cell.classList.remove('active');
            domUtils.removeColorClasses(cell);
            
            // Remove from data structures
            gridData.cells = gridData.cells.filter(coord => 
                !(coord[0] === x && coord[1] === y));
            gridData.cellIndices = gridData.cellIndices.filter(index => 
                index !== cellIndex);
            delete gridData.cellColors[coordKey];
            
            domUtils.clearHighlights();
        } else {
            // Activate cell with current color
            cell.classList.add('active', `color-${config.currentColor}`);
            
            // Add to data structures
            gridData.cells.push([x, y]);
            gridData.cellIndices.push(cellIndex);
            gridData.cellColors[coordKey] = config.currentColor;
            
            highlightAdjacentCells(row, col);
        }
    }
    
    // Load a selected puzzle template
    function loadSelectedPuzzle() {
        const puzzleKey = elements.puzzleSelect.value;
        const previousValue = elements.puzzleSelect.dataset.previousValue;
        
        // If we're switching to custom mode
        if (!puzzleKey) {
            // Restore cached grid if available
            if (config.customGridCache) {
                restoreCustomGrid();
            } else {
                clearGrid();
            }
        } else {
            // We're switching to a template
            
            // Cache custom grid if coming from custom mode with content
            if (previousValue === "" && 
                (gridData.cells.length > 0 || 
                 gridData.startPositions.length > 0 || 
                 gridData.finishPositions.length > 0)) {
                cacheCustomGrid();
            }
            
            if (PUZZLES && PUZZLES[puzzleKey]) {
                loadPuzzleTemplate(PUZZLES[puzzleKey]);
            }
        }
        
        // Store current selection for next time
        elements.puzzleSelect.dataset.previousValue = puzzleKey;
        
        // Update validation state
        updateSaveButtonState();
    }
    
    // Load a specific puzzle template
    function loadPuzzleTemplate(puzzle) {
        // Clear grid first
        clearGrid();
        
        // Load coordinates from puzzle
        puzzle.coordinates.forEach(coord => {
            const x = coord[0];
            const y = coord[1];
            const coordKey = `${x},${y}`;
            
            // Find the cell and activate it
            const rowCol = coords.toRowCol(x, y);
            const cell = document.querySelector(
                `.cell[data-row="${rowCol.row}"][data-col="${rowCol.col}"]`
            );
            
            if (cell) {
                // Activate cell with current color
                cell.classList.add('active', `color-${config.currentColor}`);
                
                // Add to grid data
                gridData.cells.push([x, y]);
                gridData.cellIndices.push(rowCol.row * config.cols + rowCol.col);
                gridData.cellColors[coordKey] = config.currentColor;
            }
        });
        
        // Set Start and Finish positions (use defaults or custom)
        setStartFinishPositions(puzzle);
    }
    
    // Set Start and Finish positions from puzzle template
    function setStartFinishPositions(puzzle) {
        // Handle multiple start positions
        if (puzzle.startPositions && Array.isArray(puzzle.startPositions)) {
            // Apply each start position in the array
            puzzle.startPositions.forEach(pos => {
                if (Array.isArray(pos) && pos.length === 2) {
                    const startX = pos[0];
                    const startY = pos[1];
                    
                    // Set Start position
                    const startCell = domUtils.getCell(startX, startY);
                    if (startCell) {
                        startCell.classList.add('start', 'active');
                        startCell.textContent = 'START';
                        gridData.startPositions.push([startX, startY]);
                        
                        // Make sure it's in active cells list
                        if (!gridState.isActive(startX, startY)) {
                            gridData.cells.push([startX, startY]);
                            const startRowCol = coords.toRowCol(startX, startY);
                            gridData.cellIndices.push(startRowCol.row * config.cols + startRowCol.col);
                        }
                    }
                }
            });
        } else {
            // Handle single start position (for backward compatibility)
            // Default position
            let startX = config.cols;
            let startY = 1;
            
            // Use custom Start position if defined
            if (puzzle.startPosition && Array.isArray(puzzle.startPosition) && puzzle.startPosition.length === 2) {
                startX = puzzle.startPosition[0];
                startY = puzzle.startPosition[1];
            }
            
            // Set Start position
            const startCell = domUtils.getCell(startX, startY);
            if (startCell) {
                startCell.classList.add('start', 'active');
                startCell.textContent = 'START';
                gridData.startPositions.push([startX, startY]);
                
                // Make sure it's in active cells list
                if (!gridState.isActive(startX, startY)) {
                    gridData.cells.push([startX, startY]);
                    const startRowCol = coords.toRowCol(startX, startY);
                    gridData.cellIndices.push(startRowCol.row * config.cols + startRowCol.col);
                }
            }
        }
        
        // Handle multiple finish positions
        if (puzzle.finishPositions && Array.isArray(puzzle.finishPositions)) {
            // Apply each finish position in the array
            puzzle.finishPositions.forEach(pos => {
                if (Array.isArray(pos) && pos.length === 2) {
                    const finishX = pos[0];
                    const finishY = pos[1];
                    
                    // Set Finish position
                    const finishCell = domUtils.getCell(finishX, finishY);
                    if (finishCell) {
                        finishCell.classList.add('finish', 'active');
                        finishCell.textContent = 'FINISH';
                        gridData.finishPositions.push([finishX, finishY]);
                        
                        // Make sure it's in active cells list
                        if (!gridState.isActive(finishX, finishY)) {
                            gridData.cells.push([finishX, finishY]);
                            const finishRowCol = coords.toRowCol(finishX, finishY);
                            gridData.cellIndices.push(finishRowCol.row * config.cols + finishRowCol.col);
                        }
                    }
                }
            });
        } else {
            // Handle single finish position (for backward compatibility)
            // Default position
            let finishX = 1;
            let finishY = config.rows;
            
            // Use custom Finish position if defined
            if (puzzle.finishPosition && Array.isArray(puzzle.finishPosition) && puzzle.finishPosition.length === 2) {
                finishX = puzzle.finishPosition[0];
                finishY = puzzle.finishPosition[1];
            }
            
            // Set Finish position
            const finishCell = domUtils.getCell(finishX, finishY);
            if (finishCell) {
                finishCell.classList.add('finish', 'active');
                finishCell.textContent = 'FINISH';
                gridData.finishPositions.push([finishX, finishY]);
                
                // Make sure it's in active cells list
                if (!gridState.isActive(finishX, finishY)) {
                    gridData.cells.push([finishX, finishY]);
                    const finishRowCol = coords.toRowCol(finishX, finishY);
                    gridData.cellIndices.push(finishRowCol.row * config.cols + finishRowCol.col);
                }
            }
        }
    }
    
    // Clear all cells in the grid
    function clearGrid() {
        // Reset grid data to empty
        gridData.cells = [];
        gridData.cellIndices = [];
        gridData.cellColors = {};
        gridData.startPositions = [];
        gridData.finishPositions = [];
        
        // Update UI - remove all classes and text
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('active', 'start', 'finish');
            cell.textContent = '';
            domUtils.removeColorClasses(cell);
        });
        
        // Clear highlights
        domUtils.clearHighlights();
        
        // Update validation
        updateSaveButtonState();
    }
    
    // Confirm grid clearing with user
    function clearGridConfirm() {
        if (confirm('Are you sure you want to clear all tiles from the grid?')) {
            clearGrid();
            
            // If we're in custom mode, also clear the cache
            if (!elements.puzzleSelect.value) {
                config.customGridCache = null;
            }
        }
    }
    
    // Cache the current custom grid
    function cacheCustomGrid() {
        config.customGridCache = {
            cells: [...gridData.cells],
            cellIndices: [...gridData.cellIndices],
            cellColors: {...gridData.cellColors},
            startPositions: [...gridData.startPositions],
            finishPositions: [...gridData.finishPositions]
        };
    }
    
    // Restore the custom grid from cache
    function restoreCustomGrid() {
        // Reset to initial state
        clearGrid();
        
        // Restore data from cache
        gridData.cells = [...config.customGridCache.cells];
        gridData.cellIndices = [...config.customGridCache.cellIndices];
        gridData.cellColors = {...config.customGridCache.cellColors};
        gridData.startPositions = [...config.customGridCache.startPositions];
        gridData.finishPositions = [...config.customGridCache.finishPositions];
        
        // Update UI to match restored data
        updateGridUI();
    }
    
    // Update UI to match grid data
    function updateGridUI() {
        document.querySelectorAll('.cell').forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            
            // Check if this cell is a Start position
            if (gridState.isStart(x, y)) {
                cell.classList.add('start', 'active');
                cell.textContent = 'START';
                return;
            }
            
            // Check if this cell is a Finish position
            if (gridState.isFinish(x, y)) {
                cell.classList.add('finish', 'active');
                cell.textContent = 'FINISH';
                return;
            }
            
            // Check if this cell is an active regular cell
            if (gridState.isActive(x, y)) {
                cell.classList.add('active');
                
                // Add color class if available
                const coordKey = `${x},${y}`;
                if (gridData.cellColors[coordKey]) {
                    cell.classList.add(`color-${gridData.cellColors[coordKey]}`);
                }
            }
        });
    }
    
    // Save grid data and proceed to next step
    function saveGrid() {
        // Validate grid has required elements
        if (gridData.startPositions.length === 0) {
            alert('Please add at least one Start tile to your board.');
            return;
        }
        
        if (gridData.finishPositions.length === 0) {
            alert('Please add at least one Finish tile to your board.');
            return;
        }
        
        if (gridData.cells.length < 1 && 
            gridData.startPositions.length + gridData.finishPositions.length < 2) {
            alert('Please add at least one regular cell to your board.');
            return;
        }
        
        // If we're in custom mode, update the cache before saving
        if (!elements.puzzleSelect.value) {
            cacheCustomGrid();
        }
        
        // Modified for static HTML version: Show an alert that this is a demo
        alert('This is a static HTML demo of the Board Game Generator. In the full version, you would proceed to the next step to add text to your board tiles.');
        
        // Save grid data to localStorage if needed for other static pages
        localStorage.setItem('boardGameGridData', JSON.stringify({
            rows: gridData.rows,
            cols: gridData.cols,
            cells: gridData.cellIndices,
            coordinates: gridData.cells,
            cellColors: gridData.cellColors,
            startPositions: gridData.startPositions,
            finishPositions: gridData.finishPositions
        }));
    }
    
    // Initialize the grid
    init();
});