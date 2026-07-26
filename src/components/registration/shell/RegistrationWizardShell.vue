<script setup>
import RegistrationHeader from './RegistrationHeader.vue'
import RegistrationStepper from './RegistrationStepper.vue'
import { isWizardStepId } from '../../../constants/wizard.js'

defineProps({
  eventName: {
    type: String,
    required: true,
  },
  errorStepIds: {
    type: Array,
    default: () => [],
    validator: (stepIds) => stepIds.every(isWizardStepId),
  },
})

const emit = defineEmits({
  'step-request': isWizardStepId,
})

const currentStep = defineModel('currentStep', {
  type: Number,
  required: true,
  validator: isWizardStepId,
})
</script>

<template>
  <q-layout class="registration-wizard-shell bg-surface-l0">
    <q-page-container>
      <q-page class="registration-wizard-shell__page">
        <registration-header :event-name="eventName" />

        <registration-stepper
          v-model:current-step="currentStep"
          :error-step-ids="errorStepIds"
          @step-request="emit('step-request', $event)"
        />

        <div class="registration-wizard-shell__content wizard-content-container wizard-section-padding">
          <slot />
        </div>

        <slot name="actions" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.registration-wizard-shell {
  min-height: 100vh;
}

.registration-wizard-shell__page {
  display: flex;
  min-height: 100vh !important;
  flex-direction: column;
}

.registration-wizard-shell__content {
  flex: 1 0 auto;
}
</style>
