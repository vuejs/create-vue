import { it, describe, expect } from 'vitest'
import getCommand from '../utils/getCommand'

describe("should generate correct command", () => {
    it('for yarn', () => {
        expect(getCommand('yarn', 'install')).toBe('yarn')
        expect(getCommand('yarn', 'install')).toMatchSnapshot()
        expect(getCommand('yarn', 'dev')).toBe('yarn dev')
        expect(getCommand('yarn', 'dev')).toMatchSnapshot()
        expect(getCommand('yarn', 'build')).toBe('yarn build')
        expect(getCommand('yarn', 'build')).toMatchSnapshot()

    })
    it('for npm', () => {
        expect(getCommand('npm', 'install')).toBe('npm install')
        expect(getCommand('npm', 'install')).toMatchSnapshot()
        expect(getCommand('npm', 'dev')).toBe('npm run dev')
        expect(getCommand('npm', 'dev')).toMatchSnapshot()
        expect(getCommand('npm', 'build')).toBe('npm run build')
        expect(getCommand('npm', 'build')).toMatchSnapshot()

    })
    it('for pnpm', () => {
        expect(getCommand('pnpm', 'install')).toBe('pnpm install')
        expect(getCommand('pnpm', 'install')).toMatchSnapshot()
        expect(getCommand('pnpm', 'dev')).toBe('pnpm dev')
        expect(getCommand('pnpm', 'dev')).toMatchSnapshot()
        expect(getCommand('pnpm', 'build')).toBe('pnpm build')
        expect(getCommand('pnpm', 'build')).toMatchSnapshot()
    })
})