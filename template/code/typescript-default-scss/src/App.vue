<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped lang="scss">
$height: 1.5;

header {
  line-height: $height;
  @media (min-width: 1024px) {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    .wrapper {
      display: flex;
      place-items: flex-start;
      flex-wrap: wrap;
    }
  }
}

.logo {
  display: block;
  margin: 0 auto 2rem;
  @media (min-width: 1024px) {
    .logo {
      margin: 0 2rem 0 0;
    }
  }
}
</style>
