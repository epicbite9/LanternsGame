/**
 * LANTERNS OF THE ETERNAL KINGDOM
 * Core Game Engine
 */

const STORY_DATA = {
    "start": {
        bg: "palace_balcony_night",
        music: "lanterns_midnight",
        dialogue: [
            { speaker: "Narration", text: "Every kingdom keeps a secret. Noorabad kept one beneath the light." },
            { speaker: "Narration", text: "The Festival of a Thousand Lanterns has begun, yet the air feels heavy with more than just the scent of jasmine." }
        ],
        next: "chapter1_intro"
    },
    "chapter1_intro": {
        bg: "palace_balcony_night",
        chars: { left: "amara_worried" },
        dialogue: [
            { speaker: "Amara", text: "The sky is beautiful, but I cannot shake this feeling of dread..." },
            { speaker: "Narration", text: "A sudden gust of wind carries a glowing, enchanted letter to your feet. The seal belongs to Prince Armaan of Suryagarh." }
        ],
        choices: [
            { text: "Open the letter immediately.", next: "trust_armaan", effects: { armaanTrust: 2, romance: 1, clues: 1 } },
            { text: "Hide the letter and summon Mira.", next: "summon_mira", effects: { suspicion: 1, duty: 2, clues: 1 } },
            { text: "Burn the letter.", next: "burn_letter", effects: { armaanTrust: -2, romance: -2 } }
        ]
    },
    "trust_armaan": {
        bg: "palace_balcony_night",
        chars: { left: "amara_determined" },
        dialogue: [
            { speaker: "Amara", text: "I must know what he says. 'Amara, the Moon Throne is in danger. A viper strikes tonight within your own walls...'" },
            { speaker: "Amara", text: "He risks war just to warn me. I have to believe him." }
        ],
        next: "chapter2_start"
    },
    "summon_mira": {
        bg: "amara_chamber",
        chars: { left: "amara_worried", right: "mira_neutral" },
        dialogue: [
            { speaker: "Mira", text: "Princess? You look like you've seen a ghost. What is that parchment?" },
            { speaker: "Amara", text: "A warning, Mira. One that could change everything." }
        ],
        next: "chapter2_start"
    },
    "burn_letter": {
        bg: "palace_balcony_night",
        chars: { left: "amara_angry" },
        dialogue: [
            { speaker: "Amara", text: "Suryagarh has brought us nothing but pain. I will not be a pawn in another of Armaan's games." },
            { speaker: "Narration", text: "The letter turns to ash, but the feeling of being watched remains." }
        ],
        next: "chapter2_start"
    },
    "chapter2_start": {
        bg: "palace_corridor",
        chars: { right: "farid_smiling" },
        dialogue: [
            { speaker: "General Farid", text: "Princess. Wandering the halls alone on such a festive night? The King is asking for you." },
            { speaker: "Narration", text: "Farid's smile doesn't reach his eyes. There is a coldness there that matches the letter's warning." }
        ],
        choices: [
            { text: "Ask about the security of the North Gate.", next: "ch2_investigate", effects: { clues: 1, suspicion: 1 } },
            { text: "Politely excuse yourself.", next: "ch2_evade", effects: { duty: 1 } }
        ]
    },
    // ... Additional scenes would go here following the structure ...
    "ending_calculation": {
        logic: function(state) {
            if (state.clues >= 3 && state.armaanTrust >= 2) return "ending_eternal_bond";
            if (state.duty > 5) return "ending_sacrifice";
            if (state.suspicion > 4) return "ending_ashes";
            return "ending_lantern_no_flame";
        }
    },
    "ending_eternal_bond": {
        bg: "golden_tree_sanctuary",
        dialogue: [{ speaker: "Narration", text: "Together, you expose the General. The kingdoms unite under a new dawn." }],
        next: "main_menu"
    }
};

class GameEngine {
    constructor() {
        this.state = {
            currentScene: "start",
            variables: {
                amaraTrust: 0, armaanTrust: 0, romance: 0, 
                stability: 5, clues: 0, suspicion: 0, duty: 0
            },
            history: [],
            isTyping: false
        };
        this.textSpeed = 40;
    }

