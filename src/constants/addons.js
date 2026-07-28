export const ADDON_CATEGORIES = Object.freeze([
  {
    id: 'workshop',
    labelKey: 'addons.categories.workshop',
  },
  {
    id: 'meal',
    labelKey: 'addons.categories.meal',
  },
  {
    id: 'merchandise',
    labelKey: 'addons.categories.merchandise',
  },
])

export const ADDON_CATEGORY_IDS = Object.freeze(
  ADDON_CATEGORIES.map((category) => category.id),
)
