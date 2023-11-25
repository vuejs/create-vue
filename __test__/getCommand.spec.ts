import { it, describe, expect } from 'vitest'
import getCommand from '../utils/getCommand'

describe("should generate correct command", () => {
    it('for yarn', () => {
        expect(getCommand('yarn', 'install')).toBe('yarn')
        expect(getCommand('yarn', 'dev')).toBe('yarn dev')
        expect(getCommand('yarn', 'build')).toBe('yarn build')

    })
    it('for npm', () => {
        expect(getCommand('npm', 'install')).toBe('npm install')
        expect(getCommand('npm', 'dev')).toBe('npm run dev')
        expect(getCommand('npm', 'build')).toBe('npm run build')

    })
    it('for pnpm', () => {
        expect(getCommand('pnpm', 'install')).toBe('pnpm install')
        expect(getCommand('pnpm', 'dev')).toBe('pnpm dev')
        expect(getCommand('pnpm', 'build')).toBe('pnpm build')
    })
})