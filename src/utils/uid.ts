export function generateUID() {
   return Array.from({length: 5}).map(() => String.fromCodePoint(Math.round(Math.random() * 74) + 48)).join("")
}