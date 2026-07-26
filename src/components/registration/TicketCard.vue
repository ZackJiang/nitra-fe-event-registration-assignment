<script setup>
import { ref } from 'vue'

const USD_WHOLE_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    required: true,
  },
  errorMessageId: {
    type: String,
    default: undefined,
  },
  tabIndex: {
    type: Number,
    default: -1,
  },
})

const emit = defineEmits({
  select: (ticketId) => typeof ticketId === 'string',
})

const radioRef = ref(null)

function formatTicketPrice(price) {
  return USD_WHOLE_FORMATTER.format(
    typeof price === 'number' && Number.isFinite(price) ? price : 0,
  )
}

function focus() {
  const radioElement = radioRef.value?.$el

  if (radioElement && typeof radioElement.focus === 'function') {
    radioElement.focus()
  }
}

defineExpose({
  focus,
})
</script>

<template>
  <q-card
    class="ticket-card"
    :class="{
      'ticket-card--selected': selected,
      'ticket-card--error': hasError,
    }"
    @click="emit('select', ticket.id)"
  >
    <q-radio
      ref="radioRef"
      class="ticket-card__radio"
      :model-value="selected ? ticket.id : null"
      :val="ticket.id"
      :name="groupName"
      :tabindex="tabIndex"
      :data-ticket-id="ticket.id"
      :aria-label="`${ticket.name} ticket, ${formatTicketPrice(ticket.price)}`"
      :aria-invalid="hasError ? 'true' : undefined"
      :aria-describedby="hasError ? errorMessageId : undefined"
      @update:model-value="emit('select', ticket.id)"
    />

    <div class="ticket-card__header">
      <span>{{ ticket.name }}</span>
      <span>{{ formatTicketPrice(ticket.price) }}</span>
    </div>

    <p class="ticket-card__description">
      {{ ticket.description }}
    </p>

    <ul class="ticket-card__perks">
      <li
        v-for="perk in ticket.perks"
        :key="perk"
        class="ticket-card__perk"
      >
        <q-icon
          aria-hidden="true"
          name="check_circle"
          size="14px"
        />
        <span>{{ perk }}</span>
      </li>
    </ul>

    <q-badge
      v-if="selected"
      class="ticket-card__selected-badge"
      color="positive"
      rounded
      label="✓ Selected"
    />
  </q-card>
</template>

<style scoped>
.ticket-card {
  position: relative;
  display: flex;
  min-width: 0;
  cursor: pointer;
  flex-direction: column;
  gap: var(--space-md);
  overflow: hidden;
  padding: var(--space-xl);
  border: 1px solid var(--border-neutral-muted);
  border-radius: var(--radius-md);
  background: var(--bg-surface-l1);
  box-shadow: var(--shadow-card);
  color: var(--text-neutral-default);
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}

.ticket-card:hover {
  border-color: var(--border-brand-muted);
  background: var(--bg-brand-subtle-hover);
}

.ticket-card:active {
  transform: translateY(1px);
  background: var(--bg-brand-subtle-active);
}

.ticket-card:focus-within {
  outline: var(--focus-ring-width) solid var(--border-brand-emphasis);
  outline-offset: var(--focus-ring-offset);
}

.ticket-card--selected {
  padding: calc(var(--space-xl) - 1px);
  border: 2px solid var(--border-brand-emphasis);
  background: var(--bg-brand-subtle-rest);
}

.ticket-card--selected:hover {
  background: var(--bg-brand-subtle-hover);
}

.ticket-card--selected:active {
  background: var(--bg-brand-subtle-active);
}

.ticket-card--error {
  border-color: var(--border-danger-emphasis);
}

.ticket-card__radio {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.ticket-card__header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  line-height: var(--line-height-subtitle1);
}

.ticket-card__description,
.ticket-card__perk {
  color: var(--text-neutral-muted);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-sm);
}

.ticket-card__description {
  margin: 0;
}

.ticket-card__perks {
  display: flex;
  margin: 0;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0;
  list-style: none;
}

.ticket-card__perk {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.ticket-card__selected-badge {
  align-self: flex-start;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 570;
  line-height: 14px;
}

@media (min-width: 1024px) {
  .ticket-card {
    min-height: 288px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ticket-card {
    transition: none;
  }
}
</style>
