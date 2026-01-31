export const GAME_CONSTANTS = {
  OT_RATES: {
    NORMAL: 1.5,
    WEEKEND: 2.0,
    HOLIDAY: 3.0,
  },
  POINTS_PER_HOUR: 100,
  SHOP_ITEMS: [
    { id: 'snack', name: 'Fish Snack', cost: 100, exp: 40, icon: '🐟' },
    { id: 'milk', name: 'Hot Milk', cost: 250, exp: 120, icon: '🥛' },
    { id: 'toy', name: 'Cat Toy', cost: 500, exp: 300, icon: '🧶' },
    { id: 'bed', name: 'Luxury Bed', cost: 1000, exp: 700, icon: '🛌' },
  ],
  LEVEL_BASE_EXP: 100,
  LEVEL_MULTIPLIER: 1.5, // Next level requires 1.5x previous EXP
}
