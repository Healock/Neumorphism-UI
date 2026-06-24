import { createGenerator } from '@unocss/core'
import { presetWind4 } from 'unocss'
import { describe, expect, it } from 'vitest'
import { presetNeumorphism } from '../src/preset'

describe('presetNeumorphism', () => {
  it('generates surfaces, shadows, radii, and shortcuts', async () => {
    const uno = await createGenerator({
      presets: [presetWind4(), presetNeumorphism()],
    })
    const result = await uno.generate(
      'neu-surface-convex neu-shadow-lg neu-radius-round neu-card neu-focus',
    )

    expect(result.css).toContain('var(--neu-gradient-convex)')
    expect(result.css).toContain('var(--neu-shadow-lg)')
    expect(result.css).toContain('var(--neu-radius-round)')
    expect(result.matched).toContain('neu-card')
    expect(result.matched).toContain('neu-focus')
  })

  it('supports a custom class prefix', async () => {
    const uno = await createGenerator({
      presets: [presetNeumorphism({ prefix: 'soft-' })],
    })
    const result = await uno.generate('soft-surface-inset')

    expect(result.matched).toContain('soft-surface-inset')
    expect(result.css).toContain('var(--neu-shadow-inset)')
  })
})
