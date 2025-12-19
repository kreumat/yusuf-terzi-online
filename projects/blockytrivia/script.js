// --- GAME CONFIGURATION ---
const CONFIG = {
    DIFFICULTY: {
        EASY: {
            name: 'EASY',
            color: '#55FF55',
            playerDamage: 20,
            bossDamage: 1,
            armor: {
                helmet: 'images/diamond/diamond_helmet.png',
                chestplate: 'images/diamond/diamond_chestplate.png',
                leggings: 'images/diamond/diamond_leggings.png',
                boots: 'images/diamond/diamond_boots.png',
                sword: 'images/diamond/diamond_sword.png',
                gappleAmount: '2x'
            }
        },
        NORMAL: {
            name: 'NORMAL',
            color: '#FFFF55',
            playerDamage: 15,
            bossDamage: 2,
            armor: {
                helmet: 'images/iron/iron_helmet.png',
                chestplate: 'images/iron/iron_chestplate.png',
                leggings: 'images/iron/iron_leggings.png',
                boots: 'images/iron/iron_boots.png',
                sword: 'images/diamond/diamond_sword.png',
                gappleAmount: '2x'
            }
        },
        HARD: {
            name: 'HARD',
            color: '#FF5555',
            playerDamage: 10,
            bossDamage: 4,
            armor: {
                helmet: 'images/chainmail/chainmail_helmet.png',
                chestplate: 'images/chainmail/chainmail_chestplate.png',
                leggings: 'images/chainmail/chainmail_leggings.png',
                boots: 'images/chainmail/chainmail_boots.png',
                // TODO: These swords will be updated to Iron Swords in a future update.
                sword: 'images/diamond/diamond_sword.png',
                gappleAmount: '1x'
            }
        },
        HARDCORE: {
            name: 'HARDCORE',
            color: '#AA0000',
            playerDamage: 10,
            bossDamage: 10,
            armor: {
                helmet: 'images/empty/empty_armor_slot_helmet.png',
                chestplate: 'images/empty/empty_armor_slot_chestplate.png',
                leggings: 'images/empty/empty_armor_slot_leggings.png',
                boots: 'images/empty/empty_armor_slot_boots.png',
                // TODO: These swords will be updated to Iron Swords in a future update.
                sword: 'images/diamond/diamond_sword.png',
                gappleAmount: '0x'
            }
        }
    },
    INITIAL_PLAYER_HP: 20, // 10 Hearts
    INITIAL_BOSS_HP: 100,
    GAPPLE_HEAL: 4, // 2 Absorption Hearts
    MAX_ABSORPTION_HP: 16 // 8 Hearts
};

// --- STATE VARIABLES ---
let gameState = {
    selectedQuest: null,
    selectedDifficulty: 'NORMAL',
    playerHP: CONFIG.INITIAL_PLAYER_HP,
    bossHP: CONFIG.INITIAL_BOSS_HP,
    absorptionHP: 0,
    gapplesRemaining: 0,
    currentQuestionIndex: 0,
    questionPool: [],

    // Game Flow Flags
    isAnswering: false,

    // Three.js related
    scene: null,
    camera: null,
    renderer: null,
    mixer: null,
    witherModel: null,
    swordModel: null,

    // Animation Actions
    idleAction: null,
    shootAction: null,

    // Tweens (for cleanup)
    activeTweens: {
        cameraShake: null,
        witherMove: null
    },

    // Timer Management
    timers: {
        countdown: null,
        slideDownDelay: null,
        combatTriggerDelay: null,
        cooldown: null,
        animReset: null,
        flashReset: null
    }
};

// --- AUDIO MANAGEMENT ---
const SOUNDS = {
    gapple_eat: null,
    hurt: null,
    witherhurt: null
};

const clock = new THREE.Clock();

// --- DOM ELEMENTS ---
const screens = {
    menu: document.getElementById('main-menu'),
    credits: document.getElementById('credits-screen'),
    quest: document.getElementById('quest-selection'),
    difficulty: document.getElementById('difficulty-selection'),
    game: document.getElementById('game-container'),
    gameOver: document.getElementById('game-over-screen')
};

// --- HELPER FUNCTIONS ---
function playSound(key) {
    if (SOUNDS[key]) {
        SOUNDS[key].currentTime = 0;
        SOUNDS[key].play().catch(e => console.warn("Audio play failed:", e));
    }
}

