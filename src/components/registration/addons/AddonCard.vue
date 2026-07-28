<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { locale, t } = useI18n()

const isWorkshop = computed(() => props.addon.category === 'workshop')
const isInteractive = computed(() => (
  props.selected || !props.availability.isUnavailableForNewSelection
))
const priceLabel = computed(() => formatUsd(toCents(props.addon.price), locale.value))
const scheduleLabel = computed(() => {
  if (!isWorkshop.value) {
    return ''
  }

  const dateLabel = formatUtcDate(props.addon.date, locale.value)
  const timeLabel = formatUtcTimeRange(props.addon.date, props.addon.endDate, locale.value)
  return [dateLabel, timeLabel].filter(Boolean).join(', ')
})
const capacityLabel = computed(() => {
  if (!isWorkshop.value) {
    return ''
  }

  if (props.availability.isSoldOut) {
    return t('addons.soldOut')
  }

  const remaining = getRemainingCapacity(props.addon.capacity, props.addon.registered)
  return t(remaining === 1 ? 'addons.spotRemainingOne' : 'addons.spotRemainingOther', { count: remaining })
})
const conflictMessage = computed(() => {
  if (props.availability.conflictingSessionIds.length === 0) {
    return ''
  }

  return props.selected
    ? t('addons.conflictSelected')
    : t('addons.conflictUnavailable')
})
const accessibleLabel = computed(() => {
  const action = t(props.selected ? 'addons.deselect' : 'addons.select')
  const status = conflictMessage.value || capacityLabel.value
  return t('addons.selectAria', { action, name: props.addon.name, status })
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
    class="addon-card selectable-card"
    :class="{
      'addon-card--selected': selected,
      'selectable-card--selected': selected,
      'addon-card--unavailable': !selected && availability.isUnavailableForNewSelection,
      'addon-card--selected-conflict': selected && conflictMessage,
      'addon-card--error': hasError,
      'selectable-card--error': hasError,
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
          size="var(--icon-size-md)"
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
