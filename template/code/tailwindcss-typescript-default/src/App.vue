<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-200 transition-colors duration-500 font-sans text-sm leading-relaxed antialiased"
  >
    <div
      class="max-w-screen-xl mx-auto px-8 py-8 font-normal lg:flex lg:items-center lg:min-h-screen"
    >
      <header class="leading-6 lg:flex lg:items-center lg:pr-20">
        <img
          alt="Vue logo"
          class="logo block mx-auto mb-8 lg:mx-0 lg:mr-8 lg:mb-0"
          src="./assets/logo.svg"
          width="125"
          height="125"
        />

        <div class="wrapper lg:flex lg:items-start lg:flex-wrap">
          <HelloWorld msg="You did it!" />
        </div>
      </header>

      <main class="lg:flex-1">
        <TheWelcome />
      </main>
    </div>
  </div>
</template>
