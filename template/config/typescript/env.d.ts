/// <reference types="vite/client" />

import type { ComponentPublicInstanceConstructor } from 'vue/types/v3-component-public-instance'

/**
 * patch for @vue/test-utils@1.x with Vue@2.7.x
 * @see https://github.com/vuejs/vue-test-utils/issues/2087#issuecomment-1919820059
 */
declare module '@vue/test-utils' {
  export function mount<T extends ComponentPublicInstanceConstructor>(
    originalComponent: T,
    options?: ThisTypedMountOptions<Vue>
  ): Wrapper<Vue>
}