function showFeedback(isCorrect) {
    const feedbackText = document.getElementById('feedback-text');
    feedbackText.innerText = isCorrect ? "CORRECT!" : "WRONG!";

    // Base classes
    const baseClasses = "text-4xl md:text-6xl lg:text-8xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    const colorClass = isCorrect ? "text-green-500" : "text-red-500";

    // Reset and apply initial state
    feedbackText.className = `${baseClasses} ${colorClass} scale-0 opacity-0`;

    // Force reflow
    void feedbackText.offsetWidth;

    // Pop in
    feedbackText.classList.remove('scale-0', 'opacity-0');
    feedbackText.classList.add('scale-125', 'opacity-100');

    // Hide after delay (sync with slide down approx)
    setTimeout(() => {
        feedbackText.classList.remove('scale-125', 'opacity-100');
        feedbackText.classList.add('scale-0', 'opacity-0');
    }, 1000);
}

function clearAllTimers() {
    if (gameState.timers.countdown) clearInterval(gameState.timers.countdown);
    if (gameState.timers.slideDownDelay) clearTimeout(gameState.timers.slideDownDelay);
    if (gameState.timers.combatTriggerDelay) clearTimeout(gameState.timers.combatTriggerDelay);
    if (gameState.timers.cooldown) clearTimeout(gameState.timers.cooldown);
    if (gameState.timers.animReset) clearTimeout(gameState.timers.animReset);
    if (gameState.timers.flashReset) clearTimeout(gameState.timers.flashReset);

    // Reset references
    gameState.timers = {
        countdown: null,
        slideDownDelay: null,
        combatTriggerDelay: null,
        cooldown: null,
        animReset: null,
        flashReset: null
    };
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sounds
    SOUNDS.gapple_eat = new Audio('audio/gapple_eat.mp3');
    SOUNDS.hurt = new Audio('audio/hurt.mp3');
    SOUNDS.witherhurt = new Audio('audio/witherhurt.mp3');

    setupMenuListeners();
    // Initialize background
    updateBackground('menu');
});

function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
    
    // Update background if not credits (Credits keeps previous background or handles itself)
    if (screenName !== 'credits') {
        updateBackground(screenName);
    }
}

// --- PHASE 1 & 2: MENU & QUEST SELECTION ---
function setupMenuListeners() {
    // Menu
    document.getElementById('btn-play').addEventListener('click', () => {
        loadQuestSelection();
        switchScreen('quest');
    });

    document.getElementById('btn-credits').addEventListener('click', () => {
        switchScreen('credits');
    });

    document.getElementById('btn-credits-back').addEventListener('click', () => {
        switchScreen('menu');
    });

    // Quest Selection
    document.getElementById('btn-quest-back').addEventListener('click', () => {
        switchScreen('menu');
    });

    // Custom Quest Upload
    const uploadInput = document.getElementById('quest-upload-input');
    const uploadBtn = document.getElementById('btn-upload-trigger');
    const uploadError = document.getElementById('upload-error');

    uploadBtn.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Validation
                if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
                    throw new Error("Invalid Quest Format");
                }

                // Success
                uploadError.classList.add('hidden');
                uploadInput.value = ''; // Reset
                selectQuest(data);

            } catch (err) {
                console.error("Upload Error:", err);
                uploadError.innerText = "Please ensure your JSON file matches the example format.";
                uploadError.classList.remove('hidden');
                uploadInput.value = ''; // Reset
            }
        };
        reader.readAsText(file);
    });

    // Difficulty
    document.getElementById('btn-start-game').addEventListener('click', startGame);

    // Game Over
    document.getElementById('btn-play-again').addEventListener('click', () => {
         clearAllTimers();
         switchScreen('menu');
    });

    document.getElementById('btn-game-over-credits').addEventListener('click', () => {
        clearAllTimers();
        switchScreen('credits');
    });
}

async function loadQuestSelection() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '<p class="text-white text-xl">Loading...</p>';

    try {
        container.innerHTML = '';
        for (let i = 1; i <= 10; i++) {
            const response = await fetch(`trivia_json/json${i}.json`);
            if (!response.ok) throw new Error(`Failed to load json${i}.json`);
            const data = await response.json();

            const btn = document.createElement('button');
            // Replaced minecraft-btn with new Tailwind classes
            btn.className = 'w-full h-full p-6 bg-zinc-800 border-2 border-zinc-600 hover:border-yellow-400 hover:bg-zinc-700 text-white text-xl md:text-2xl shadow-lg transition-all rounded-lg flex items-center justify-center text-center';
            btn.innerText = data.NAME;
            btn.onclick = () => selectQuest(data);
            container.appendChild(btn);
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-red-500 text-xl">Error loading quests.</p>';
    }
}

