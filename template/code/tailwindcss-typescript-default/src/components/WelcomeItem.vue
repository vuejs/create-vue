<template>
  <div
    class="item mt-8 flex relative lg:mt-0 lg:py-2 lg:pl-20 lg:pb-4 before:lg:content-[''] before:lg:border-l before:lg:border-gray-300 before:lg:dark:border-gray-600 before:lg:absolute before:lg:left-0 before:lg:bottom-[calc(50%+25px)] before:lg:h-[calc(50%-25px)] after:lg:content-[''] after:lg:border-l after:lg:border-gray-300 after:lg:dark:border-gray-600 after:lg:absolute after:lg:left-0 after:lg:top-[calc(50%+25px)] after:lg:h-[calc(50%-25px)] first:before:lg:hidden last:after:lg:hidden"
  >
    <i
      class="flex items-center justify-center w-8 h-8 text-slate-800 dark:text-gray-200 lg:absolute lg:top-[calc(50%-25px)] lg:left-[-26px] lg:border lg:border-gray-300 lg:dark:border-gray-600 lg:bg-white lg:dark:bg-gray-900 lg:rounded-lg lg:w-12 lg:h-12"
    >
      <slot name="icon"></slot>
    </i>
    <div class="details flex-1 ml-4">
      <h3 class="text-xl font-medium mb-2 text-slate-800 dark:text-white">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>
