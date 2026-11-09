"use strict";

const select = document.querySelector("#reference");
const ranking = document.querySelector("#ranking");
const metrics = document.querySelector("#metrics");
const key = document.querySelector("#key");
const announcement = document.querySelector("#announcement");
const metricLabels = ["Goles", "Asistencias", "Minutos jugados", "Tiros por 90 min"];
const scores = standardizeStats(scoutingAthletes);
const numberFormat = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const distanceFormat = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const maxima = metricLabels.map((_, i) => Math.max(...scoutingAthletes.map(player => player.stats[i])));

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function compare(reference, candidate) {
  const players = [scoutingAthletes[reference], scoutingAthletes[candidate]];
  key.replaceChildren(...players.map((player, index) =>
    element("span", player.name, index === 0 ? "key-reference" : "key-candidate")
  ));
  const rows = metricLabels.map((title, column) => {
    const row = element("div", undefined, "metric");
    row.append(element("h3", title));
    players.forEach((player, index) => {
      const value = player.stats[column];
      const bar = element("div", undefined, "bar-row");
      const track = element("span", undefined, "track");
      const fill = element("span", undefined, index === 0 ? "fill reference" : "fill candidate");
      fill.style.width = (value / maxima[column] * 100) + "%";
      track.setAttribute("aria-hidden", "true");
      track.append(fill);
      const label = element("span", undefined, "value");
      label.append(element("span", player.name + ": ", "visually-hidden"), numberFormat.format(value));
      bar.append(track, label);
      row.append(bar);
    });
    return row;
  });
  metrics.replaceChildren(...rows);
  for (const button of ranking.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.player) === candidate));
  }
  announcement.textContent = "Comparación de " + players[0].name + " con " + players[1].name + ".";
}

function update() {
  const index = Number(select.value);
  const method = document.querySelector('input[name="method"]:checked').value;
  const distances = nearestPlayers(scores, index, method);
  const items = distances.map(({ index: playerIndex, distance }, position) => {
    const item = element("li");
    const button = element("button");
    button.type = "button";
    button.dataset.player = String(playerIndex);
    const order = element("span", String(position + 1).padStart(2, "0"), "order");
    order.setAttribute("aria-hidden", "true");
    button.append(order, element("span", scoutingAthletes[playerIndex].name), element("span", distanceFormat.format(distance), "distance"));
    button.addEventListener("click", () => compare(index, playerIndex));
    item.append(button);
    return item;
  });
  ranking.replaceChildren(...items);
  compare(index, distances[0].index);
}

scoutingAthletes.forEach((athlete, index) => select.add(new Option(athlete.name, String(index))));
select.addEventListener("change", update);
document.querySelectorAll('input[name="method"]').forEach(input => input.addEventListener("change", update));
update();
