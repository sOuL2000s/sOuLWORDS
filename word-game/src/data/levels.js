export const LEVELS = [
  {
    letters: ["A", "C", "T"],
    answers: ["CAT", "ACT"],
    grid: [
      [{ char: "C", id: "0-0" }, { char: "A", id: "0-1" }, { char: "T", id: "0-2" }],
      [{ char: null }, { char: "C", id: "1-1" }, { char: null }],
      [{ char: null }, { char: "T", id: "2-1" }, { char: null }],
    ]
  },
  {
    letters: ["O", "G", "D"],
    answers: ["DOG", "GOD"],
    grid: [
      [{ char: "D", id: "0-0" }, { char: "O", id: "0-1" }, { char: "G", id: "0-2" }],
      [{ char: "O", id: "1-0" }, { char: null }, { char: null }],
      [{ char: "G", id: "2-0" }, { char: null }, { char: null }],
    ]
  }
];