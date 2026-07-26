<script setup>
import { computed, ref } from 'vue'
import { formatUsd, toCents } from '../../../utils/registrationPricing.js'
import {
  formatUtcDate,
  formatUtcTimeRange,
  getRemainingCapacity,
} from '../../../utils/registrationSchedule.js'

const props = defineProps({
  addon: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  availability: {
    type: Object,
    default: () => ({
      isSoldOut: false,
      conflictingSessionIds: [],
      isUnavailableForNewSelection: false,
    }),
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  errorMessageId: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits({
  'update-selected': (addonId, selected) => (
    typeof addonId === 'string' && typeof selected === 'boolean'
  ),
})

const checkboxRef = ref(null)

const isWorkshop = computed(() => props.addon.category === 'workshop')
const isInteractive = computed(() => (
  props.selected || !props.availability.isUnavailableForNewSelection
))
const priceLabel = computed(() => formatUsd(toCents(props.addon.price)))
const scheduleLabel = computed(() => {
  if (!isWorkshop.value) {
    return ''
  }

  const dateLabel = formatUtcDate(props.addon.date)
  const timeLabel = formatUtcTimeRange(props.addon.date, props.addon.endDate)
  return [dateLabel, timeLabel].filter(Boolean).join(', ')
})
const capacityLabel = computed(() => {
  if (!isWorkshop.value) {
    return ''
  }

  if (props.availability.isSoldOut) {
    return 'Sold Out'
  }

  const remaining = getRemainingCapacity(props.addon.capacity, props.addon.registered)
  return `${remaining} ${remaining === 1 ? 'spot' : 'spots'} remaining`
})
const conflictMessage = computed(() => {
  if (props.availability.conflictingSessionIds.length === 0) {
    return ''
  }

  return props.selected
    ? 'Conflicts with a selected session. Deselect this workshop to continue.'
    : 'Unavailable — conflicts with a selected session.'
})
const accessibleLabel = computed(() => {
  const action = props.selected ? 'Deselect' : 'Select'
  const status = conflictMessage.value || capacityLabel.value
  return [action, props.addon.name, status].filter(Boolean).join('. ')
})

function requestSelection() {
  if (isInteractive.value) {
    emit('update-selected', props.addon.id, !props.selected)
  }
}

function handleCardClick(event) {
  if (event.target.closest('.q-checkbox')) {
    return
  }

  requestSelection()
}

function focus() {
  const checkboxElement = checkboxRef.value?.$el

  if (checkboxElement instanceof HTMLElement) {
    checkboxElement.focus()
    return true
  }

  return false
}

defineExpose({
  focus,
})
</script>

<template>
  <q-card
    class="addon-card"
    :class="{
      'addon-card--selected': selected,
      'addon-card--unavailable': !selected && availability.isUnavailableForNewSelection,
      'addon-card--selected-conflict': selected && conflictMessage,
      'addon-card--error': hasError,
    }"
    :aria-disabled="!isInteractive ? 'true' : undefined"
    :data-addon-id="addon.id"
    @click="handleCardClick"
  >
    <div class="addon-card__header">
      <h2 class="addon-card__title">
        {{ addon.name }}
      </h2>

      <div class="addon-card__header-end">
        <span class="addon-card__price">{{ priceLabel }}</span>
        <q-checkbox
          ref="checkboxRef"
          class="addon-card__checkbox"
          dense
          keep-color
          color="primary"
          size="16px"
          :model-value="selected"
          :disable="!isInteractive"
          :aria-label="accessibleLabel"
          :aria-invalid="hasError ? 'true' : undefined"
          :aria-describedby="hasError ? errorMessageId : undefined"
          @click.stop
          @update:model-value="requestSelection"
        />
      </div>
    </div>

    <p class="addon-card__description">
      {{ addon.description }}
    </p>

    <p
      v-if="scheduleLabel"
      class="addon-card__meta"
    >
      {{ scheduleLabel }}
    </p>

    <p
      v-if="capacityLabel"
      class="addon-card__capacity"
      :class="{ 'addon-card__capacity--sold-out': availability.isSoldOut }"
    >
      {{ capacityLabel }}
    </p>

    <p
      v-if="conflictMessage"
      class="addon-card__conflict"
    >
      {{ conflictMessage }}
    </p>

    <p
      v-if="hasError && errorMessage"
      :id="errorMessageId"
      class="addon-card__error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </q-card>
</template>

<style scoped src="./AddonCard.css"></style>