function selectQuest(data) {
    gameState.selectedQuest = data;
    gameState.questionPool = [...data.questions];
    initDifficultyScreen();
    switchScreen('difficulty');
}

// --- PHASE 3: DIFFICULTY SELECTION ---
const difficultyKeys = ['EASY', 'NORMAL', 'HARD', 'HARDCORE'];
let currentDiffIndex = 1;

function initDifficultyScreen() {
    updateDifficultyDisplay();

    const prevBtn = document.getElementById('diff-prev-btn');
    const nextBtn = document.getElementById('diff-next-btn');

    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    newPrev.addEventListener('click', () => {
        currentDiffIndex--;
        if (currentDiffIndex < 0) currentDiffIndex = difficultyKeys.length - 1;
        updateDifficultyDisplay();
    });

    newNext.addEventListener('click', () => {
        currentDiffIndex++;
        if (currentDiffIndex >= difficultyKeys.length) currentDiffIndex = 0;
        updateDifficultyDisplay();
    });
}

function updateDifficultyDisplay() {
    const key = difficultyKeys[currentDiffIndex];
    const diff = CONFIG.DIFFICULTY[key];
    gameState.selectedDifficulty = key;

    const title = document.getElementById('difficulty-title');
    title.innerText = diff.name;
    title.style.color = diff.color;

    document.getElementById('item-helmet').src = diff.armor.helmet;
    document.getElementById('item-chestplate').src = diff.armor.chestplate;
    document.getElementById('item-leggings').src = diff.armor.leggings;
    document.getElementById('item-boots').src = diff.armor.boots;
    document.getElementById('item-sword').src = diff.armor.sword;
    document.getElementById('item-golden-apple').src = 'images/items/apple_golden.png';

    const gappleText = document.getElementById('gapple-amount');
    gappleText.innerText = diff.armor.gappleAmount;
    gappleText.style.color = diff.color;
}

// --- PHASE 4: GAME START & LOOP ---
function startGame() {
    // 0. Safety Cleanup
    clearAllTimers();

    // Fade In Overlay
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');

    // Parse Gapple Amount
    const gappleStr = CONFIG.DIFFICULTY[gameState.selectedDifficulty].armor.gappleAmount;
    // Extract number from string like "2x" or "0x"
    const gappleCount = parseInt(gappleStr);
    gameState.gapplesRemaining = isNaN(gappleCount) ? 0 : gappleCount;

    // Wait 3.5 seconds
    setTimeout(() => {
        // 1. Reset Game State
        gameState.playerHP = CONFIG.INITIAL_PLAYER_HP;
        gameState.bossHP = CONFIG.INITIAL_BOSS_HP;
        gameState.absorptionHP = 0;
        gameState.questionPool = [...gameState.selectedQuest.questions].sort(() => Math.random() - 0.5);
        gameState.currentQuestionIndex = 0;
        gameState.isAnswering = false;

        // Reset Tweens
        if(gameState.activeTweens.cameraShake) gameState.activeTweens.cameraShake.stop();
        if(gameState.activeTweens.witherMove) gameState.activeTweens.witherMove.stop();
        TWEEN.removeAll();

        // 2. Setup HUD
        updateHUD();

        // 3. Switch Screen (and Background via helper)
        switchScreen('game');
        
        // 4. Initialize 3D Scene
        initThreeJS();

        // Fade Out Overlay
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');

        // 5. Start Game Flow (After fade out completes roughly)
        setTimeout(() => {
            startRoundSequence();
        }, 1000); // Wait for fade out (1s)

    }, 3500);
}

