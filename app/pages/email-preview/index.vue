<template>
  <div class="email-preview-container">
    <h2>Email Preview</h2>

    <iframe
      class="email-frame"
      :srcdoc="renderedHtml"
    >
  </iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import rawTemplate from './TicketResolvedPreview.html?raw'

// Dummy Data
const data = {
  userName: 'John Doe',
  ticketId: 'TKT-2025-001',
  ticketTitle: 'Reset Password Tidak Berfungsi',
  resolution: `Halo John, tim kami telah menemukan masalah pada link reset password.\nKami telah memperbaikinya dan Anda sekarang dapat mencoba kembali.`,
  date: new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  currentYear: new Date().getFullYear()
}

// Render HTML by replacing template variables
const renderedHtml = computed(() => {
  let result = rawTemplate
  Object.entries(data).forEach(([key, value]) => {
    result = result.replaceAll(`\${${key}}`, value as string)
  })
  return result
})
</script>

<style scoped>
.email-preview-container {
  padding: 20px;
}

.email-frame {
  width: 100%;
  height: 750px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}
</style>
