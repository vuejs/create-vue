import { NightwatchCustomAssertions, NightwatchCustomCommands } from 'nightwatch'

declare module 'nightwatch' {
  interface NightwatchCustomAssertions {
    elementHasCount: (selector: string, count: number) => NightwatchBrowser
  }

  interface NightwatchCustomCommands {
    strictClick: (selector: string) => NightwatchBrowser
  }
}
