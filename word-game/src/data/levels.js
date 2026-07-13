// This file now contains example hardcoded levels.
// For dynamic level generation from wordlist.js, refer to src/utils/levelGenerator.js

export const LEVELS = [
  {
    letters: ["A", "C", "T"],
    answers: ["CAT", "ACT"],
    grid: [
      [
        { char: "C", id: "0-0", words: [{ word: "CAT", pos: 0 }] },
        { char: "A", id: "0-1", words: [{ word: "CAT", pos: 1 }, { word: "ACT", pos: 0 }] },
        { char: "T", id: "0-2", words: [{ word: "CAT", pos: 2 }] }
      ],
      [
        { char: null },
        { char: "C", id: "1-1", words: [{ word: "ACT", pos: 1 }] },
        { char: null }
      ],
      [
        { char: null },
        { char: "T", id: "2-1", words: [{ word: "ACT", pos: 2 }] },
        { char: null }
      ],
    ]
  },
  {
    letters: ["O", "G", "D"],
    answers: ["DOG", "GOD"],
    grid: [
      [
        { char: "D", id: "0-0", words: [{ word: "DOG", pos: 0 }] },
        { char: "O", id: "0-1", words: [{ word: "DOG", pos: 1 }, { word: "GOD", pos: 1 }] },
        { char: "G", id: "0-2", words: [{ word: "DOG", pos: 2 }] }
      ],
      [
        { char: "O", id: "1-0", words: [{ word: "GOD", pos: 0 }] },
        { char: null },
        { char: null }
      ],
      [
        { char: "G", id: "2-0", words: [{ word: "GOD", pos: 2 }] },
        { char: null },
        { char: null }
      ],
    ]
  }
];