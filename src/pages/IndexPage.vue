<script setup>
import { ref } from 'vue'
import RegistrationActionBar from '../components/registration/RegistrationActionBar.vue'
import RegistrationWizardShell from '../components/registration/RegistrationWizardShell.vue'
import { event } from '../mocks/event.js'

const currentStep = ref(1)
</script>

<template>
  <registration-wizard-shell
    v-model:current-step="currentStep"
    :event-name="event.name"
  >
    <template #actions>
      <registration-action-bar
        primary-label="Next: Session Selection"
      />
    </template>
  </registration-wizard-shell>
</template>