function updateHUD() {
    // 0. Determine Heart Textures based on Difficulty
    let fullHeartSrc = 'images/gui/full_heart.png';
    let halfHeartSrc = 'images/gui/half_heart.png';

    if (gameState.selectedDifficulty === 'HARDCORE') {
        fullHeartSrc = 'images/gui/full_hardcore_heart.png';
        halfHeartSrc = 'images/gui/half_hardcore_heart.png';
    }

    // 1. Absorption Hearts (New Row)
    const absorptionContainer = document.getElementById('absorption-container');
    absorptionContainer.innerHTML = '';

    const currentAbs = Math.max(0, gameState.absorptionHP);
    // Display logic: only show if > 0. But to keep layout consistent if needed?
    // Requirement: "Render the exact amount of absorption health using full/half textures."
    
    if (currentAbs > 0) {
        // We render as many hearts as needed.
        // Each heart represents 2 HP.
        // Ceiling of (currentAbs / 2) is number of hearts.
        const numAbsHearts = Math.ceil(currentAbs / 2);
        
        for (let i = 0; i < numAbsHearts; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative w-6 h-6 md:w-8 md:h-8'; 

            // Calculate HP value for this specific heart slot
            // Slot 0 covers 1-2 HP. Slot 1 covers 3-4 HP.
            // slotMin = i * 2.
            const slotMin = i * 2;
            
            // Background is NOT standard empty heart for absorption usually?
            // Reference: "full_golden_heart.png" overlaying "empty_heart_slot.png" or just transparent?
            // Minecraft logic: Absorption hearts usually don't have empty backgrounds when missing, they just vanish.
            // BUT for the ones present, they might sit on nothing?
            // The memory says "health HUD uses a discrete layered CSS approach where full_heart.png images overlay empty_heart_slot.png backgrounds."
            // But for absorption, if we have 2.5 hearts (5HP), we show 2 full and 1 half. We don't show empty slots for potential 8 hearts.
            
            // Requirement says: "Render the exact amount of absorption health"
            // So we just render the active hearts.
            
            // However, to match the style, maybe we don't need background for absorption?
            // Or maybe we do? Let's assume standard behavior: No empty slots for absorption, just the golden hearts.
            
            // Background (Empty Slot) - added as per user request
            const bgImg = document.createElement('img');
            bgImg.src = 'images/gui/empty_heart_slot.png';
            bgImg.className = 'absolute top-0 left-0 w-full h-full';
            wrapper.appendChild(bgImg);

            const fgImg = document.createElement('img');
            fgImg.className = 'absolute top-0 left-0 w-full h-full';
            
            if (currentAbs >= slotMin + 2) {
                fgImg.src = 'images/gui/full_golden_heart.png';
            } else {
                fgImg.src = 'images/gui/half_golden_heart.png';
            }
            wrapper.appendChild(fgImg);
            absorptionContainer.appendChild(wrapper);
        }
    }

    // 2. Red Hearts (Layered Logic)
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';

    const maxHP = 20; // 10 Hearts visual
    const currentHP = Math.max(0, gameState.playerHP);

    for (let i = 0; i < maxHP; i += 2) {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative w-6 h-6 md:w-8 md:h-8'; // Responsive Tailwind sizing

        // Background (Empty)
        const bgImg = document.createElement('img');
        bgImg.src = 'images/gui/empty_heart_slot.png';
        bgImg.className = 'absolute top-0 left-0 w-full h-full';
        wrapper.appendChild(bgImg);

        // Foreground (Full or Half)
        if (currentHP > i) {
            const fgImg = document.createElement('img');
            fgImg.className = 'absolute top-0 left-0 w-full h-full';
            if (currentHP > i + 1) {
                fgImg.src = fullHeartSrc;
            } else {
                fgImg.src = halfHeartSrc;
            }
            wrapper.appendChild(fgImg);
        }

        heartsContainer.appendChild(wrapper);
    }

    // 3. Armor
    const armorContainer = document.getElementById('armor-container');
    armorContainer.innerHTML = '';
    let armorValue = 0;
    const diff = gameState.selectedDifficulty;
    if (diff === 'EASY') armorValue = 20;
    else if (diff === 'NORMAL') armorValue = 15;
    else if (diff === 'HARD') armorValue = 10;
    else armorValue = 0;

    for (let i = 0; i < 20; i += 2) {
        const armorImg = document.createElement('img');
        armorImg.className = 'w-6 h-6 md:w-8 md:h-8'; // Responsive Tailwind sizing
        if (armorValue > i + 1) {
            armorImg.src = 'images/gui/full_armor_slot.png';
        } else if (armorValue > i) {
            armorImg.src = 'images/gui/half_armor_slot.png';
        } else {
            armorImg.src = 'images/gui/empty_armor_slot.png';
        }
        armorContainer.appendChild(armorImg);
    }

    // 3. Boss Bar
    const bossPercent = (gameState.bossHP / CONFIG.INITIAL_BOSS_HP) * 100;
    const cropDiv = document.getElementById('boss-health-crop');
    cropDiv.style.width = `${bossPercent}%`;

    // 4. Consumable
    const gapple = document.getElementById('consumable-container');
    
    // Check if we have apples remaining
    if (gameState.gapplesRemaining <= 0) {
        gapple.classList.add('hidden');
    } else {
        gapple.classList.remove('hidden');
    }
}

