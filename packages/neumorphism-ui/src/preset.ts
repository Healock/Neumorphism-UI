import type { Preset, Rule, Shortcut } from '@unocss/core'

export interface PresetNeumorphismOptions {
  prefix?: string
}

export function presetNeumorphism(options: PresetNeumorphismOptions = {}): Preset {
  const prefix = options.prefix ?? 'neu-'
  const rules: Rule[] = [
    [new RegExp(`^${prefix}surface-(flat|convex|concave|inset|glass)$`), ([, surface]) => ({
      'background': surface === 'convex'
        ? 'var(--neu-gradient-convex)'
        : surface === 'concave'
          ? 'var(--neu-gradient-concave)'
          : surface === 'glass'
            ? 'var(--neu-bg-glass)'
            : 'var(--neu-bg)',
      'box-shadow': surface === 'inset'
        ? 'var(--neu-shadow-inset)'
        : surface === 'glass'
          ? 'var(--neu-shadow-float)'
          : 'var(--neu-shadow-md)',
      'backdrop-filter': surface === 'glass' ? 'blur(18px)' : undefined,
    })],
    [new RegExp(`^${prefix}shadow-(sm|md|lg|inset|float)$`), ([, size]) => ({
      'box-shadow': `var(--neu-shadow-${size})`,
    })],
    [new RegExp(`^${prefix}radius-(sm|md|lg|round)$`), ([, size]) => ({
      'border-radius': `var(--neu-radius-${size})`,
    })],
  ]

  const shortcuts: Shortcut[] = [
    [`${prefix}page`, 'min-h-screen bg-[var(--neu-bg)] text-[var(--neu-text)] font-[var(--neu-font-sans)]'],
    [`${prefix}focus`, 'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--neu-focus)]'],
    [`${prefix}card`, `${prefix}surface-flat ${prefix}radius-lg p-6`],
    [`${prefix}btn`, `${prefix}surface-flat ${prefix}radius-round ${prefix}focus inline-flex min-h-11 items-center justify-center px-6 py-3 font-600`],
  ]

  return {
    name: '@healock/neumorphism-ui',
    rules,
    shortcuts,
  }
}
