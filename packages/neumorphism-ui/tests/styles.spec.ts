import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = resolve(__dirname, '../src/styles')

describe('style entrypoints', () => {
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
})
