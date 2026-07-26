<script setup>
import { nextTick, ref } from 'vue'
import TicketCard from './TicketCard.vue'

defineProps({
  ticketTypes: {
    type: Array,
    required: true,
  },
  issue: {
    type: Object,
    default: null,
  },
})

const selectedTicketId = defineModel({
  type: String,
  default: null,
})

const groupName = 'registration-ticket-type'
const headingId = 'ticket-selection-heading'
const errorMessageId = 'ticket-selection-error'
const ticketCards = ref([])

function focusFirstTicket() {
  const firstTicket = ticketCards.value[0]

  if (!firstTicket || typeof firstTicket.focus !== 'function') {
    return false
  }

  firstTicket.focus()
  return true
}

async function handleRadioGroupKeydown(event) {
  const supportedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']

  if (!supportedKeys.includes(event.key) || ticketCards.value.length === 0) {
    return
  }

  event.preventDefault()

  const radioControls = [...event.currentTarget.querySelectorAll('[role="radio"]')]
  const currentIndex = radioControls.indexOf(event.target)
  const lastIndex = ticketCards.value.length - 1
  let nextIndex = currentIndex >= 0 ? currentIndex : 0

  if (event.key === 'Home') {
    nextIndex = 0
  }
  else if (event.key === 'End') {
    nextIndex = lastIndex
  }
  else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (nextIndex + 1) % ticketCards.value.length
  }
  else {
    nextIndex = (nextIndex - 1 + ticketCards.value.length) % ticketCards.value.length
  }

  selectedTicketId.value = radioControls[nextIndex]?.getAttribute('data-ticket-id')
  await nextTick()
  ticketCards.value[nextIndex]?.focus()
}

defineExpose({
  focusFirstTicket,
})
</script>

<template>
  <section
    class="ticket-selection"
    aria-labelledby="ticket-selection-heading"
  >
    <h2
      :id="headingId"
      class="ticket-selection__heading"
    >
      Select Ticket Type
    </h2>

    <div
      class="ticket-selection__grid"
      role="radiogroup"
      :aria-labelledby="headingId"
      :aria-invalid="issue ? 'true' : undefined"
      :aria-describedby="issue ? errorMessageId : undefined"
      @keydown="handleRadioGroupKeydown"
    >
      <ticket-card
        ref="ticketCards"
        v-for="ticket in ticketTypes"
        :key="ticket.id"
        :ticket="ticket"
        :selected="selectedTicketId === ticket.id"
        :has-error="Boolean(issue)"
        :group-name="groupName"
        :error-message-id="errorMessageId"
        :tab-index="selectedTicketId === ticket.id || (!selectedTicketId && ticket.id === ticketTypes[0]?.id) ? 0 : -1"
        @select="selectedTicketId = $event"
      />
    </div>

    <p
      v-if="issue"
      :id="errorMessageId"
      class="ticket-selection__error"
      role="alert"
    >
      {{ issue.message }}
    </p>
  </section>
</template>

<style scoped>
.ticket-selection {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-lg);
}

.ticket-selection__heading {
  margin: 0;
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  line-height: var(--line-height-subtitle1);
}

.ticket-selection__grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--space-lg);
}

.ticket-selection__error {
  margin: calc(var(--space-sm) * -1) 0 0;
  color: var(--text-danger-default);
  font-size: 11px;
  line-height: 14px;
}

@media (max-width: 1023px) {
  .ticket-selection__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .ticket-selection__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
