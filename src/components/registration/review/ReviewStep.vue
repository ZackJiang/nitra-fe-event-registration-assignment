<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistrationReview } from '../../../composables/useRegistrationReview.js'
import { WIZARD_STEP } from '../../../constants/wizard.js'
import OrderSummary from '../summary/OrderSummary.vue'
import ReviewErrorBanner from './ReviewErrorBanner.vue'
import ReviewRows from './ReviewRows.vue'
import ReviewSection from './ReviewSection.vue'

const props = defineProps({
  attendee: {
    type: Object,
    required: true,
  },
  selectedTicket: {
    type: Object,
    default: null,
  },
  selectedSessions: {
    type: Array,
    default: () => [],
  },
  selectedAddons: {
    type: Array,
    default: () => [],
  },
  pricingBreakdown: {
    type: Object,
    required: true,
  },
  visibleIssues: {
    type: Array,
    default: () => [],
  },
  hasSelectedMerchandise: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits({
  'edit-step': (stepId) => Number.isInteger(stepId),
})

const errorBannerRef = ref(null)
const { t } = useI18n()
const {
  addonIssues,
  addonRows,
  attendeeIssues,
  attendeeRows,
  sessionIssues,
  sessionRows,
} = useRegistrationReview(props)

function navigateToStep(stepId) {
  emit('edit-step', stepId)
}

function focusErrorSummary() {
  return errorBannerRef.value?.focus() ?? Promise.resolve()
}

defineExpose({
  focusErrorSummary,
})
</script>

<template>
  <section
    class="review-step"
    aria-labelledby="review-step-heading"
  >
    <review-error-banner
      v-if="visibleIssues.length > 0"
      ref="errorBannerRef"
      :issues="visibleIssues"
      @navigate="navigateToStep"
    />

    <h1
      id="review-step-heading"
      class="review-step__heading"
    >
      {{ t('review.title') }}
    </h1>

    <review-section
      :title="t('review.attendee')"
      :step-id="WIZARD_STEP.ATTENDEE"
      :has-error="attendeeIssues.length > 0"
      @edit="navigateToStep"
    >
      <review-rows :rows="attendeeRows" />
    </review-section>

    <review-section
      :title="t('review.sessions')"
      :step-id="WIZARD_STEP.SESSIONS"
      :has-error="sessionIssues.length > 0"
      @edit="navigateToStep"
    >
      <review-rows
        :rows="sessionRows"
        :empty-message="t('review.noSessions')"
        :issues="sessionIssues"
      />
    </review-section>

    <review-section
      :title="t('review.addons')"
      :step-id="WIZARD_STEP.ADDONS"
      :has-error="addonIssues.length > 0"
      @edit="navigateToStep"
    >
      <review-rows
        :rows="addonRows"
        :empty-message="t('review.noAddons')"
        :issues="addonIssues"
      />
    </review-section>

    <order-summary
      :pricing-breakdown="pricingBreakdown"
      :title="t('review.pricing')"
      :total-label="t('review.grandTotal')"
      variant="review"
    />
  </section>
</template>

<style scoped>
.review-step {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--space-2xl);
}

.review-step__heading {
  margin: 0;
  font-size: var(--font-size-h3);
  font-weight: 680;
  line-height: var(--line-height-h3);
}

</style>
