function seedFromString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getRandomFactor(seed, index) {
  const x = Math.sin(seed + index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function generateMockPriceHistory({
  symbol,
  currentPrice,
  points = 36,
  intervalMinutes = 15,
}) {
  const safeCurrent = Number(currentPrice) > 0 ? Number(currentPrice) : 100;
  const seed = seedFromString(symbol || 'STOCK');
  const data = [];

  let price = safeCurrent * (0.94 + getRandomFactor(seed, 1) * 0.08);

  for (let i = 0; i < points; i += 1) {
    const noise = (getRandomFactor(seed, i + 2) - 0.5) * 0.022;
    const momentum = Math.sin((i + seed % 7) / 6) * 0.004;
    const drift = i === points - 1 ? (safeCurrent - price) / Math.max(price, 1) : 0;

    price *= 1 + noise + momentum + drift;

    const rounded = Number(price.toFixed(2));
    const time = `${String(Math.floor((i * intervalMinutes) / 60)).padStart(2, '0')}:${String(
      (i * intervalMinutes) % 60,
    ).padStart(2, '0')}`;

    data.push({
      index: i,
      time,
      price: rounded,
    });
  }

  data[points - 1] = {
    ...data[points - 1],
    price: safeCurrent,
  };

  return data;
}
