import { readFileSync } from "node:fs";

const levels = JSON.parse(
  readFileSync("games/001-arrow-harbor/src/levels.json", "utf8")
);

const vectors = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

function key(x, y) {
  return `${x},${y}`;
}

function simulate(level, directions) {
  let x = level.start.x;
  let y = level.start.y;
  let direction = level.start.direction;
  const rocks = new Set(level.rocks.map((rock) => key(rock.x, rock.y)));
  const buoys = new Map(
    level.buoys.map((buoy, index) => [
      key(buoy.x, buoy.y),
      directions[index]
    ])
  );
  const visited = new Set();

  for (let step = 0; step < 160; step += 1) {
    const state = `${x},${y},${direction}`;
    if (visited.has(state)) {
      return false;
    }
    visited.add(state);

    const vector = vectors[direction];
    x += vector[0];
    y += vector[1];

    if (
      x < 0 ||
      y < 0 ||
      x >= level.size.columns ||
      y >= level.size.rows ||
      rocks.has(key(x, y))
    ) {
      return false;
    }

    if (x === level.harbor.x && y === level.harbor.y) {
      return true;
    }

    const nextDirection = buoys.get(key(x, y));
    if (nextDirection !== undefined) {
      direction = nextDirection;
    }
  }

  return false;
}

function* assignments(length, prefix = []) {
  if (prefix.length === length) {
    yield prefix;
    return;
  }
  for (let direction = 0; direction < 4; direction += 1) {
    yield* assignments(length, [...prefix, direction]);
  }
}

if (!Array.isArray(levels) || levels.length < 10) {
  throw new Error("Arrow Harbor needs at least 10 levels.");
}

for (const level of levels) {
  const solution = level.buoys.map((buoy) => buoy.solution);
  if (!simulate(level, solution)) {
    throw new Error(`Level ${level.id} solution does not reach the harbor.`);
  }

  let winningAssignments = 0;
  for (const directions of assignments(level.buoys.length)) {
    if (simulate(level, directions)) {
      winningAssignments += 1;
      if (winningAssignments > 1) {
        break;
      }
    }
  }

  if (winningAssignments !== 1) {
    throw new Error(
      `Level ${level.id} must have exactly one solution; found ${winningAssignments}.`
    );
  }

  const calculatedPar = level.buoys.reduce(
    (total, buoy) => total + ((buoy.solution - buoy.direction + 4) % 4),
    0
  );

  if (calculatedPar !== level.parRotations) {
    throw new Error(
      `Level ${level.id} par mismatch: ${level.parRotations} vs ${calculatedPar}.`
    );
  }
}

console.log(`levels ok: ${levels.length} uniquely solvable stages`);