document.getElementById('consumable-container').addEventListener('click', () => {
    if (gameState.gapplesRemaining > 0 && gameState.playerHP > 0) {
        // Absorption Logic: Add 4 HP (2 Hearts)
        // Check Max Limit
        if (gameState.absorptionHP < CONFIG.MAX_ABSORPTION_HP) {
            gameState.absorptionHP = Math.min(CONFIG.MAX_ABSORPTION_HP, gameState.absorptionHP + CONFIG.GAPPLE_HEAL);
            gameState.gapplesRemaining--;
            playSound('gapple_eat');
            updateHUD();
        }
    }
});


// --- GAME LOGIC FLOW ---

function startRoundSequence() {
    // Clear any potentially lingering timers
    clearAllTimers();

    if (gameState.playerHP <= 0 || gameState.bossHP <= 0) return;

    gameState.isAnswering = false; // Reset input lock

    // Step 1: Countdown
    const countdown = document.getElementById('countdown-display');
    const questionBox = document.getElementById('question-box');

    countdown.classList.remove('hidden');
    // Tailwind Slide Up: Remove the translate reset class if it exists (translate-y-0), add off-screen class (translate-y-full)
    questionBox.classList.remove('translate-y-0');
    questionBox.classList.add('translate-y-full');
    // We don't use 'hidden' for the box during animation phases, we use translate.
    // However, if we want it completely gone during countdown, we can keep hidden.
    // But for the slide effect, it must be visible (display:block) but off-screen.
    // Current HTML has 'translate-y-full'.

    let count = 3;
    countdown.innerText = count;

    gameState.timers.countdown = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.innerText = count;
        } else {
            if(gameState.timers.countdown) clearInterval(gameState.timers.countdown);
            countdown.classList.add('hidden');
            // Step 2: Slide Up Question
            // Tiny delay to ensure countdown is fully hidden before slide starts (visual polish)
            setTimeout(() => {
                slideUpQuestion();
            }, 100);
        }
    }, 1000);
}

function slideUpQuestion() {
    const questionBox = document.getElementById('question-box');

    // Get Question
    if (gameState.questionPool.length === 0) {
        gameState.questionPool = [...gameState.selectedQuest.questions].sort(() => Math.random() - 0.5);
    }
    const qData = gameState.questionPool.pop();

    document.getElementById('question-text').innerText = qData.question;
    const ansContainer = document.getElementById('answers-container');
    ansContainer.innerHTML = '';

    qData.answers.forEach((ans, index) => {
        const btn = document.createElement('button');
        // New Tailwind Button Classes
        btn.className = 'w-full p-4 bg-zinc-800 border-2 border-zinc-600 text-white text-lg rounded-sm hover:bg-zinc-700 hover:border-yellow-400 transition-colors shadow-md text-left';
        btn.innerText = ans;
        // Step 3: Wait for Input
        btn.onclick = () => handleAnswer(index, qData.correct, btn);
        ansContainer.appendChild(btn);
    });

    // Remove 'translate-y-full' to let it slide to 'translate-y-0' (default or implied by removal)
    // Actually, we need to ensure 'translate-y-0' is added if 'translate-y-full' is removed, OR rely on default position.
    // The CSS transition handles the movement.
    questionBox.classList.remove('translate-y-full');
    questionBox.classList.add('translate-y-0');
}

