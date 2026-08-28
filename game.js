const STORY_DATA = {
    "start": {
        bg: "bg_palace_balcony_night.jpg",
        music: "music_lanterns_midnight.mp3",
        dialogue: [
            { speaker: "Narration", text: "Every kingdom keeps a secret. Noorabad kept one beneath the light." },
            { speaker: "Narration", text: "The Festival of a Thousand Lanterns has begun, yet the air feels heavy." }
        ],
        next: "chapter1_intro"
    },
    "chapter1_intro": {
        bg: "bg_palace_balcony_night.jpg",
        chars: { left: "char_amara_worried.png" },
        dialogue: [
            { speaker: "Amara", text: "The sky is beautiful, but I cannot shake this feeling of dread..." },
            { speaker: "Narration", text: "A sudden gust of wind carries a glowing letter to your feet. It is from Prince Armaan." }
        ],
        choices: [
            { text: "Open the letter immediately.", next: "trust_armaan", effects: { armaanTrust: 2 } },
            { text: "Hide the letter.", next: "summon_mira", effects: { suspicion: 1 } }
        ]
    },
    "trust_armaan": {
        bg: "bg_palace_balcony_night.jpg",
        chars: { left: "char_amara_determined.png" },
        dialogue: [
            { speaker: "Amara", text: "I must know what he says. 'Amara, the Moon Throne is in danger...'" }
        ],
        next: "chapter2_start"
    },
    "summon_mira": {
        bg: "bg_amara_chamber.jpg",
        chars: { left: "char_amara_worried.png", right: "char_mira_neutral.png" },
        dialogue: [
            { speaker: "Mira", text: "Princess? You look like you've seen a ghost." }
        ],
        next: "chapter2_start"
    },
    "chapter2_start": {
        bg: "bg_palace_corridor.jpg",
        chars: { right: "char_farid_smiling.png" },
        dialogue: [
            { speaker: "General Farid", text: "Princess. Wandering the halls alone? The King is asking for you." }
        ],
        next: "start" // Loop for demo
    }
};

class GameEngine {
    constructor() {
        this.state = { currentScene: "start", variables: {}, history: [], isTyping: false };
        this.currentDialogueIndex = 0;
        this.audio = new Audio();
    }

    init() {
        document.getElementById('main-menu').classList.remove('hidden');
    }

    startNewGame() {
        ui.transitionToGame();
        this.renderScene("start");
    }

    renderScene(sceneId) {
        const scene = STORY_DATA[sceneId];
        this.state.currentScene = sceneId;
        this.currentDialogueIndex = 0;
        
        if (scene.bg) ui.updateBackground(scene.bg);
        if (scene.music) this.playMusic(scene.music);
        ui.updateCharacters(scene.chars || {});
        this.showDialogue();
    }

    playMusic(file) {
        this.audio.src = `assets/${file}`;
        this.audio.loop = true;
        this.audio.play().catch(e => console.log("Audio play blocked"));
    }

    showDialogue() {
        const scene = STORY_DATA[this.state.currentScene];
        const dialogue = scene.dialogue[this.currentDialogueIndex];
        ui.setSpeaker(dialogue.speaker);
        ui.typeText(dialogue.text);
    }

    advance() {
        if (this.state.isTyping) {
            ui.skipTypewriter();
            return;
        }
        const scene = STORY_DATA[this.state.currentScene];
        if (this.currentDialogueIndex < scene.dialogue.length - 1) {
            this.currentDialogueIndex++;
            this.showDialogue();
        } else if (scene.choices) {
            ui.showChoices(scene.choices);
        } else if (scene.next) {
            this.renderScene(scene.next);
        }
    }

    handleChoice(index) {
        const scene = STORY_DATA[this.state.currentScene];
        const choice = scene.choices[index];
        ui.hideChoices();
        this.renderScene(choice.next);
    }
}

const ui = {
    typeInterval: null,
    transitionToGame() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-view').classList.remove('hidden');
    },
    updateBackground(file) {
        document.getElementById('background-layer').style.backgroundImage = `url('assets/${file}')`;
    },
    updateCharacters(chars) {
        const left = document.getElementById('char-left');
        const right = document.getElementById('char-right');
        left.style.backgroundImage = chars.left ? `url('assets/${chars.left}')` : 'none';
        right.style.backgroundImage = chars.right ? `url('assets/${chars.right}')` : 'none';
    },
    setSpeaker(name) {
        document.getElementById('speaker-name').innerText = name === "Narration" ? "" : name;
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
        }, 30);
    },
    skipTypewriter() {
        clearInterval(this.typeInterval);
        const scene = STORY_DATA[game.state.currentScene];
        document.getElementById('dialogue-text').innerText = scene.dialogue[game.currentDialogueIndex].text;
        game.state.isTyping = false;
    },
    showChoices(choices) {
        const container = document.getElementById('choice-container');
        container.innerHTML = "";
        container.classList.remove('hidden');
        choices.forEach((c, i) => {
            const b = document.createElement('button');
            b.className = 'choice-btn';
            b.innerText = c.text;
            b.onclick = () => game.handleChoice(i);
            container.appendChild(b);
        });
    },
    hideChoices() { document.getElementById('choice-container').classList.add('hidden'); },
    toggleMenu(id) { document.getElementById(id).classList.toggle('hidden'); }
};

const game = new GameEngine();
window.onload = () => game.init();
document.getElementById('dialogue-box').onclick = () => game.advance();
