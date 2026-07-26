<script setup>
import { computed } from 'vue'
import RegistrationActionBar from '../components/registration/RegistrationActionBar.vue'
import RegistrationStepOne from '../components/registration/RegistrationStepOne.vue'
import RegistrationWizardShell from '../components/registration/RegistrationWizardShell.vue'
import { useRegistrationWizard } from '../composables/useRegistrationWizard.js'
import { WIZARD_STEPS } from '../constants/wizard.js'
import { event } from '../mocks/event.js'

const {
  currentStep,
  attendee,
  errorStepIds,
  goToStep,
  hasSelectedMerchandise,
  isSubmitDisabled,
  nextStep,
  previousStep,
  selectTicket,
  submit,
  ticketTypeId,
  visibleValidationIssues,
} = useRegistrationWizard()

const ticketTypeModel = computed({
  get: () => ticketTypeId.value,
  set: (nextTicketTypeId) => selectTicket(nextTicketTypeId),
})

const primaryLabel = computed(() => (
  currentStep.value < WIZARD_STEPS.length
    ? `Next: ${WIZARD_STEPS[currentStep.value].label}`
    : 'Submit Registration'
))

function handlePrimaryAction() {
  if (currentStep.value === WIZARD_STEPS.length) {
    submit()
    return
  }

  nextStep()
}
</script>

<template>
  <registration-wizard-shell
    v-model:current-step="currentStep"
    :event-name="event.name"
    :error-step-ids="errorStepIds"
    @step-request="goToStep"
  >
    <registration-step-one
      v-if="currentStep === 1"
      v-model:ticket-type-id="ticketTypeModel"
      v-model:full-name="attendee.fullName"
      v-model:email="attendee.email"
      v-model:phone="attendee.phone"
      v-model:company="attendee.company"
      v-model:job-title="attendee.jobTitle"
      v-model:shipping-address="attendee.shippingAddress"
      :ticket-types="event.ticketTypes"
      :visible-issues="visibleValidationIssues"
      :shipping-required="hasSelectedMerchandise"
    />

    <template #actions>
      <registration-action-bar
        :show-back="currentStep > 1"
        :primary-label="primaryLabel"
        :primary-disabled="isSubmitDisabled"
        @back="previousStep"
        @primary="handlePrimaryAction"
      />
    </template>
  </registration-wizard-shell>
</template>