function handleAnswer(selectedIndex, correctIndex, btnElement) {
    if (gameState.isAnswering) return; // Spam prevention
    gameState.isAnswering = true; // Step 4: Lock Input

    // Immediate Feedback Overlay
    showFeedback(selectedIndex === correctIndex);

    // Visual Feedback: Tailwind classes
    // btnElement.classList.add('selected'); -> became:
    btnElement.classList.remove('border-zinc-600');
    btnElement.classList.add('border-yellow-400', 'bg-zinc-700', 'ring-2', 'ring-yellow-200');

    // Disable all buttons
    const ansContainer = document.getElementById('answers-container');
    const allBtns = ansContainer.querySelectorAll('button');

    // If Wrong Answer, Highlight Correct One Green
    if (selectedIndex !== correctIndex) {
        const correctBtn = allBtns[correctIndex];
        if (correctBtn) {
            correctBtn.classList.remove('border-zinc-600');
            correctBtn.classList.add('border-green-500', 'bg-zinc-700', 'ring-2', 'ring-green-400');
        }
    }

    allBtns.forEach((b, index) => {
        b.disabled = true;
        b.classList.add('cursor-not-allowed');

        // Apply opacity-80 to all buttons EXCEPT the correct answer when the user was wrong.
        // (If the user was correct, the selected button—which is correct—gets opacity-80 as per original behavior).
        if (selectedIndex !== correctIndex && index === correctIndex) {
            // Keep full opacity for the correct answer to make it stand out
        } else {
            b.classList.add('opacity-80');
        }
    });

    // Step 5: Slide Down (after brief delay for visual feedback)
    gameState.timers.slideDownDelay = setTimeout(() => {
        const questionBox = document.getElementById('question-box');
        // Slide down
        questionBox.classList.remove('translate-y-0');
        questionBox.classList.add('translate-y-full');

        // Step 6: Trigger Combat Animation
        // Wait for CSS transition (500ms) before triggering combat
        gameState.timers.combatTriggerDelay = setTimeout(() => {
            if (selectedIndex === correctIndex) {
                // Player Hits Boss
                performPlayerAttack();
            } else {
                // Boss Hits Player
                performBossAttack();
            }
        }, 500);
    }, 500);
}

function performPlayerAttack() {
    swingSword(); // 3D Anim

    // Play Sound with Delay (200ms)
    setTimeout(() => {
        playSound('witherhurt');
    }, 20);

    // Logic update
    const dmg = CONFIG.DIFFICULTY[gameState.selectedDifficulty].playerDamage;
    gameState.bossHP = Math.max(0, gameState.bossHP - dmg);

    // Wither Shake (No red tint, just shake)
    shakeBlock();

    updateHUD();

    // Step 7: Cooldown (Wait for animation to finish roughly before starting wait)
    // Sword swing is ~400ms. Shake is ~350ms.
    gameState.timers.combatTriggerDelay = setTimeout(() => {
        startCooldown(checkWinCondition);
    }, 500);
}

function performBossAttack() {
    // 3D Anim (Lunge + Shoot + Camera Shake)
    blockAttackAnimation();

    // Play Sound with Delay (200ms)
    setTimeout(() => {
        playSound('hurt');
    }, 20);

    // Logic update
    let dmg = CONFIG.DIFFICULTY[gameState.selectedDifficulty].bossDamage;
    
    // Absorption Damage First
    if (gameState.absorptionHP > 0) {
        if (dmg <= gameState.absorptionHP) {
            gameState.absorptionHP -= dmg;
            dmg = 0;
        } else {
            dmg -= gameState.absorptionHP;
            gameState.absorptionHP = 0;
        }
    }

    // Remaining Damage to Player
    if (dmg > 0) {
        gameState.playerHP = Math.max(0, gameState.playerHP - dmg);
    }

    updateHUD();

    // Step 7: Cooldown (Wait for animation to finish roughly)
    // Lunge return is 500ms total (100+400).
    gameState.timers.combatTriggerDelay = setTimeout(() => {
        startCooldown(checkLoseCondition);
    }, 600);
}

function startCooldown(callback) {
    // Step 7: Wait 2 seconds
    gameState.timers.cooldown = setTimeout(() => {
        callback();
    }, 2000);
}

function checkWinCondition() {
    if (gameState.bossHP <= 0) {
        showGameOver(true);
    } else {
        // Step 8: Loop
        startRoundSequence();
    }
}

function checkLoseCondition() {
    if (gameState.playerHP <= 0) {
        showGameOver(false);
    } else {
        // Step 8: Loop
        startRoundSequence();
    }
}

function showGameOver(win) {
    clearAllTimers(); // Stop loop

    // Fade Out (to Black)
    const overlay = document.getElementById('transition-overlay');
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');

    // Wait for fade (1s), then switch screen and fade in
    setTimeout(() => {
        switchScreen('gameOver');
        const title = document.getElementById('game-over-title');
        title.innerText = win ? "YOU WIN!" : "YOU DIED!";
        title.style.color = win ? "#55FF55" : "#FF5555";

        // Fade In (reveal Game Over screen)
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
    }, 1000);
}


// --- THREE.JS LOGIC (Strict Reference Adherence) ---

