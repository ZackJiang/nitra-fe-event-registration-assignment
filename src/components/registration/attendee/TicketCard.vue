<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
const { locale, t } = useI18n()

function formatTicketPrice(price) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0,
  }).format(
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
    class="ticket-card selectable-card"
    :class="{
      'ticket-card--selected': selected,
      'selectable-card--selected': selected,
      'ticket-card--error': hasError,
      'selectable-card--error': hasError,
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
      :aria-label="t('attendee.ticketAria', { name: ticket.name, price: formatTicketPrice(ticket.price) })"
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
          size="var(--icon-size-sm)"
        />
        <span>{{ perk }}</span>
      </li>
    </ul>

    <q-badge
      v-if="selected"
      class="ticket-card__selected-badge"
      color="positive"
      rounded
      :label="t('attendee.selected')"
    />
  </q-card>
</template>

<style scoped>
.ticket-card {
  position: relative;
  --selectable-card-gap: var(--space-md);
  --selectable-card-padding: var(--space-xl);
  --selectable-card-background: var(--bg-surface-l1);
  --selectable-card-selected-background: var(--bg-brand-subtle-rest);
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
  padding: var(--badge-padding-block) var(--badge-padding-inline);
  font-size: var(--font-size-caption);
  font-weight: 570;
  line-height: var(--line-height-caption);
}

@media (min-width: 1024px) {
  .ticket-card {
    min-height: var(--ticket-card-min-height);
  }
}
</style>
