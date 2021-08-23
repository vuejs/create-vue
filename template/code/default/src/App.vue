<script setup>
import HelloWorld from './components/HelloWorld.vue'
import IntroductionItem from './components/IntroductionItem.vue'
import ColorSchemeSwitch from './components/ColorSchemeSwitch.vue'

import DocumentationIcon from './components/icons/IconDocumentation.vue'
import ToolingIcon from './components/icons/IconTooling.vue'
import EcosystemIcon from './components/icons/IconEcosystem.vue'
import CommunityIcon from './components/icons/IconCommunity.vue'
import SupportIcon from './components/icons/IconSupport.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
      <ColorSchemeSwitch />
    </div>
  </header>

  <main>
    <IntroductionItem>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>Documentation</template>

      Widely regarded as one of the best, Vue’s
      <a target="_blank" href="https://v3.vuejs.org/">official documentation</a>
      will provide you with all information you need to get started. Whether you’re already a Vue
      veteran or just trying the framework out, great chances are you’ll find the answer to your
      next question there.
    </IntroductionItem>

    <IntroductionItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>Tooling</template>

      This project is served and bundled with
      <a href="https://vitejs.dev/guide/features.html" target="_blank">Vite</a>. The recommended IDE
      setup is <a href="https://code.visualstudio.com/" target="_blank">VSCode</a> +
      <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>. If you need to
      test your components and web pages, check out
      <a href="https://www.cypress.io/" target="_blank">Cypress</a> and
      <a href="https://docs.cypress.io/guides/component-testing/introduction" target="_blank"
        >Cypress Component Testing</a
      >.

      <br />

      More instructions are available in <code>README.md</code>.
    </IntroductionItem>

    <IntroductionItem>
      <template #icon>
        <EcosystemIcon />
      </template>
      <template #heading>Ecosystem</template>

      Get official tools and libraries for your project:
      <a target="_blank" href="https://next.vuex.vuejs.org/">Vuex</a>,
      <a target="_blank" href="https://next.router.vuejs.org/">Vue Router</a>,
      <a target="_blank" href="https://next.vue-test-utils.vuejs.org/">Vue Test Utils</a>, and
      <a target="_blank" href="https://github.com/vuejs/devtools">Vue Dev Tools</a>. If you need
      more resources, we suggest paying
      <a target="_blank" href="https://github.com/vuejs/awesome-vue">Awesome Vue</a>
      a visit.
    </IntroductionItem>

    <IntroductionItem>
      <template #icon>
        <CommunityIcon />
      </template>
      <template #heading>Community</template>

      Got stuck? Ask your question on
      <a target="_blank" href="https://chat.vuejs.org">Vue Land</a>, our official Discord server, or
      <a target="_blank" href="https://stackoverflow.com/questions/tagged/vue.js">StackOverflow</a>.
      You should also subscribe to
      <a target="_blank" href="https://news.vuejs.org">our mailing list</a> for latest news in the
      Vue world.
    </IntroductionItem>

    <IntroductionItem>
      <template #icon>
        <SupportIcon />
      </template>
      <template #heading>Support Vue</template>

      As an independent project, Vue relies on community backing for its sustainability. You can
      help us by
      <a target="_blank" href="https://vuejs.org/support-vuejs/">becoming a sponsor</a>.
    </IntroductionItem>
  </main>
</template>

<style>
@import './assets/base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;

  font-weight: normal;
}

header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }

  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 0 2rem;
  }

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
