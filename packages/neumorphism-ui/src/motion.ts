import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  Transition,
  TransitionGroup,
  watch,
  type CSSProperties,
  type PropType,
} from 'vue'

export type NeuMotionPreset =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'blur'
  | 'slide'
  | 'slide-left'

export type NeuRevealPreset = 'fade' | 'up' | 'down' | 'left' | 'right' | 'scale' | 'blur'

type MotionTime = string | number

const durationAliases: Record<string, string> = {
  fast: 'var(--neu-duration-fast)',
  normal: 'var(--neu-duration-normal)',
  slow: 'var(--neu-duration-slow)',
}

const easeAliases: Record<string, string> = {
  spring: 'var(--neu-ease-spring)',
  out: 'var(--neu-ease-out)',
  'in-out': 'var(--neu-ease-in-out)',
  linear: 'linear',
}

function normalizeTime(value: MotionTime | undefined): string | undefined {
  if (value === undefined || value === null)
    return undefined

  if (typeof value === 'number')
    return `${value}ms`

  const trimmed = value.trim()
  if (durationAliases[trimmed])
    return durationAliases[trimmed]

  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}ms` : trimmed
}

function normalizeEase(value: string | undefined): string | undefined {
  if (!value)
    return undefined
  return easeAliases[value.trim()] ?? value
}

function motionStyle(duration?: MotionTime, delay?: MotionTime, ease?: string): CSSProperties {
  const style: Record<string, string> = {}
  const normalizedDuration = normalizeTime(duration)
  const normalizedDelay = normalizeTime(delay)
  const normalizedEase = normalizeEase(ease)

  if (normalizedDuration)
    style['--neu-motion-duration'] = normalizedDuration
  if (normalizedDelay)
    style['--neu-motion-delay'] = normalizedDelay
  if (normalizedEase)
    style['--neu-motion-ease'] = normalizedEase

  return style as CSSProperties
}

function applyMotionVars(
  element: Element,
  duration?: MotionTime,
  delay?: MotionTime,
  ease?: string,
) {
  if (!(element instanceof HTMLElement))
    return

  const style = motionStyle(duration, delay, ease)
  for (const [property, value] of Object.entries(style))
    element.style.setProperty(property, String(value))
}

/**
 * Tracks the user's reduced-motion preference. It is SSR-safe and can be used
 * outside a component; inside a component the media listener is cleaned up.
 */
export function useNeuReducedMotion() {
  const reduced = ref(false)
  let media: MediaQueryList | undefined

  const sync = () => {
    reduced.value = media?.matches ?? false
  }

  const instance = getCurrentInstance()

  if (instance && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    onMounted(() => {
      media = window.matchMedia('(prefers-reduced-motion: reduce)')
      sync()
      media.addEventListener?.('change', sync)
    })

    onBeforeUnmount(() => {
      media?.removeEventListener?.('change', sync)
    })
  }
  else if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  return reduced
}

export const NeuTransition = defineComponent({
  name: 'NeuTransition',
  props: {
    preset: {
      type: String as PropType<NeuMotionPreset>,
      default: 'fade',
    },
    duration: {
      type: [String, Number] as PropType<MotionTime>,
      default: undefined,
    },
    delay: {
      type: [String, Number] as PropType<MotionTime>,
      default: undefined,
    },
    ease: {
      type: String,
      default: undefined,
    },
    appear: Boolean,
    group: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
    mode: {
      type: String as PropType<'out-in' | 'in-out'>,
      default: 'out-in',
    },
  },
  setup(props, { slots }) {
    const name = computed(() => `neu-t-${props.preset}`)
    const hooks = {
      onBeforeEnter: (element: Element) => applyMotionVars(element, props.duration, props.delay, props.ease),
      onBeforeLeave: (element: Element) => applyMotionVars(element, props.duration, props.delay, props.ease),
      onBeforeAppear: (element: Element) => applyMotionVars(element, props.duration, props.delay, props.ease),
    }

    return () => props.group
      ? h(TransitionGroup, {
          name: name.value,
          tag: props.tag,
          css: true,
          appear: props.appear,
          ...hooks,
        }, slots.default)
      : h(Transition, {
          name: name.value,
          css: true,
          appear: props.appear,
          mode: props.mode,
          ...hooks,
        }, slots.default)
  },
})

export const NeuReveal = defineComponent({
  name: 'NeuReveal',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'div',
    },
    preset: {
      type: String as PropType<NeuRevealPreset>,
      default: 'up',
    },
    delay: {
      type: [String, Number] as PropType<MotionTime>,
      default: undefined,
    },
    duration: {
      type: [String, Number] as PropType<MotionTime>,
      default: undefined,
    },
    threshold: {
      type: Number,
      default: 0.15,
    },
    rootMargin: {
      type: String,
      default: '0px 0px -10% 0px',
    },
    once: {
      type: Boolean,
      default: true,
    },
    disabled: Boolean,
  },
  emits: ['reveal'],
  setup(props, { attrs, emit, slots }) {
    const element = ref<HTMLElement | null>(null)
    const visible = ref(false)
    const armed = ref(false)
    const reduced = useNeuReducedMotion()
    let observer: IntersectionObserver | undefined

    const disconnect = () => {
      observer?.disconnect()
      observer = undefined
    }

    const reveal = () => {
      if (visible.value)
        return
      visible.value = true
      emit('reveal')
      if (props.once)
        disconnect()
    }

    const start = () => {
      disconnect()

      if (props.disabled || reduced.value || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        visible.value = true
        return
      }

      const node = element.value
      if (!node)
        return

      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        visible.value = true
        return
      }

      armed.value = true
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            reveal()
          else if (!props.once && visible.value)
            visible.value = false
        }
      }, {
        threshold: props.threshold,
        rootMargin: props.rootMargin,
      })
      observer.observe(node)
    }

    onMounted(start)
    onBeforeUnmount(disconnect)
    watch([() => props.disabled, reduced], start)

    const style = computed(() => motionStyle(props.duration, props.delay))

    return () => h(props.as, {
      ...attrs,
      ref: element,
      class: [
        'neu-reveal',
        `neu-reveal--${props.preset}`,
        {
          'is-armed': armed.value,
          'is-visible': visible.value,
        },
        attrs.class,
      ],
      style: [style.value, attrs.style],
    }, slots.default?.())
  },
})
