<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import AttendeeInformationForm from './AttendeeInformationForm.vue'
import TicketSelection from './TicketSelection.vue'

const FIELD_FOCUS_ORDER = Object.freeze([
  'fullName',
  'email',
  'phone',
  'company',
  'jobTitle',
  'shippingAddress',
])

const props = defineProps({
  ticketTypes: {
    type: Array,
    required: true,
  },
  visibleIssues: {
    type: Array,
    default: () => [],
  },
  shippingRequired: {
    type: Boolean,
    default: false,
  },
})

const ticketTypeId = defineModel('ticketTypeId', {
  type: String,
  default: null,
})
const fullName = defineModel('fullName', { type: String, required: true })
const email = defineModel('email', { type: String, required: true })
const phone = defineModel('phone', { type: String, required: true })
const company = defineModel('company', { type: String, required: true })
const jobTitle = defineModel('jobTitle', { type: String, required: true })
const shippingAddress = defineModel('shippingAddress', { type: String, required: true })

const ticketSelectionRef = ref(null)
const attendeeFormRef = ref(null)

const stepOneIssues = computed(() => (
  props.visibleIssues.filter((issue) => issue.stepId === 1)
))

const ticketIssue = computed(() => (
  stepOneIssues.value.find((issue) => issue.targetType === 'ticket') ?? null
))

const fieldIssues = computed(() => {
  const issuesByField = {}

  stepOneIssues.value
    .filter((issue) => issue.targetType === 'field')
    .forEach((issue) => {
      issue.targetIds.forEach((fieldId) => {
        if (!issuesByField[fieldId]) {
          issuesByField[fieldId] = issue
        }
      })
    })

  return issuesByField
})

async function focusFirstError() {
  if (stepOneIssues.value.length === 0) {
    return false
  }

  await nextTick()

  if (ticketIssue.value) {
    return ticketSelectionRef.value?.focusFirstTicket() ?? false
  }

  const firstInvalidField = FIELD_FOCUS_ORDER.find((fieldId) => fieldIssues.value[fieldId])
  return firstInvalidField
    ? attendeeFormRef.value?.focusField(firstInvalidField) ?? false
    : false
}

onMounted(focusFirstError)

defineExpose({
  focusFirstError,
})
</script>

<template>
  <div class="attendee-step">
    <ticket-selection
      ref="ticketSelectionRef"
      v-model="ticketTypeId"
      :ticket-types="ticketTypes"
      :issue="ticketIssue"
    />

    <attendee-information-form
      ref="attendeeFormRef"
      v-model:full-name="fullName"
      v-model:email="email"
      v-model:phone="phone"
      v-model:company="company"
      v-model:job-title="jobTitle"
      v-model:shipping-address="shippingAddress"
      :field-issues="fieldIssues"
      :shipping-required="shippingRequired"
    />
  </div>
</template>

<style scoped>
.attendee-step {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-3xl);
}
</style>