    init() {
        this.loadSettings();
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        
        // Input listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') this.advance();
            if (e.code === 'Escape') ui.toggleMenu('settings-menu');
        });
    }

    startNewGame() {
        this.state.currentScene = "start";
        this.state.variables = { amaraTrust: 0, armaanTrust: 0, romance: 0, stability: 5, clues: 0, suspicion: 0, duty: 0 };
        ui.transitionToGame();
        this.renderScene("start");
    }

    renderScene(sceneId) {
        const scene = STORY_DATA[sceneId];
        if (!scene) return;

        this.state.currentScene = sceneId;
        
        // Update Visuals
        if (scene.bg) ui.updateBackground(scene.bg);
        ui.updateCharacters(scene.chars || {});
        
        // Reset Dialogue
        this.currentDialogueIndex = 0;
        this.showDialogue();
    }

    showDialogue() {
        const scene = STORY_DATA[this.state.currentScene];
        const dialogue = scene.dialogue[this.currentDialogueIndex];
        
        ui.setSpeaker(dialogue.speaker);
        ui.typeText(dialogue.text);
        this.state.history.push(`${dialogue.speaker}: ${dialogue.text}`);
    }

    advance() {
        if (this.state.isTyping) {
            ui.skipTypewriter();
            return;
        }

        const scene = STORY_DATA[this.state.currentScene];
        
        // Advance within dialogue array
        if (this.currentDialogueIndex < scene.dialogue.length - 1) {
            this.currentDialogueIndex++;
            this.showDialogue();
        } 
        // Handle end of dialogue
        else if (scene.choices) {
            ui.showChoices(scene.choices);
        } else if (scene.next) {
            this.renderScene(scene.next);
        }
    }

    handleChoice(choiceIndex) {
        const scene = STORY_DATA[this.state.currentScene];
        const choice = scene.choices[choiceIndex];
        
        // Apply effects
        if (choice.effects) {
            for (let key in choice.effects) {
                this.state.variables[key] += choice.effects[key];
            }
        }

        ui.hideChoices();
        this.renderScene(choice.next);
    }

    saveGame(slot) {
        const saveData = {
            state: this.state,
            date: new Date().toLocaleString()
        };
        localStorage.setItem(`save_slot_${slot}`, JSON.stringify(saveData));
        ui.renderSaveSlots();
    }

    loadGame(slot) {
        const raw = localStorage.getItem(`save_slot_${slot}`);
        if (!raw) return;
        const saveData = JSON.parse(raw);
        this.state = saveData.state;
        ui.transitionToGame();
        this.renderScene(this.state.currentScene);
        ui.toggleMenu('saves-menu');
    }

    loadSettings() {
        const speed = localStorage.getItem('textSpeed');
        if (speed) this.textSpeed = parseInt(speed);
    }
}

const ui = {
    typeInterval: null,

    transitionToGame() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-view').classList.remove('hidden');
    },

    updateBackground(bgId) {
        const bg = document.getElementById('background-layer');
        // In a real app, this would be a URL. For now, we use a colored gradient placeholder.
        bg.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('assets/bg_${bgId}.jpg')`;
        // Fallback for missing images
        bg.style.backgroundColor = '#102B3F';
    },

    updateCharacters(chars) {
        const left = document.getElementById('char-left');
        const right = document.getElementById('char-right');
        
        left.style.backgroundImage = chars.left ? `url('assets/char_${chars.left}.png')` : 'none';
        right.style.backgroundImage = chars.right ? `url('assets/char_${chars.right}.png')` : 'none';
        
        // Logic for silhouettes or names if image fails
        left.textContent = chars.left ? '' : '';
    },

    setSpeaker(name) {
        const el = document.getElementById('speaker-name');
        el.innerText = name;
        el.style.display = (name === "Narration") ? "none" : "block";
    },

    typeText(text) {
        const el = document.getElementById('dialogue-text');
        el.innerText = "";
        game.state.isTyping = true;
        let i = 0;
        
        clearInterval(this.typeInterval);
        this.typeInterval = setInterval(() => {
            el.innerText += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(this.typeInterval);
                game.state.isTyping = false;
            }
        }, game.textSpeed);
    },

    skipTypewriter() {
        const scene = STORY_DATA[game.state.currentScene];
        const text = scene.dialogue[game.currentDialogueIndex].text;
        document.getElementById('dialogue-text').innerText = text;
        clearInterval(this.typeInterval);
        game.state.isTyping = false;
    },

    showChoices(choices) {
        const container = document.getElementById('choice-container');
        container.innerHTML = "";
        container.classList.remove('hidden');
        
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => game.handleChoice(index);
            container.appendChild(btn);
        });
    },

    hideChoices() {
        document.getElementById('choice-container').classList.add('hidden');
    },

    toggleMenu(id) {
        const el = document.getElementById(id);
        if (el.classList.contains('hidden')) {
            if (id === 'saves-menu') this.renderSaveSlots();
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    },

    renderSaveSlots() {
        const container = document.getElementById('save-slots');
        container.innerHTML = "";
        for (let i = 1; i <= 3; i++) {
            const slot = localStorage.getItem(`save_slot_${i}`);
            const div = document.createElement('div');
            div.className = 'save-slot';
            div.innerHTML = `
                <span>Slot ${i} - ${slot ? JSON.parse(slot).date : 'Empty'}</span>
                <button onclick="game.saveGame(${i})">Save</button>
                <button onclick="game.loadGame(${i})" ${!slot ? 'disabled' : ''}>Load</button>
            `;
            container.appendChild(div);
        }
    },

    toggleHistory() {
        const log = document.getElementById('history-log');
        const content = document.getElementById('history-content');
        content.innerHTML = game.state.history.join('<br><br>');
        log.classList.toggle('hidden');
    }
};

const game = new GameEngine();
window.onload = () => game.init();

// Add click listener to dialogue box
document.getElementById('dialogue-box').onclick = () => game.advance();
