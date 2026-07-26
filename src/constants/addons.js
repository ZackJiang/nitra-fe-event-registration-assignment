export const ADDON_CATEGORIES = Object.freeze([
  {
    id: 'workshop',
    label: 'Workshops',
  },
  {
    id: 'meal',
    label: 'Meal Packages',
  },
  {
    id: 'merchandise',
    label: 'Merchandise',
  },
])

export const ADDON_CATEGORY_IDS = Object.freeze(
  ADDON_CATEGORIES.map((category) => category.id),
)
