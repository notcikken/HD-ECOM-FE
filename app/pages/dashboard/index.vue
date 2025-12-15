<script setup lang="ts">
import { Ticket, TrendingUp, CheckCircle } from 'lucide-vue-next';
import type { Ticket as TicketType } from '~/types/ticket.ts';
import TicketTable from '~/components/dashboard/TicketTable.vue';
import { useNotification } from '~/composables/useNotification';
import { computed, ref, onMounted } from 'vue';
import { useTicketApi } from '~/composables/useTicketApi';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const { ticketNotifications } = useNotification();
const { fetchTickets, fetchTicketCategories } = useTicketApi();

const recentTickets = ref<TicketType[]>([]);

const loadRecentTickets = async () => {
  const [ticketsResponse, categoriesResponse] = await Promise.all([
    fetchTickets({ limit: 5 }),
    fetchTicketCategories(),
  ]);

  if (ticketsResponse.success && categoriesResponse.success) {
    const categoryMap = categoriesResponse.data.reduce((map, cat) => {
      map[cat.id_category] = cat.nama_category;
      return map;
    }, {} as Record<number, string>);

    recentTickets.value = ticketsResponse.data.map((ticket: any) => ({
      id: ticket.kode_tiket,
      title: ticket.judul,
      description: ticket.deskripsi,
      status:
        ticket.id_status === 1
          ? 'open'
          : ticket.id_status === 2
          ? 'in-progress'
          : 'resolved',
      priority:
        ticket.id_priority === 0
          ? null
          : ticket.id_priority === 1
          ? 'low'
          : ticket.id_priority === 2
          ? 'medium'
          : ticket.id_priority === 3
          ? 'high'
          : 'urgent',
      role: ticket.tipe_pengaduan === 'customer' ? 'pelanggan' : 'penjual',
      createdBy: ticket.username,
      createdAt: ticket.tanggal_dibuat,
      updatedAt: ticket.tanggal_diperbarui,
      category: categoryMap[ticket.id_category] || 'Unknown',
      // Add other fields as needed, defaulting missing ones
      id_ticket: ticket.id_ticket.toString(),
      kode_tiket: ticket.kode_tiket,
      judul: ticket.judul,
      deskripsi: ticket.deskripsi,
      id_status: ticket.id_status,
      username: ticket.username,
      id_priority: ticket.id_priority,
      tipe_pengaduan: ticket.tipe_pengaduan,
      tanggal_dibuat: ticket.tanggal_dibuat,
      tanggal_diperbarui: ticket.tanggal_diperbarui,
    }));
  }
};

onMounted(() => {
  loadRecentTickets();
});

const statistics = computed(() => {
  const tn = ticketNotifications.value;
  if (!tn) return [];
  return [
    {
      label: 'Total Tiket',
      value: tn.total_tickets.toString(),
      change: '+12%',
      icon: Ticket,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      badgeClass: 'bg-green-100 text-green-700',
    },
    {
      label: 'Open',
      value: tn.total_open_tickets.toString(),
      change: '+8%',
      icon: Ticket,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'In Progress',
      value: tn.in_progress_tickets.toString(),
      change: '-5%',
      icon: TrendingUp,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      badgeClass: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Resolved',
      value: tn.resolved_tickets.toString(),
      change: '+15%',
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    },
  ];
});

const statusDistribution = computed(() => {
  const tn = ticketNotifications.value;
  if (!tn) return [];
  const total = tn.total_tickets;
  return [
    {
      label: 'Open',
      value: tn.total_open_tickets,
      percentage: Math.round((tn.total_open_tickets / total) * 100),
      color: 'bg-blue-500',
    },
    {
      label: 'In Progress',
      value: tn.in_progress_tickets,
      percentage: Math.round((tn.in_progress_tickets / total) * 100),
      color: 'bg-yellow-500',
    },
    {
      label: 'Resolved',
      value: tn.resolved_tickets,
      percentage: Math.round((tn.resolved_tickets / total) * 100),
      color: 'bg-green-500',
    },
  ];
});

const priorityDistribution = computed(() => {
  const tn = ticketNotifications.value;
  if (!tn) return [];
  const pc = tn.priority_counts;
  const total = tn.total_tickets;
  return [
    {
      label: 'Urgent',
      value: pc.critical,
      percentage: Math.round((pc.critical / total) * 100),
      color: 'bg-red-500',
      dotColor: 'bg-red-500',
    },
    {
      label: 'High',
      value: pc.high,
      percentage: Math.round((pc.high / total) * 100),
      color: 'bg-orange-500',
      dotColor: 'bg-orange-500',
    },
    {
      label: 'Medium',
      value: pc.medium,
      percentage: Math.round((pc.medium / total) * 100),
      color: 'bg-yellow-500',
      dotColor: 'bg-yellow-500',
    },
    {
      label: 'Low',
      value: pc.low,
      percentage: Math.round((pc.low / total) * 100),
      color: 'bg-green-500',
      dotColor: 'bg-green-500',
    },
  ];
});

const viewTicket = (id: string) => {
  console.log('View ticket:', id);
  // TODO: Navigate to ticket detail page
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p class="text-gray-600">Statistik dan ringkasan tiket support</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in statistics"
        :key="stat.label"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.bgColor"
          >
            <component
              :is="stat.icon"
              class="w-6 h-6"
              :class="stat.iconColor"
            />
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-1">{{ stat.value }}</h3>
        <p class="text-sm text-gray-600">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Status Distribution -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">Status Tiket</h3>
        <div class="space-y-4">
          <div v-for="status in statusDistribution" :key="status.label">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">{{
                status.label
              }}</span>
              <span class="text-sm font-semibold text-gray-800">{{
                status.value
              }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="status.color"
                :style="{ width: status.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Distribution -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">
          Prioritas Tiket
        </h3>
        <div class="space-y-4">
          <div v-for="priority in priorityDistribution" :key="priority.label">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="priority.dotColor"
                ></div>
                <span class="text-sm font-medium text-gray-700">{{
                  priority.label
                }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-800">{{
                priority.value
              }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="priority.color"
                :style="{ width: priority.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tickets -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">Tiket Terbaru</h3>
          <button
            class="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Lihat Semua
          </button>
        </div>
      </div>

      <TicketTable
        :tickets="recentTickets"
        :show-role="true"
        @view-ticket="viewTicket"
      />
    </div>
  </div>
</template>
