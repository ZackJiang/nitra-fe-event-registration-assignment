<script setup>
import { computed, nextTick, ref } from 'vue'
import AddonStep from '../components/registration/addons/AddonStep.vue'
import AttendeeStep from '../components/registration/attendee/AttendeeStep.vue'
import SessionStep from '../components/registration/sessions/SessionStep.vue'
import ReviewStep from '../components/registration/review/ReviewStep.vue'
import RegistrationActionBar from '../components/registration/shell/RegistrationActionBar.vue'
import RegistrationWizardShell from '../components/registration/shell/RegistrationWizardShell.vue'
import { useRegistrationWizard } from '../composables/useRegistrationWizard.js'
import { WIZARD_STEPS } from '../constants/wizard.js'
import { event } from '../mocks/event.js'

const {
  currentStep,
  addonAvailabilityById,
  addonSelections,
  attendee,
  errorStepIds,
  goToStep,
  groupedAddons,
  groupedSessions,
  hasSelectedMerchandise,
  isSubmitDisabled,
  nextStep,
  pricingBreakdown,
  previousStep,
  selectTicket,
  selectedAddons,
  selectedSessions,
  selectedTicket,
  selectedSessionIds,
  setAddonQuantity,
  setAddonSize,
  submit,
  ticketTypeId,
  toggleSession,
  visibleValidationIssues,
} = useRegistrationWizard()

const reviewStepRef = ref(null)

const ticketTypeModel = computed({
  get: () => ticketTypeId.value,
  set: (nextTicketTypeId) => selectTicket(nextTicketTypeId),
})

const primaryLabel = computed(() => (
  currentStep.value < WIZARD_STEPS.length
    ? `Next: ${WIZARD_STEPS[currentStep.value].label}`
    : 'Submit Registration'
))

async function handlePrimaryAction() {
  if (currentStep.value === WIZARD_STEPS.length) {
    const result = submit()

    if (!result.ok) {
      await nextTick()
      await reviewStepRef.value?.focusErrorSummary()
    }

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
    <attendee-step
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

    <session-step
      v-else-if="currentStep === 2"
      :grouped-sessions="groupedSessions"
      :selected-session-ids="selectedSessionIds"
      :visible-issues="visibleValidationIssues"
      @toggle-session="toggleSession"
    />

    <addon-step
      v-else-if="currentStep === 3"
      :grouped-addons="groupedAddons"
      :addon-selections="addonSelections"
      :addon-availability-by-id="addonAvailabilityById"
      :visible-issues="visibleValidationIssues"
      :has-selected-merchandise="hasSelectedMerchandise"
      :pricing-breakdown="pricingBreakdown"
      @set-addon-quantity="setAddonQuantity"
      @set-addon-size="setAddonSize"
    />

    <review-step
      v-else-if="currentStep === 4"
      ref="reviewStepRef"
      :attendee="attendee"
      :selected-ticket="selectedTicket"
      :selected-sessions="selectedSessions"
      :selected-addons="selectedAddons"
      :pricing-breakdown="pricingBreakdown"
      :visible-issues="visibleValidationIssues"
      :has-selected-merchandise="hasSelectedMerchandise"
      @edit-step="goToStep"
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
