import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = resolve(__dirname, '../src/styles')
const cssEntries = [
  './tokens.css',
  './base.css',
  './core.css',
  './components.css',
  './utilities.css',
  './fonts.css',
  './fonts-block.css',
  './content.css',
  './highlight.css',
  './view-transition.css',
  './legacy.css',
  './style.css',
  './neu-ui.css',
]

describe('style entrypoints', () => {
  it('exposes modular CSS runtime entrypoints for non-Vue consumers', () => {
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8')) as {
      exports: Record<string, { default?: string }>
    }

    for (const entry of cssEntries) {
      expect(packageJson.exports).toHaveProperty(entry)
      const target = packageJson.exports[entry]?.default
      if (target === undefined) {
        throw new Error(`Missing CSS export target for ${entry}`)
      }
      expect(target).toBe(`./src/styles/${entry.slice(2)}`)
      expect(existsSync(resolve(__dirname, '..', target))).toBe(true)
    }

    expect(readFileSync(resolve(styles, 'core.css'), 'utf8')).toContain('@import "./utilities.css";')
    expect(readFileSync(resolve(styles, 'style.css'), 'utf8')).toContain('@import "./core.css";')
    expect(readFileSync(resolve(styles, 'neu-ui.css'), 'utf8')).toContain('@import "./legacy.css";')
  })

  it('keeps cascade layer boundaries explicit', () => {
    expect(readFileSync(resolve(styles, 'tokens.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.tokens \{/)
    expect(readFileSync(resolve(styles, 'base.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.base \{/)
    expect(readFileSync(resolve(styles, 'utilities.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.utilities \{/)
    expect(readFileSync(resolve(styles, 'components.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.components;/)
    expect(readFileSync(resolve(styles, 'content.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.content \{/)
    expect(readFileSync(resolve(styles, 'highlight.css'), 'utf8').trimStart()).toMatch(/^@layer neu\.highlight \{/)
    expect(readFileSync(resolve(styles, 'legacy.css'), 'utf8')).toContain('@layer neu.legacy {')
  })

  it('does not globally reset body, html, scrollbar, or every element', () => {
    const css = readFileSync(resolve(styles, 'components.css'), 'utf8')
    expect(css).not.toMatch(/(^|})\s*(body|html|\*)\s*{/m)
    expect(css).not.toContain('::-webkit-scrollbar')
    expect(css).not.toContain('outline: none')
  })

  it('scopes highlight.js selectors and supports browser autofill', () => {
    const highlight = readFileSync(resolve(styles, 'highlight.css'), 'utf8')
    const components = readFileSync(resolve(styles, 'components.css'), 'utf8')
    expect(highlight).toContain('.neu-highlight .hljs-comment')
    expect(components).toContain(':-webkit-autofill')
    expect(components).toContain(':autofill')
    expect(components).toContain('@media (forced-colors: active)')
    expect(components).toContain('box-shadow: none')
  })

  it('ships readable foreground tokens for both themes', () => {
    const tokens = readFileSync(resolve(styles, 'tokens.css'), 'utf8')
    expect(tokens).toContain('--neu-on-primary')
    expect(tokens).toContain('[data-neu-theme="dark"]')
    expect(tokens).toContain('--neu-text-muted: #b2bac8')
  })

  it('bridges the historical CSS contract for static HTML consumers', () => {
    const legacy = readFileSync(resolve(styles, 'legacy.css'), 'utf8')
    expect(legacy).toContain('--bg-color: var(--neu-bg)')
    expect(legacy).toContain('--text-main: var(--neu-text)')
    expect(legacy).toContain('--font-mono:')
    expect(legacy).toContain('html.dark')
    expect(legacy).toContain('body.dark-mode')
    expect(legacy).toContain('.neu-btn-sm')
    expect(legacy).toContain('.neu-dropdown-menu')
  })

  it('offers an optional root view transition stylesheet', () => {
    const transitions = readFileSync(resolve(styles, 'view-transition.css'), 'utf8')
    expect(transitions).toContain('@view-transition')
    expect(transitions).toContain('navigation: auto')
    expect(transitions).toContain('::view-transition-old(root)')
    expect(transitions).toContain('mix-blend-mode: normal')
  })
})
