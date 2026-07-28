<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { WIZARD_STEP } from '../../../constants/wizard.js'
import { formatUtcDate, isAtCapacity } from '../../../utils/registrationSchedule.js'
import SessionCard from './SessionCard.vue'

const props = defineProps({
  groupedSessions: {
    type: Object,
    default: () => ({}),
  },
  selectedSessionIds: {
    type: Array,
    default: () => [],
  },
  visibleIssues: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits({
  'toggle-session': (sessionId) => typeof sessionId === 'string',
})

const errorMessageId = 'session-selection-error'
const sessionCardRefs = new Map()
const { locale, t } = useI18n()

const dateGroups = computed(() => (
  Object.entries(props.groupedSessions)
    .filter(([, sessions]) => Array.isArray(sessions) && sessions.length > 0)
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
))
const activeDateKey = ref(dateGroups.value[0]?.[0] ?? null)
const activeSessions = computed(() => (
  props.groupedSessions[activeDateKey.value] ?? []
))
const selectedSessionIdSet = computed(() => new Set(props.selectedSessionIds))
const selectedCountLabel = computed(() => {
  const count = props.selectedSessionIds.length
  return t(count === 1 ? 'sessions.countOne' : 'sessions.countOther', { count })
})
const sessionIssues = computed(() => (
  props.visibleIssues.filter((issue) => (
    issue.stepId === WIZARD_STEP.SESSIONS && issue.targetType === 'session'
  ))
))
const invalidSessionIds = computed(() => new Set(
  sessionIssues.value.flatMap((issue) => issue.targetIds),
))
const errorMessage = computed(() => {
  const issue = sessionIssues.value[0]
  return issue ? t(`validation['${issue.code}']`, issue.params) : ''
})

function getDateLabel(sessions) {
  return formatUtcDate(sessions[0]?.date, locale.value)
}

function isSelected(sessionId) {
  return selectedSessionIdSet.value.has(sessionId)
}

function hasError(sessionId) {
  return invalidSessionIds.value.has(sessionId)
}

function setSessionCardRef(sessionId, component) {
  if (component) {
    sessionCardRefs.set(sessionId, component)
    return
  }

  sessionCardRefs.delete(sessionId)
}

async function focusFirstError() {
  if (invalidSessionIds.value.size === 0) {
    return false
  }

  const targetGroup = dateGroups.value.find(([, sessions]) => (
    sessions.some((session) => invalidSessionIds.value.has(session.id))
  ))

  if (!targetGroup) {
    return false
  }

  activeDateKey.value = targetGroup[0]
  await nextTick()

  const targetSession = activeSessions.value.find((session) => hasError(session.id))
  return targetSession
    ? sessionCardRefs.get(targetSession.id)?.focus() ?? false
    : false
}

onMounted(focusFirstError)

defineExpose({
  focusFirstError,
})
</script>

<template>
  <section
    class="session-step"
    aria-labelledby="session-selection-heading"
  >
    <h1
      id="session-selection-heading"
      class="session-step__heading"
    >
      {{ t('sessions.heading') }}
    </h1>

    <template v-if="dateGroups.length > 0">
      <q-tabs
        v-model="activeDateKey"
        class="session-step__tabs"
        active-class="session-step__tab--active"
        align="left"
        dense
        no-caps
        outside-arrows
        mobile-arrows
        indicator-color="transparent"
        :aria-label="t('sessions.datesAria')"
      >
        <q-tab
          v-for="[dateKey, dateSessions] in dateGroups"
          :key="dateKey"
          class="session-step__tab"
          :name="dateKey"
          :label="getDateLabel(dateSessions)"
        />
      </q-tabs>

      <p
        class="session-step__count"
        aria-live="polite"
      >
        {{ selectedCountLabel }}
      </p>

      <div class="session-step__grid">
        <session-card
          v-for="session in activeSessions"
          :key="session.id"
          :ref="(component) => setSessionCardRef(session.id, component)"
          :session="session"
          :selected="isSelected(session.id)"
          :sold-out="isAtCapacity(session.capacity, session.registered)"
          :has-error="hasError(session.id)"
          :error-message-id="errorMessageId"
          @toggle="emit('toggle-session', $event)"
        />
      </div>

      <p
        v-if="errorMessage"
        :id="errorMessageId"
        class="session-step__error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </template>

    <p
      v-else
      class="session-step__empty"
      role="status"
    >
      {{ t('sessions.empty') }}
    </p>
  </section>
</template>

<style scoped src="./SessionStep.css"></style>
