//from: https://gist.github.com/6174/6062387
const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allNumbers = [..."0123456789"];

export const generator = (len) => {
  const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha];
  return [...Array(len)]
    .map((i) => base[(Math.random() * base.length) | 0])
    .join("");
};
