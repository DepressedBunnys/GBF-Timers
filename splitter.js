function randomArray(length, max) {
  return [...new Array(length)].map(() => Math.round(Math.random() * max));
}

const sessionLengths = [
  17289, 12549, 9567, 13038, 16843, 10372, 28649, 24615, 15800.163,
  15190.889000000001, 21174.558, 15183.467, 24595.801, 74427.225,
  8914.152999999998, 7675.2660000000005, 16971.264, 35108.876, 14429.064,
  11896.083, 18158.615, 17283.023, 9876.223, 23420.531, 18883.690000000002,
  12874.771999999999
];

//const testArray = randomArray(250, 100);

function chunkAverage(chunkArray, size = 7) {
  const mainChunks = [];
  const backupChunks = [];
  const averageChunks = [];

  while (chunkArray.length > 0) {
    const renderedChunk = chunkArray.splice(0, size);
    renderedChunk.length === size
      ? mainChunks.push(renderedChunk)
      : backupChunks.push(renderedChunk);
  }

  for (let i = 0; i < mainChunks.length || i < backupChunks.length; i++) {
    const chunkSum = mainChunks.length
      ? mainChunks[i].reduce((partialSum, a) => partialSum + a, 0)
      : backupChunks[i].reduce((partialSum, a) => partialSum + a, 0);
    averageChunks.push(chunkSum);
  }

  return averageChunks;
}

function toHours(seconds) {
  return seconds / 3600;
}

function averagePerDay(hours, restDays) {
  return hours / (7 - restDays);
}

function averageTotal(data) {
  let sum = 0;
  for (let k = 0; k < data.length; k++) {
    sum += data[k];
  }
  return sum / data.length;
}

const averageTimes = chunkAverage(sessionLengths, 7);

let currentIterationData;

for (let j = 0; j < averageTimes.length; j++) {
  currentIterationData = toHours(averageTimes[j].toFixed(5));
  console.log(
    `${averagePerDay(currentIterationData, 1).toFixed(2)} hours a day`
  );
}

console.log(
  `Average time per week: ${toHours(averageTotal(averageTimes)).toFixed(2)}`
);
