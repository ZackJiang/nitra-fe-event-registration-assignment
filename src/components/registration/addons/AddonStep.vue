<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ADDON_CATEGORIES } from '../../../constants/addons.js'
import OrderSummary from '../summary/OrderSummary.vue'
import AddonCard from './AddonCard.vue'
import MerchandiseCard from './MerchandiseCard.vue'

const props = defineProps({
  groupedAddons: {
    type: Object,
    default: () => ({
      workshop: [],
      meal: [],
      merchandise: [],
    }),
  },
  addonSelections: {
    type: Object,
    default: () => ({}),
  },
  addonAvailabilityById: {
    type: Object,
    default: () => ({}),
  },
  visibleIssues: {
    type: Array,
    default: () => [],
  },
  hasSelectedMerchandise: {
    type: Boolean,
    default: false,
  },
  pricingBreakdown: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits({
  'set-addon-quantity': (addonId, quantity) => (
    typeof addonId === 'string' && Number.isInteger(quantity)
  ),
  'set-addon-size': (addonId, size) => (
    typeof addonId === 'string' && (typeof size === 'string' || size === null)
  ),
})

const activeCategory = ref(ADDON_CATEGORIES[0].id)
const addonCardRefs = new Map()

const activeAddons = computed(() => (
  props.groupedAddons[activeCategory.value] ?? []
))
const allAddons = computed(() => (
  ADDON_CATEGORIES.flatMap((category) => props.groupedAddons[category.id] ?? [])
))
const addonIdSet = computed(() => new Set(allAddons.value.map((addon) => addon.id)))
const issuesByAddonId = computed(() => {
  const issues = new Map()

  props.visibleIssues
    .filter((issue) => issue.stepId === 3 && issue.targetType === 'addon')
    .forEach((issue) => {
      issue.targetIds
        .filter((targetId) => addonIdSet.value.has(targetId))
        .forEach((addonId) => {
          if (!issues.has(addonId)) {
            issues.set(addonId, issue)
          }
        })
    })

  return issues
})

function getSelection(addonId) {
  return props.addonSelections[addonId] ?? { quantity: 0, size: null }
}

function isSelected(addonId) {
  return getSelection(addonId).quantity > 0
}

function getAvailability(addonId) {
  return props.addonAvailabilityById[addonId] ?? {
    isSoldOut: false,
    conflictingSessionIds: [],
    isUnavailableForNewSelection: false,
  }
}

function getIssue(addonId) {
  return issuesByAddonId.value.get(addonId)
}

function setAddonCardRef(addonId, component) {
  if (component) {
    addonCardRefs.set(addonId, component)
    return
  }

  addonCardRefs.delete(addonId)
}

function requestSelection(addonId, selected) {
  emit('set-addon-quantity', addonId, selected ? 1 : 0)
}

function setAddonQuantity(addonId, quantity) {
  emit('set-addon-quantity', addonId, quantity)
}

function setAddonSize(addonId, size) {
  emit('set-addon-size', addonId, size)
}

async function focusFirstError() {
  const invalidAddon = allAddons.value.find((addon) => issuesByAddonId.value.has(addon.id))

  if (!invalidAddon) {
    return false
  }

  activeCategory.value = invalidAddon.category
  await nextTick()
  return addonCardRefs.get(invalidAddon.id)?.focus() ?? false
}

onMounted(focusFirstError)

defineExpose({
  focusFirstError,
})
</script>

<template>
  <section
    class="addon-step"
    aria-labelledby="addon-selection-heading"
  >
    <div class="addon-step__options">
      <h1
        id="addon-selection-heading"
        class="addon-step__heading"
      >
        Select Add-ons
      </h1>

      <q-tabs
        v-model="activeCategory"
        class="addon-step__tabs"
        active-class="addon-step__tab--active"
        align="left"
        dense
        no-caps
        outside-arrows
        mobile-arrows
        indicator-color="transparent"
        aria-label="Add-on categories"
      >
        <q-tab
          v-for="category in ADDON_CATEGORIES"
          :key="category.id"
          class="addon-step__tab"
          :name="category.id"
          :label="category.label"
        />
      </q-tabs>

      <q-banner
        v-if="hasSelectedMerchandise"
        class="addon-step__shipping-banner"
        rounded
      >
        <template #avatar>
          <q-icon
            name="info"
            size="20px"
          />
        </template>

        <strong>Shipping Information</strong>
        <span>
          Merchandise items will be shipped to your address one week before the conference.
          Please ensure your shipping address in Step 1 is correct.
        </span>
      </q-banner>

      <div
        v-if="activeAddons.length > 0"
        class="addon-step__list"
      >
        <merchandise-card
          v-for="addon in activeCategory === 'merchandise' ? activeAddons : []"
          :key="addon.id"
          :ref="(component) => setAddonCardRef(addon.id, component)"
          :addon="addon"
          :selection="getSelection(addon.id)"
          :has-error="Boolean(getIssue(addon.id))"
          :error-message="getIssue(addon.id)?.message"
          :error-message-id="`addon-${addon.id}-error`"
          @set-quantity="setAddonQuantity"
          @set-size="setAddonSize"
        />

        <addon-card
          v-for="addon in activeCategory !== 'merchandise' ? activeAddons : []"
          :key="addon.id"
          :ref="(component) => setAddonCardRef(addon.id, component)"
          :addon="addon"
          :selected="isSelected(addon.id)"
          :availability="getAvailability(addon.id)"
          :has-error="Boolean(getIssue(addon.id))"
          :error-message="getIssue(addon.id)?.message"
          :error-message-id="`addon-${addon.id}-error`"
          @update-selected="requestSelection"
        />
      </div>

      <p
        v-else
        class="addon-step__empty"
        role="status"
      >
        No add-ons are available in this category.
      </p>
    </div>

    <order-summary :pricing-breakdown="pricingBreakdown" />
  </section>
</template>

<style scoped src="./AddonStep.css"></style>
