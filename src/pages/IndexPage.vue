<script setup>
import { computed } from 'vue'
import RegistrationActionBar from '../components/registration/RegistrationActionBar.vue'
import RegistrationWizardShell from '../components/registration/RegistrationWizardShell.vue'
import { useRegistrationWizard } from '../composables/useRegistrationWizard.js'
import { WIZARD_STEPS } from '../constants/wizard.js'
import { event } from '../mocks/event.js'

const {
  currentStep,
  errorStepIds,
  goToStep,
  isSubmitDisabled,
  nextStep,
  previousStep,
  submit,
} = useRegistrationWizard()

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
