<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-200 transition-colors duration-500 font-sans text-sm leading-relaxed antialiased"
  >
    <div
      class="max-w-screen-xl mx-auto px-8 py-8 font-normal lg:flex lg:items-center lg:min-h-screen"
    >
      <header class="leading-6 max-h-screen lg:flex lg:items-center lg:pr-20">
        <img
          alt="Vue logo"
          class="logo block mx-auto mb-8 lg:mx-0 lg:mr-8 lg:mb-0"
          src="@/assets/logo.svg"
          width="125"
          height="125"
        />

        <div class="wrapper lg:flex lg:items-start lg:flex-wrap">
          <HelloWorld msg="You did it!" />

          <nav
            class="w-full text-xs text-center mt-8 lg:text-left lg:-ml-4 lg:text-base lg:py-4 lg:mt-4"
          >
            <RouterLink
              to="/"
              class="inline-block px-4 border-l border-gray-300 dark:border-gray-600 first:border-l-0 router-link-exact-active:text-slate-800 router-link-exact-active:dark:text-gray-200 router-link-exact-active:hover:bg-transparent"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/about"
              class="inline-block px-4 border-l border-gray-300 dark:border-gray-600 first:border-l-0 router-link-exact-active:text-slate-800 router-link-exact-active:dark:text-gray-200 router-link-exact-active:hover:bg-transparent"
            >
              About
            </RouterLink>
          </nav>
        </div>
      </header>

      <div class="lg:flex-1">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
/* Router link active styles need to be in CSS due to dynamic class application */
nav a.router-link-exact-active {
  @apply text-slate-800 dark:text-gray-200;
}

nav a.router-link-exact-active:hover {
  @apply bg-transparent;
}
</style>
