import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  type ComputedRef,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue'

export type NeuThemeMode = 'light' | 'dark' | 'system'

export interface NeuThemeTokens {
  background?: string
  surfaceLight?: string
  surfaceDark?: string
  text?: string
  textMuted?: string
  primary?: string
  onPrimary?: string
  danger?: string
  warning?: string
  info?: string
  radiusSm?: string
  radiusMd?: string
  radiusLg?: string
}

interface NeuThemeContext {
  mode: Ref<NeuThemeMode>
  resolvedMode: ComputedRef<'light' | 'dark'>
  setMode: (mode: NeuThemeMode) => void
}

const themeKey: InjectionKey<NeuThemeContext> = Symbol('NeuTheme')

const tokenMap: Record<keyof NeuThemeTokens, string> = {
  background: '--neu-bg',
  surfaceLight: '--neu-surface-light',
  surfaceDark: '--neu-surface-dark',
  text: '--neu-text',
  textMuted: '--neu-text-muted',
  primary: '--neu-primary',
  onPrimary: '--neu-on-primary',
  danger: '--neu-danger',
  warning: '--neu-warning',
  info: '--neu-info',
  radiusSm: '--neu-radius-sm',
  radiusMd: '--neu-radius-md',
  radiusLg: '--neu-radius-lg',
}

export const NeuThemeProvider = defineComponent({
  name: 'NeuThemeProvider',
  inheritAttrs: false,
  props: {
    mode: {
      type: String as PropType<NeuThemeMode>,
      default: 'system',
    },
    tokens: {
      type: Object as PropType<NeuThemeTokens>,
      default: () => ({}),
    },
    applyToRoot: {
      type: Boolean,
      default: true,
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
  emits: ['update:mode'],
  setup(props, { attrs, emit, slots }) {
    const mode = ref<NeuThemeMode>(props.mode)
    const systemDark = ref(false)
    let media: MediaQueryList | undefined
    let syncMedia: (() => void) | undefined
    let previousTheme: string | null = null
    const previousTokens = new Map<string, string>()
    const appliedTokens = new Set<string>()

    const resolvedMode = computed<'light' | 'dark'>(() =>
      mode.value === 'system' ? (systemDark.value ? 'dark' : 'light') : mode.value,
    )

    const setMode = (next: NeuThemeMode) => {
      mode.value = next
      emit('update:mode', next)
    }

    const applyRoot = () => {
      if (!props.applyToRoot || typeof document === 'undefined') return
      const root = document.documentElement
      root.dataset.neuTheme = resolvedMode.value
      for (const property of appliedTokens) {
        const key = Object.entries(tokenMap).find(([, value]) => value === property)?.[0] as keyof NeuThemeTokens | undefined
        if (key && !props.tokens[key]) {
          const previousValue = previousTokens.get(property)
          if (previousValue) root.style.setProperty(property, previousValue)
          else root.style.removeProperty(property)
          appliedTokens.delete(property)
        }
      }
      for (const [key, value] of Object.entries(props.tokens)) {
        if (value) {
          const property = tokenMap[key as keyof NeuThemeTokens]
          root.style.setProperty(property, value)
          appliedTokens.add(property)
        }
      }
    }

    watch(() => props.mode, value => { mode.value = value })
    watch([resolvedMode, () => props.tokens], applyRoot, { deep: true })

    onMounted(() => {
      if (props.applyToRoot && typeof document !== 'undefined') {
        previousTheme = document.documentElement.getAttribute('data-neu-theme')
        for (const property of Object.values(tokenMap)) {
          previousTokens.set(property, document.documentElement.style.getPropertyValue(property))
        }
      }
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        media = window.matchMedia('(prefers-color-scheme: dark)')
        syncMedia = () => {
          systemDark.value = media?.matches ?? false
          applyRoot()
        }
        syncMedia()
        media.addEventListener?.('change', syncMedia)
      }
      applyRoot()
    })

    onBeforeUnmount(() => {
      if (media && syncMedia) media.removeEventListener?.('change', syncMedia)
      if (props.applyToRoot && typeof document !== 'undefined') {
        const root = document.documentElement
        if (previousTheme === null) root.removeAttribute('data-neu-theme')
        else root.setAttribute('data-neu-theme', previousTheme)
        for (const [property, value] of previousTokens) {
          if (value) root.style.setProperty(property, value)
          else root.style.removeProperty(property)
        }
      }
    })

    provide(themeKey, { mode, resolvedMode, setMode })

    return () => h(
      props.tag,
      {
        ...attrs,
        class: ['neu-theme-provider', attrs.class],
        'data-neu-theme': resolvedMode.value,
      },
      slots.default?.(),
    )
  },
})

export function useNeuTheme(): NeuThemeContext {
  const context = inject(themeKey)
  if (!context) {
    throw new Error('useNeuTheme() must be used inside <NeuThemeProvider>.')
  }
  return context
}
