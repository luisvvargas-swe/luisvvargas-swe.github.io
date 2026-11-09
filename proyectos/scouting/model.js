"use strict";

const scoutingAthletes = [
  { name: "Adrián Valle", stats: [24, 9, 2800, 4.2] },
  { name: "Bruno Rivas", stats: [21, 9, 2780, 3.1] },
  { name: "Ivo Landa", stats: [21, 7, 2480, 3.8] },
  { name: "Dante Salas", stats: [12, 14, 2660, 2.5] },
  { name: "Elías Neri", stats: [22, 4, 2400, 4.1] },
  { name: "Leo Soria", stats: [8, 15, 2480, 2.2] },
  { name: "Teo Paz", stats: [16, 8, 2210, 2.8] },
  { name: "Gael Mora", stats: [12, 6, 1960, 3.6] },
  { name: "Félix Olmo", stats: [6, 2, 1550, 2.2] }
];

function standardizeStats(athletes) {
  const means = athletes[0].stats.map((_, column) =>
    athletes.reduce((sum, player) => sum + player.stats[column], 0) / athletes.length
  );
  const deviations = means.map((mean, column) => Math.sqrt(
    athletes.reduce((sum, player) => sum + (player.stats[column] - mean) ** 2, 0) / athletes.length
  ));
  return athletes.map(({ stats }) => stats.map((value, column) =>
    deviations[column] === 0 ? 0 : (value - means[column]) / deviations[column]
  ));
}

function nearestPlayers(standardized, reference, method) {
  const distances = [];
  standardized.forEach((stats, index) => {
    if (index === reference) return;
    const differences = stats.map((value, column) => Math.abs(value - standardized[reference][column]));
    const distance = method === "manhattan"
      ? differences.reduce((sum, value) => sum + value, 0)
      : Math.hypot(...differences);
    distances.push({ index, distance });
  });
  return distances.sort((a, b) => a.distance - b.distance || a.index - b.index);
}
