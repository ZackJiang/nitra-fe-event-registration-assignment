<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getSessionTrackTone } from '../../../constants/sessions.js'
import {
  formatUtcTimeRange,
  getCapacityUtilization,
  getRemainingCapacity,
} from '../../../utils/registrationSchedule.js'

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  soldOut: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessageId: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits({
  toggle: (sessionId) => typeof sessionId === 'string',
})

const checkboxRef = ref(null)
const { locale, t } = useI18n()

const isInteractive = computed(() => !props.soldOut || props.selected)
const trackTone = computed(() => getSessionTrackTone(props.session.track))
const trackLabel = computed(() => String(props.session.track ?? 'main').toUpperCase())
const speakerLine = computed(() => (
  [props.session.speaker, props.session.speakerTitle].filter(Boolean).join(', ')
))
const timeRange = computed(() => (
  formatUtcTimeRange(props.session.date, props.session.endDate, locale.value)
))
const utilization = computed(() => (
  getCapacityUtilization(props.session.capacity, props.session.registered)
))
const remainingSpots = computed(() => (
  getRemainingCapacity(props.session.capacity, props.session.registered)
))
const capacityTone = computed(() => {
  if (props.soldOut) {
    return 'danger'
  }

  if (utilization.value >= 0.75) {
    return 'accent'
  }

  if (utilization.value >= 0.5) {
    return 'warning'
  }

  return 'brand'
})
const capacityLabel = computed(() => {
  if (props.soldOut) {
    return t('sessions.soldOut')
  }

  return t(remainingSpots.value === 1 ? 'sessions.spotLeftOne' : 'sessions.spotLeftOther', { count: remainingSpots.value })
})
const accessibleLabel = computed(() => {
  return t('sessions.selectAria', {
    action: t(props.selected ? 'sessions.deselect' : 'sessions.select'), title: props.session.title, capacity: capacityLabel.value,
  })
})

function toggleSession() {
  if (isInteractive.value) {
    emit('toggle', props.session.id)
  }
}

function handleCardClick(event) {
  if (event.target.closest('.q-checkbox')) {
    return
  }

  toggleSession()
}

function focus() {
  const checkboxElement = checkboxRef.value?.$el

  if (focusableElement(checkboxElement)) {
    checkboxElement.focus()
    return true
  }

  return false
}

/**
 * @param {unknown} element
 * @returns {element is HTMLElement}
 */
function focusableElement(element) {
  return element instanceof HTMLElement && typeof element.focus === 'function'
}

defineExpose({
  focus,
})
</script>

<template>
  <q-card
    class="session-card selectable-card"
    :class="{
      'session-card--selected': selected,
      'selectable-card--selected': selected,
      'session-card--sold-out': soldOut && !selected,
      'session-card--error': hasError,
      'selectable-card--error': hasError,
    }"
    :aria-disabled="!isInteractive ? 'true' : undefined"
    :data-session-id="session.id"
    @click="handleCardClick"
  >
    <div class="session-card__top">
      <q-badge
        class="session-card__track"
        :class="`session-card__track--${trackTone}`"
        rounded
        :label="trackLabel"
      />

      <q-checkbox
        ref="checkboxRef"
        class="session-card__checkbox"
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
        @update:model-value="toggleSession"
      />
    </div>

    <h2 class="session-card__title">
      {{ session.title }}
    </h2>

    <p class="session-card__speaker">
      {{ speakerLine }}
    </p>

    <p class="session-card__time">
      {{ timeRange }}
    </p>

    <q-linear-progress
      class="session-card__capacity"
      :class="`session-card__capacity--${capacityTone}`"
      rounded
      size="var(--space-xs)"
      :value="utilization"
      :aria-label="t('sessions.capacityAria', { capacity: capacityLabel, percent: Math.round(utilization * 100) })"
    />

    <p
      class="session-card__capacity-label"
      :class="`session-card__capacity-label--${capacityTone}`"
    >
      {{ capacityLabel }}
    </p>
  </q-card>
</template>

<style scoped src="./SessionCard.css"></style>
