import { it, describe, expect } from 'vitest'
import getCommand from '../utils/getCommand'

describe("should generate correct command", () => {
    const template = {
        packageManager: ["pnpm", "yarn", "npm"],
        commands: ["install", "dev", "build"],
        correct: ["pnpm install", "pnpm dev", "pnpm build", "yarn", "yarn dev", "yarn build", "npm install", "npm run dev", "npm run build"]
    }
    template.packageManager.forEach((manager) => {
        template.commands.forEach((command) => {
            it(`packageManager: ${manager}, command: ${command}`, () => {
                expect(getCommand(manager, command)).satisfy((generatedCommand) => {
                    return template.correct.includes(generatedCommand)
                })
            })
        })
    })
})