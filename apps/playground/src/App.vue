<script setup lang="ts">
import { ref } from 'vue'

const dark = ref(false)
const name = ref('')
const password = ref('')
const page = ref(1)
const tab = ref('form')
const menuOpen = ref(false)
const lastAction = ref('')
</script>

<template>
  <NeuThemeProvider :mode="dark ? 'dark' : 'light'">
    <main class="neu-page min-h-screen p-6 md:p-12">
      <NeuNavbar position="sticky" class="mx-auto mb-10 max-w-5xl">
        <template #brand><strong>Neumorphism UI</strong></template>
        <span class="text-sm text-[var(--neu-text-muted)]">Vite + Vue playground</span>
        <template #actions>
          <NeuDropdown v-model:open="menuOpen">
            <template #trigger>
              <NeuButton size="sm">
                Menu
              </NeuButton>
            </template>
            <NeuDropdownItem @select="lastAction = 'profile'">
              Profile
            </NeuDropdownItem>
            <NeuDropdownItem @select="lastAction = 'settings'">
              Settings
            </NeuDropdownItem>
          </NeuDropdown>
          <NeuSwitch v-model="dark" label="Dark" />
        </template>
      </NeuNavbar>

      <NeuCard surface="convex" class="mx-auto max-w-5xl">
        <NeuTabs
          v-model="tab"
          :items="[
            { value: 'form', label: 'Form' },
            { value: 'status', label: 'Status' },
          ]"
        >
          <template #form>
            <div class="grid gap-6 py-6 md:grid-cols-2">
              <NeuInput v-model="name" label="名称" placeholder="Healock" />
              <NeuInput v-model="password" label="密码" type="password" autocomplete="current-password" />
              <NeuButton variant="primary">保存</NeuButton>
            </div>
          </template>
          <template #status>
            <div class="grid gap-6 py-6">
              <NeuAlert title="Ready">组件库已加载。</NeuAlert>
              <p v-if="lastAction" aria-live="polite">
                Selected: {{ lastAction }}
              </p>
              <NeuProgress :value="68" label="Build" />
              <NeuPagination v-model:page="page" :total="100" />
            </div>
          </template>
        </NeuTabs>
      </NeuCard>
    </main>
  </NeuThemeProvider>
</template>
