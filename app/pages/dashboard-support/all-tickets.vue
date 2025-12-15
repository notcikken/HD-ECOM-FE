<script setup lang="ts">
import { Ticket, TrendingUp, CheckCircle } from "lucide-vue-next";
import type { Ticket as TicketType } from "~/types/ticket.ts";
import TicketTable from "~/components/dashboard-employee/TicketTableEmployee.vue";

definePageMeta({
  layout: "employee",
});



const viewTicket = (id: string) => {
  console.log("View ticket:", id);
  // TODO: Navigate to ticket detail page
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">All Tickets</h1>
      <p class="text-gray-600">Semua tiket yang pernah ditugaskan kepada anda</p>
    </div>

    <!-- Recent Tickets -->
    <div class="bg-white rounded-xl border border-gray-200">

      <TicketTable
        :tickets="Tickets"
        :show-role="true"
        @view-ticket="viewTicket"
      />
    </div>
  </div>
</template>
