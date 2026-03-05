<<<<<<< HEAD
# 🐂 Jallikattu Survival Game

A 3D survival arena game inspired by the traditional Tamil sport Jallikattu. The player controls a human character trapped inside an arena with an aggressive bull. The objective is simple: survive as long as possible without getting caught.

The game features advanced bull AI behavior, multiple human NPCs trying to escape, realistic animations, and an immersive arena environment.

---

## 🎮 Gameplay

In this survival game, the player must run, dodge, and avoid the charging bull while trying to survive for 60 seconds.

The bull dynamically targets nearby humans and aggressively charges toward them. AI-controlled humans also run inside the arena trying to escape the bull, creating chaotic and unpredictable gameplay.

If the bull catches the player, the game ends.

---

## 🚀 Features

### Core Gameplay
- Player movement using WASD or Arrow Keys
- Sprint mechanic using Shift
- Survival objective (stay alive for 60 seconds)
- Catch detection when the bull gets too close
- Real-time survival scoring system

### Advanced Bull AI
- Dynamic target selection
- Multiple behavior states:
  - Idle
  - Walking
  - Running
  - Charging
  - Attacking
- Special bull actions:
  - Back kick attack
  - Aggressive charge
  - Shake-off maneuver to remove attached humans
- Intelligent target switching between player and NPC humans

### AI Human System
- Autonomous NPC humans inside the arena
- Humans automatically run away from the bull
- NPCs can be caught by the bull and attached

### 3D Environment
- Circular arena with fences
- Ground textures and terrain
- Dust particle effects
- Atmospheric fog
- Dynamic lighting and shadows

### Character Animations

Bull Animations:
- Idle
- Walk
- Run
- Charge
- Attack
- Back Kick
- Shake Off

Human Animations:
- Entry
- Idle
- Jog
- Run
- Caught / Dying

---

## 🖥 UI System

Menu Screen
- Game title
- Controls guide
- Start button

In-Game HUD
- Survival timer
- Humans caught counter

Game Over Screen
- Win or caught result
- Final survival time

---

## 🔊 Audio System

- Ambient arena sounds
- Footstep sounds
- Bull charge sound effects
- Crowd reactions
- Game over sound

---

## ⚙️ Technology Used

- React Three Fiber
- Three.js
- GLB / FBX animated models
- Tailwind CSS
- SkeletonUtils for optimized character cloning

---

## 🎥 Camera System

The game uses a dynamic follow camera that tracks the bull's movement to create a cinematic gameplay experience.

---

## 📈 Future Improvements

- Multiplayer arena mode
- Multiple bull types
- Larger arenas
- Ragdoll physics
- Crowd simulation
- Power-ups and player abilities

---

## 🎯 Objective

Survive the arena, avoid the bull, and stay alive as long as possible.

Can you escape the bull?
=======
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
>>>>>>> c39cc0e (Enhancement: Added Professional Bull AI, Player Stamina, Dodge, Cinematic Death Sequence, and 300+ Animated Audience with responsive audio.)
