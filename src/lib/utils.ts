// Generate a random room code
export function generateRoomCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Generate random username if none provided
export function generateUsername(): string {
  const adjectives = [
    "Quick",
    "Funny",
    "Smart",
    "Cool",
    "Super",
    "Happy",
    "Clever",
    "Swift",
  ];
  const animals = ["Fox", "Cat", "Dog", "Bird", "Fish", "Lion", "Bear", "Wolf"];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective}${animal}${number}`;
}

// Calculate score based on guess time
export function calculateScore(
  roundTime: number,
  guessTime: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0;

  const timeBonus = Math.max(0, roundTime - guessTime);
  const baseScore = 100;
  const bonus = Math.floor((timeBonus / roundTime) * 50);

  return baseScore + bonus;
}

// Get random words for the drawer to choose from
export function getRandomWords(words: string[], count: number = 3): string[] {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Create word hint (show length and some letters)
export function createWordHint(word: string, revealCount: number = 0): string {
  if (revealCount === 0) {
    return "_".repeat(word.length);
  }

  const letters = word.split("");
  const positions = Array.from({ length: word.length }, (_, i) => i);
  const shuffled = positions.sort(() => 0.5 - Math.random());
  const toReveal = shuffled.slice(0, Math.min(revealCount, word.length));

  return letters
    .map((letter, index) => (toReveal.includes(index) ? letter : "_"))
    .join("");
}

// Check if guess is close to the word
export function isCloseGuess(guess: string, word: string): boolean {
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedWord = word.toLowerCase().trim();

  // Exact match
  if (normalizedGuess === normalizedWord) return true;

  // Check if it's a partial match or contains the word
  if (
    normalizedWord.includes(normalizedGuess) ||
    normalizedGuess.includes(normalizedWord)
  ) {
    return true;
  }

  // Simple Levenshtein distance check for typos
  const distance = levenshteinDistance(normalizedGuess, normalizedWord);
  return distance <= 2 && normalizedWord.length > 3;
}

// Simple Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Format time remaining
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Default word list
export const DEFAULT_WORDS = [
  "cat",
  "dog",
  "house",
  "car",
  "tree",
  "book",
  "phone",
  "computer",
  "table",
  "chair",
  "window",
  "door",
  "flower",
  "sun",
  "moon",
  "star",
  "fish",
  "bird",
  "elephant",
  "lion",
  "pizza",
  "cake",
  "apple",
  "banana",
  "guitar",
  "piano",
  "bicycle",
  "airplane",
  "boat",
  "train",
  "mountain",
  "beach",
];