// Constants from reference
const swordScale = new THREE.Vector3(0.05, 0.05, 0.05);
const restPosition = new THREE.Vector3(1.5, -1, -2);
const restRotation = new THREE.Euler(2.2, 0, 1.6);
const attackPosition = new THREE.Vector3(1.2, -1.2, -3.5);
const attackRotation = new THREE.Euler(2, 0, 1.5);

const witherScale = new THREE.Vector3(1.5, 1.5, 1.5);
const witherOriginalPos = new THREE.Vector3(0, -2, -3.5);
const witherOriginalRot = new THREE.Euler(0, Math.PI, 0);

function initThreeJS() {
    if (!gameState.scene) {
        gameState.scene = new THREE.Scene();
        gameState.scene.background = new THREE.Color(0x87ceeb);

        gameState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        gameState.scene.add(gameState.camera);

        const canvas = document.getElementById('gameCanvas');
        gameState.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        gameState.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 7.5);
        gameState.scene.add(directionalLight);

        window.addEventListener('resize', onWindowResize);

        requestAnimationFrame(animate3D);
    } else {
        // Reset Scene Objects
        if (gameState.witherModel) gameState.scene.remove(gameState.witherModel);
        if (gameState.swordModel) gameState.camera.remove(gameState.swordModel);
        gameState.witherModel = null;
        gameState.swordModel = null;
        gameState.mixer = null;
    }

    loadWither();
    loadSword();
}

function loadWither() {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('3d/wither/witherBoss.gltf', (gltf) => {
        gameState.witherModel = gltf.scene;
        const modelAnimations = gltf.animations;

        gameState.witherModel.scale.copy(witherScale);
        gameState.witherModel.position.copy(witherOriginalPos);
        gameState.witherModel.rotation.copy(witherOriginalRot);

        // Cloning materials as per reference (good practice)
        gameState.witherModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat, index) => {
                        child.material[index] = mat.clone();
                    });
                } else {
                    child.material = child.material.clone();
                }
            }
        });

        gameState.scene.add(gameState.witherModel);

        gameState.mixer = new THREE.AnimationMixer(gameState.witherModel);

        const idleAnim = THREE.AnimationClip.findByName(modelAnimations, 'animation.witherBoss.new');
        const shootAnim = THREE.AnimationClip.findByName(modelAnimations, 'animation.witherBoss.shoot');

        if (idleAnim) {
            gameState.idleAction = gameState.mixer.clipAction(idleAnim);
            gameState.idleAction.play();
        }

        if (shootAnim) {
            gameState.shootAction = gameState.mixer.clipAction(shootAnim);
            gameState.shootAction.setLoop(THREE.LoopOnce);
            gameState.shootAction.clampWhenFinished = false;
        }

    }, undefined, (error) => console.error("Wither Load Error:", error));
}

function loadSword() {
    // TODO: Implement Iron Sword loading logic for HARD/HARDCORE difficulties later.
    // Currently forcing Diamond Sword for all difficulties as per user instruction.

    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('3d/diamondsword/diamondsword.mtl', (materials) => {
        materials.preload();
        Object.values(materials.materials).forEach(material => {
            material.depthTest = false;
        });

        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('3d/diamondsword/diamondsword.obj', (object) => {
            gameState.swordModel = object;
            gameState.camera.add(gameState.swordModel);
            gameState.swordModel.position.copy(restPosition);
            gameState.swordModel.rotation.copy(restRotation);
            gameState.swordModel.scale.copy(swordScale);
        }, undefined, (error) => console.error("OBJ Load Error:", error));
    });
}

// --- ANIMATION FUNCTIONS (Ported from Reference) ---

function swingSword() {
    if (!gameState.swordModel) return;

    // TWEENs
    const swingPosTween = new TWEEN.Tween(gameState.swordModel.position)
        .to(attackPosition, 100)
        .easing(TWEEN.Easing.Quadratic.Out);
    const swingRotTween = new TWEEN.Tween(gameState.swordModel.rotation)
        .to(attackRotation, 100)
        .easing(TWEEN.Easing.Quadratic.Out);

    const returnPosTween = new TWEEN.Tween(gameState.swordModel.position)
        .to(restPosition, 300)
        .easing(TWEEN.Easing.Quadratic.In);
    const returnRotTween = new TWEEN.Tween(gameState.swordModel.rotation)
        .to(restRotation, 300)
        .easing(TWEEN.Easing.Quadratic.In);

    swingPosTween.chain(returnPosTween);
    swingRotTween.chain(returnRotTween);

    swingPosTween.start();
    swingRotTween.start();
}

