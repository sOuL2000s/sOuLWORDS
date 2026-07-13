Wordscapes – Build words from a circle of letters to fill a crossword.

make a game website like this using vite, express, node, react, mongodb, serverless function, vercel.

Yes. A game like **Wordscapes** is very achievable with the stack you've chosen.

The game itself is actually much simpler than it looks. The difficulty is in **creating thousands of puzzles**, not in the gameplay.

## Tech Stack

```
Frontend
├── React + Vite
├── React Router
├── Zustand / Redux
├── Framer Motion
├── Canvas or SVG
└── Tailwind CSS

Backend
├── Node.js
├── Express
├── MongoDB
├── JWT Authentication
└── Vercel Serverless Functions

Deployment
├── Vercel (Frontend)
├── Vercel Functions (API)
└── MongoDB Atlas
```

---

# Project Structure

```
word-game/

client/
    src/
        components/
        pages/
        hooks/
        utils/
        store/
        assets/

server/
    api/
        levels.js
        game.js
        auth.js
        leaderboard.js
    models/
        User.js
        Level.js
    lib/
        mongodb.js

shared/
    dictionary/
        words.json

package.json
vercel.json
```

---

# Main Game Components

```
<App>

    Home

    Game

        Crossword Grid

        Letter Circle

        Draw Path

        Hint Button

        Shuffle Button

        Progress

        Coin Counter

        Win Popup
```

---

# Database Design

## Users

```js
{
    _id,
    username,
    coins: 500,
    currentLevel: 24,
    completedLevels: [],
    hints: 3,
    createdAt
}
```

---

## Levels

```js
{
    level: 1,

    letters: ["C","A","T"],

    answers:[
        "CAT",
        "ACT"
    ],

    board:[
        ["","C","",""],
        ["A","A","T"],
        ["","T","",""]
    ]
}
```

---

# How Gameplay Works

Imagine level:

```
Letters

A
T
C
```

Possible words

```
CAT
ACT
AT
```

Board

```
C A T

A

T
```

Player drags

```
C -> A -> T
```

Game checks

```js
if(answer === "CAT"){
    revealWord();
}
```

---

# React State

```js
const game = {

letters:[],

selectedLetters:[],

foundWords:[],

coins:200,

level:10,

board:[]

}
```

---

# Letter Circle

Use SVG.

```
       A

  T         C

       O
```

Each letter has

```js
{
id:1,

letter:"A",

x:120,

y:40
}
```

Render

```jsx
<circle />

<text>A</text>
```

---

# Drag System

When mouse enters another letter

```
Mouse Down

↓

Track Mouse

↓

Highlight Letter

↓

Draw Line

↓

Mouse Up

↓

Check Word
```

---

State

```js
selected =

[
"C",
"A",
"T"
]
```

Join

```js
selected.join("")
```

Result

```
CAT
```

---

# Drawing Lines

Store path

```js
[
{x:20,y:40},

{x:60,y:90},

{x:120,y:30}
]
```

Render

```jsx
<polyline />
```

or

```
Canvas
```

---

# Crossword Grid

Board

```
[
["C","A","T"],

["","A",""],

["","T",""]
]
```

Hidden

```
□ □ □

□

□
```

Reveal

```
C A T

A

T
```

---

# Hint System

Choose one hidden letter

```
Reveal

↓

Deduct coins

↓

Update board
```

---

# Shuffle

Only shuffle the letter positions.

```
CATAO

↓

ACTOA
```

Words remain unchanged.

---

# Level Complete

Check

```
foundWords.length === answers.length
```

Then

```
Coins +50

Animation

Next Level
```

---

# Backend APIs

```
GET
/api/level/1

POST
/api/check

POST
/api/save

GET
/api/profile

POST
/api/hint
```

---

# Example Level API

```json
{
    "letters":[
        "C",
        "A",
        "T"
    ],

    "answers":[
        "CAT",
        "ACT"
    ],

    "board":[
        ...
    ]
}
```

---

# Express Example

```js
app.get("/api/level/:id", async(req,res)=>{

const level = await Level.findOne({
level:req.params.id
})

res.json(level)

})
```

---

# MongoDB

Store

```
Users

Levels

Leaderboard

Achievements
```

---

# Serverless Functions

Instead of Express routes

```
api/

level.js

profile.js

login.js

save.js

hint.js
```

Example

```js
export default async function(req,res){

const level = await db.collection("levels")
.findOne({level:1})

res.json(level)

}
```

Deploy directly on Vercel.

---

# Animations

Use

```
Framer Motion
```

Animations

* Tile pop
* Coin fly
* Level complete
* Confetti
* Word glow
* Letter scaling
* Shake on wrong word

---

# Sound Effects

```
tap.mp3

correct.mp3

wrong.mp3

shuffle.mp3

win.mp3
```

---

# Puzzle Generation

This is the hardest part.

A typical pipeline is:

```
Dictionary

↓

Choose root word

↓

Find all valid subwords

↓

Filter by length

↓

Generate crossword layout

↓

Save to MongoDB
```

Example

```
MASTER

↓

TEAM

MEAT

RATE

TEAR

STAR

STREAM

ARM

ART

SEA

EAT

...
```

You can generate levels offline with a Node.js script and store them in MongoDB.

---

# Extra Features

* Daily challenge
* Streak rewards
* Leaderboard
* Achievements
* Themes (Forest, Ocean, Desert)
* Offline play
* Guest mode
* Login with Google
* Cloud save
* Timed mode
* Multiplayer races
* Ads and rewarded hints (optional)
* Progressive Web App (PWA)

---

## Recommended Development Roadmap

1. Create the React + Vite project and set up Tailwind CSS.
2. Build the crossword grid component.
3. Build the circular letter wheel using SVG.
4. Implement drag selection and line drawing.
5. Validate selected words against the current level.
6. Reveal words on the grid with animations.
7. Add level progression and scoring.
8. Connect to MongoDB through Vercel Serverless Functions for saving progress.
9. Implement authentication and cloud save.
10. Polish with sounds, animations, hints, achievements, and responsive mobile support.

This project is an excellent intermediate-to-advanced full-stack application because it combines game logic, interactive UI, data persistence, and scalable serverless APIs. A polished version can comfortably reach **8,000–15,000 lines of code**, depending on the number of features and the sophistication of the puzzle generation system.

