import { NightwatchCustomAssertions, NightwatchCustomCommands } from 'nightwatch'

declare module 'nightwatch' {
  interface NightwatchCustomAssertions {
    // Add your custom assertions' types here
    // elementHasCount: (selector: string, count: number) => NightwatchBrowser
  }

  interface NightwatchCustomCommands {
    // Add your custom commands' types here
    // strictClick: (selector: string) => NightwatchBrowser
  }
}