function shakeBlock() {
    if (!gameState.witherModel) return;

    if (gameState.activeTweens.witherMove) {
        gameState.activeTweens.witherMove.stop();
    }

    const startPos = witherOriginalPos.clone();
    const shakePos = startPos.clone().add(new THREE.Vector3(0.2, 0.2, 0));

    gameState.witherModel.position.copy(startPos);

    const shakeTween = new TWEEN.Tween(gameState.witherModel.position)
        .to(shakePos, 50)
        .easing(TWEEN.Easing.Quadratic.Out);

    const returnTween = new TWEEN.Tween(gameState.witherModel.position)
        .to(startPos, 300)
        .easing(TWEEN.Easing.Bounce.Out)
        .onComplete(() => {
            gameState.activeTweens.witherMove = null;
        });

    shakeTween.chain(returnTween);
    gameState.activeTweens.witherMove = shakeTween;
    shakeTween.start();
}

function blockAttackAnimation() {
    if (!gameState.witherModel) return;

    showDamageFlash();
    shakeCamera();

    // 1. Wither's GLTF Animation
    if (gameState.shootAction && gameState.idleAction) {
        gameState.shootAction.stop().play();
        gameState.idleAction.crossFadeTo(gameState.shootAction, 0.2, true);

        // Reduced from 4000ms to 2500ms to ensure it completes before the 3000ms cooldown ends.
        // This prevents clearAllTimers() from killing the reset logic when the next round starts.
        gameState.timers.animReset = setTimeout(() => {
            if (gameState.shootAction && gameState.idleAction) {
                gameState.shootAction.fadeOut(0.5);
                gameState.idleAction.reset().play();
                gameState.idleAction.fadeIn(0.5);
            }
        }, 2500);
    }

    // 2. Wither's Lunge Tween
    const attackPos = witherOriginalPos.clone().add(new THREE.Vector3(0, 0, 3.5));

    if (gameState.activeTweens.witherMove) {
        gameState.activeTweens.witherMove.stop();
    }

    const lungeTween = new TWEEN.Tween(gameState.witherModel.position)
        .to(attackPos, 100)
        .easing(TWEEN.Easing.Quadratic.Out);

    const returnTween = new TWEEN.Tween(gameState.witherModel.position)
        .to(witherOriginalPos, 400)
        .easing(TWEEN.Easing.Bounce.Out)
        .onComplete(() => {
            gameState.activeTweens.witherMove = null;
        });

    lungeTween.chain(returnTween);
    gameState.activeTweens.witherMove = lungeTween;
    lungeTween.start();
}

function shakeCamera() {
    const shakeIntensity = 0.05;
    const duration = 75;

    const target = gameState.camera;
    const originalPos = new THREE.Vector3(0, 0, 0); // Camera is at 0,0,0 initially

    if (gameState.activeTweens.cameraShake) {
        gameState.activeTweens.cameraShake.stop();
    }

    const shakePos = new TWEEN.Tween(target.position)
        .to({
            x: originalPos.x + (Math.random() - 0.5) * shakeIntensity,
            y: originalPos.y + (Math.random() - 0.5) * shakeIntensity,
            z: originalPos.z
        }, duration)
        .easing(TWEEN.Easing.Quadratic.Out);

    const returnPos = new TWEEN.Tween(target.position)
        .to(originalPos, duration)
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(() => {
            gameState.activeTweens.cameraShake = null;
        });

    shakePos.chain(returnPos);
    gameState.activeTweens.cameraShake = shakePos;
    shakePos.start();
}

function showDamageFlash() {
    const flash = document.getElementById('damage-flash');
    // Using Tailwind hidden toggle
    flash.classList.remove('hidden');
    gameState.timers.flashReset = setTimeout(() => {
        flash.classList.add('hidden');
    }, 150);
}

function animate3D() {
    requestAnimationFrame(animate3D);

    const delta = clock.getDelta();
    if (gameState.mixer) {
        gameState.mixer.update(delta);
    }

    TWEEN.update();
    if (gameState.renderer && gameState.scene && gameState.camera) {
        gameState.renderer.render(gameState.scene, gameState.camera);
    }
}

function onWindowResize() {
    if (gameState.camera && gameState.renderer) {
        gameState.camera.aspect = window.innerWidth / window.innerHeight;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
