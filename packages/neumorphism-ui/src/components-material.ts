import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type PropType,
} from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

type Size = 'sm' | 'md' | 'lg'

const sizeProp = {
  type: String as PropType<Size>,
  default: 'md',
}

const cssSize = (value: string | number | undefined) => {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

export interface NeuNavItem {
  value: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  current?: boolean
}

export interface NeuFabAction {
  value: string
  label: string
  icon?: string
  disabled?: boolean
}

export const NeuAppBar = defineComponent({
  name: 'NeuAppBar',
  inheritAttrs: false,
  props: {
    title: String,
    subtitle: String,
    position: { type: String as PropType<'static' | 'sticky' | 'fixed'>, default: 'static' },
    dense: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () => h('header', {
      ...attrs,
      class: [
        'neu-app-bar',
        `neu-app-bar--${props.position}`,
        { 'neu-app-bar--dense': props.dense },
        attrs.class,
      ],
    }, [
      slots.leading && h('div', { class: 'neu-app-bar__leading' }, slots.leading()),
      h('div', { class: 'neu-app-bar__text' }, [
        props.title && h('strong', { class: 'neu-app-bar__title' }, props.title),
        props.subtitle && h('span', { class: 'neu-app-bar__subtitle' }, props.subtitle),
        slots.default?.(),
      ]),
      slots.actions && h('div', { class: 'neu-app-bar__actions' }, slots.actions()),
    ])
  },
})

export const NeuBottomAppBar = defineComponent({
  name: 'NeuBottomAppBar',
  inheritAttrs: false,
  props: {
    position: { type: String as PropType<'static' | 'sticky' | 'fixed'>, default: 'static' },
    label: { type: String, default: 'Bottom app bar' },
  },
  setup(props, { attrs, slots }) {
    return () => h('footer', {
      ...attrs,
      class: ['neu-bottom-app-bar', `neu-bottom-app-bar--${props.position}`, attrs.class],
      'aria-label': props.label,
    }, [
      h('div', { class: 'neu-bottom-app-bar__actions' }, slots.default?.()),
      slots.actions && h('div', { class: 'neu-bottom-app-bar__actions' }, slots.actions()),
      slots.fab && h('div', { class: 'neu-bottom-app-bar__fab' }, slots.fab()),
    ])
  },
})

export const NeuNavigationBar = defineComponent({
  name: 'NeuNavigationBar',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<NeuNavItem[]>, default: () => [] },
    modelValue: String,
    label: { type: String, default: 'Bottom navigation' },
    position: { type: String as PropType<'static' | 'sticky' | 'fixed'>, default: 'static' },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit }) {
    const isCurrent = (item: NeuNavItem) =>
      props.modelValue === undefined ? Boolean(item.current) : props.modelValue === item.value

    return () => h('nav', {
      ...attrs,
      class: ['neu-navigation-bar', `neu-navigation-bar--${props.position}`, attrs.class],
      'aria-label': props.label,
    }, props.items.map(item => {
      const current = isCurrent(item)
      return h('button', {
        key: item.value,
        type: 'button',
        class: ['neu-navigation-bar__item', { 'is-active': current }],
        disabled: item.disabled,
        'aria-current': current ? 'page' : undefined,
        onClick: () => {
          if (item.disabled) return
          emit('update:modelValue', item.value)
          emit('select', item)
        },
      }, [
        h('span', { class: 'neu-navigation-bar__icon', 'aria-hidden': 'true' }, item.icon ?? '•'),
        item.badge !== undefined && h('span', { class: 'neu-navigation-bar__badge' }, String(item.badge)),
        h('span', { class: 'neu-navigation-bar__label' }, item.label),
      ])
    }))
  },
})

export const NeuTabBar = defineComponent({
  name: 'NeuTabBar',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<NeuNavItem[]>, default: () => [] },
    modelValue: String,
    label: { type: String, default: 'Tabs' },
    scrollable: Boolean,
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit }) {
    const isCurrent = (item: NeuNavItem) =>
      props.modelValue === undefined ? Boolean(item.current) : props.modelValue === item.value
    const listEl = ref<HTMLElement | null>(null)
    const itemEls: HTMLElement[] = []
    const indicatorStyle = ref<Record<string, string>>({
      width: '0px',
      transform: 'translateX(0)',
      opacity: '0',
    })
    let resizeObserver: ResizeObserver | undefined

    const syncIndicator = () => {
      const active = itemEls[props.items.findIndex(isCurrent)]
      if (!active || !active.offsetWidth) return
      const width = Math.min(44, Math.max(18, active.offsetWidth * 0.32))
      indicatorStyle.value = {
        width: `${width}px`,
        transform: `translateX(${active.offsetLeft + (active.offsetWidth - width) / 2}px)`,
        opacity: '1',
      }
    }

    onMounted(() => {
      syncIndicator()
      requestAnimationFrame(syncIndicator)
      if (typeof ResizeObserver !== 'undefined' && listEl.value) {
        resizeObserver = new ResizeObserver(syncIndicator)
        resizeObserver.observe(listEl.value)
      }
      window.addEventListener('resize', syncIndicator)
    })
    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', syncIndicator)
    })
    watch([() => props.modelValue, () => props.items.length], async () => {
      await nextTick()
      syncIndicator()
    })

    return () => h('nav', {
      ...attrs,
      class: ['neu-tab-bar', { 'neu-tab-bar--scrollable': props.scrollable }, attrs.class],
      'aria-label': props.label,
    }, h('div', { class: 'neu-tab-bar__list', ref: listEl }, [
      h('span', {
        class: 'neu-tab-bar__indicator',
        'aria-hidden': 'true',
        style: indicatorStyle.value,
      }),
      ...props.items.map((item, index) => {
        const current = isCurrent(item)
        return h('button', {
          key: item.value,
          ref: (el: unknown) => {
            if (el) itemEls[index] = el as HTMLElement
          },
          type: 'button',
          class: ['neu-tab-bar__item', { 'is-active': current }],
          disabled: item.disabled,
          'aria-current': current ? 'page' : undefined,
          onClick: () => {
            if (item.disabled) return
            emit('update:modelValue', item.value)
            emit('select', item)
          },
        }, [
          item.icon && h('span', { class: 'neu-tab-bar__icon', 'aria-hidden': 'true' }, item.icon),
          h('span', {}, item.label),
        ])
      }),
    ]))
  },
})

export const NeuNavigationRail = defineComponent({
  name: 'NeuNavigationRail',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<NeuNavItem[]>, default: () => [] },
    modelValue: String,
    label: { type: String, default: 'Navigation rail' },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit, slots }) {
    const isCurrent = (item: NeuNavItem) =>
      props.modelValue === undefined ? Boolean(item.current) : props.modelValue === item.value

    return () => h('nav', {
      ...attrs,
      class: ['neu-navigation-rail', attrs.class],
      'aria-label': props.label,
    }, [
      h('div', { class: 'neu-navigation-rail__items' }, props.items.map(item => {
        const current = isCurrent(item)
        return h('button', {
          key: item.value,
          type: 'button',
          class: ['neu-navigation-rail__item', { 'is-active': current }],
          disabled: item.disabled,
          'aria-current': current ? 'page' : undefined,
          onClick: () => {
            if (item.disabled) return
            emit('update:modelValue', item.value)
            emit('select', item)
          },
        }, [
          h('span', { class: 'neu-navigation-rail__icon', 'aria-hidden': 'true' }, item.icon ?? '•'),
          h('span', { class: 'neu-navigation-rail__label' }, item.label),
        ])
      })),
      slots.fab && h('div', { class: 'neu-navigation-rail__fab' }, slots.fab()),
    ])
  },
})

export const NeuNavigationDrawer = defineComponent({
  name: 'NeuNavigationDrawer',
  inheritAttrs: false,
  props: {
    open: Boolean,
    items: { type: Array as PropType<NeuNavItem[]>, default: () => [] },
    modelValue: String,
    title: { type: String, default: '导航' },
    description: String,
    side: { type: String as PropType<'left' | 'right'>, default: 'left' },
    closeOnSelect: { type: Boolean, default: true },
    label: { type: String, default: 'Navigation drawer' },
  },
  emits: ['update:open', 'update:modelValue', 'select'],
  setup(props, { attrs, emit, slots }) {
    const isCurrent = (item: NeuNavItem) =>
      props.modelValue === undefined ? Boolean(item.current) : props.modelValue === item.value

    return () => h(DialogRoot, {
      open: props.open,
      'onUpdate:open': (open: boolean) => emit('update:open', open),
    }, {
      default: () => [
        slots.trigger && h(DialogTrigger, { asChild: true }, () => slots.trigger?.()),
        h(DialogPortal, {}, () => [
          h(DialogOverlay, { class: 'neu-drawer__overlay' }),
          h(DialogContent, {
            ...attrs,
            class: ['neu-drawer__panel', `neu-drawer__panel--${props.side}`, attrs.class],
            'aria-label': props.label,
          }, {
            default: () => [
              h('div', { class: 'neu-drawer__head' }, [
                h('div', {}, [
                  h(DialogTitle, { class: 'neu-drawer__title' }, () => props.title),
                  props.description
                    ? h(DialogDescription, { class: 'neu-drawer__description' }, () => props.description)
                    : h(DialogDescription, { class: 'neu-sr-only' }, () => 'Navigation menu'),
                ]),
                h(DialogClose, { asChild: true }, () => h('button', {
                  type: 'button',
                  class: 'neu-drawer__close',
                  'aria-label': 'Close navigation',
                }, '×')),
              ]),
              h('nav', { class: 'neu-drawer__nav', 'aria-label': props.label }, props.items.map(item => {
                const current = isCurrent(item)
                return h('button', {
                  key: item.value,
                  type: 'button',
                  class: ['neu-drawer__item', { 'is-active': current }],
                  disabled: item.disabled,
                  'aria-current': current ? 'page' : undefined,
                  onClick: () => {
                    if (item.disabled) return
                    emit('update:modelValue', item.value)
                    emit('select', item)
                    if (props.closeOnSelect) emit('update:open', false)
                  },
                }, [
                  h('span', { class: 'neu-drawer__icon', 'aria-hidden': 'true' }, item.icon ?? '•'),
                  h('span', { class: 'neu-drawer__label' }, item.label),
                  item.badge !== undefined && h('span', { class: 'neu-drawer__badge' }, String(item.badge)),
                ])
              })),
              slots.default?.(),
            ],
          }),
        ]),
      ],
    })
  },
})

export const NeuSearchBar = defineComponent({
  name: 'NeuSearchBar',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '搜索' },
    label: { type: String, default: 'Search' },
    disabled: Boolean,
    name: String,
    id: String,
    clearable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'submit', 'clear'],
  setup(props, { attrs, emit, slots }) {
    const id = props.id || `neu-search-${useId()}`

    return () => h('form', {
      ...attrs,
      class: ['neu-search-bar', attrs.class],
      role: 'search',
      onSubmit: (event: Event) => {
        event.preventDefault()
        emit('submit', props.modelValue)
      },
    }, [
      h('label', { class: 'neu-sr-only', for: id }, props.label),
      h('span', { class: 'neu-search-bar__icon', 'aria-hidden': 'true' }, '⌕'),
      h('input', {
        id,
        name: props.name,
        type: 'search',
        value: props.modelValue,
        placeholder: props.placeholder,
        disabled: props.disabled,
        class: 'neu-search-bar__input',
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
      }),
      props.clearable && props.modelValue && h('button', {
        type: 'button',
        class: 'neu-search-bar__clear',
        'aria-label': 'Clear search',
        onClick: () => {
          emit('update:modelValue', '')
          emit('clear')
        },
      }, '×'),
      slots.actions?.(),
      h('button', { type: 'submit', class: 'neu-search-bar__submit', 'aria-label': 'Search' }, '↵'),
    ])
  },
})

export const NeuFab = defineComponent({
  name: 'NeuFab',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    actions: { type: Array as PropType<NeuFabAction[]>, default: () => [] },
    label: { type: String, default: 'Actions' },
    size: sizeProp,
    disabled: Boolean,
    fixed: Boolean,
    closeOnSelect: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit, slots }) {
    const wheelId = `neu-fab-wheel-${useId()}`
    const angle = (index: number) => -90 + (360 / Math.max(props.actions.length, 1)) * index

    return () => h('div', {
      ...attrs,
      class: [
        'neu-fab',
        `neu-size--${props.size}`,
        { 'is-open': props.modelValue, 'neu-fab--fixed': props.fixed },
        attrs.class,
      ],
    }, [
      h('div', {
        id: wheelId,
        class: 'neu-fab__wheel',
        role: 'menu',
        'aria-label': props.label,
        'aria-hidden': !props.modelValue,
      }, props.actions.map((action, index) => h('button', {
        key: action.value,
        type: 'button',
        role: 'menuitem',
        class: 'neu-fab__action',
        style: {
          '--neu-fab-angle': `${angle(index)}deg`,
          '--neu-fab-index': String(index),
        },
        disabled: action.disabled,
        tabindex: props.modelValue ? 0 : -1,
        'aria-label': action.label,
        onClick: () => {
          if (action.disabled) return
          emit('select', action)
          if (props.closeOnSelect) emit('update:modelValue', false)
        },
      }, [
        h('span', { class: 'neu-fab__action-icon', 'aria-hidden': 'true' }, action.icon ?? '•'),
        h('span', { class: 'neu-fab__action-label' }, action.label),
      ]))),
      h('button', {
        type: 'button',
        class: 'neu-fab__trigger',
        disabled: props.disabled,
        'aria-label': props.modelValue ? '关闭操作' : props.label,
        'aria-expanded': props.modelValue,
        'aria-controls': wheelId,
        'aria-haspopup': 'menu',
        onClick: () => {
          if (!props.disabled) emit('update:modelValue', !props.modelValue)
        },
      }, [
        slots.default?.() ?? h('span', { class: 'neu-fab__plus', 'aria-hidden': 'true' }, '+'),
      ]),
    ])
  },
})

export const NeuSnackbar = defineComponent({
  name: 'NeuSnackbar',
  inheritAttrs: false,
  props: {
    open: Boolean,
    message: { type: String, required: true },
    actionLabel: String,
    timeout: { type: Number, default: 4000 },
    position: { type: String as PropType<'center' | 'start' | 'end'>, default: 'center' },
    closeLabel: { type: String, default: '关闭提示' },
  },
  emits: ['update:open', 'action', 'close'],
  setup(props, { attrs, emit }) {
    let timer: ReturnType<typeof setTimeout> | undefined
    const clear = () => {
      if (timer) clearTimeout(timer)
      timer = undefined
    }
    const schedule = () => {
      clear()
      if (!props.open || props.timeout <= 0) return
      timer = setTimeout(() => emit('update:open', false), props.timeout)
    }
    watch(() => props.open, schedule, { immediate: true })
    onBeforeUnmount(clear)

    return () => props.open ? h('div', {
      ...attrs,
      class: ['neu-snackbar', `neu-snackbar--${props.position}`, attrs.class],
      role: 'status',
      'aria-live': 'polite',
    }, [
      h('span', { class: 'neu-snackbar__message' }, props.message),
      props.actionLabel && h('button', {
        type: 'button',
        class: 'neu-snackbar__action',
        onClick: () => {
          emit('action')
          emit('update:open', false)
        },
      }, props.actionLabel),
      h('button', {
        type: 'button',
        class: 'neu-snackbar__close',
        'aria-label': props.closeLabel,
        onClick: () => {
          emit('update:open', false)
          emit('close')
        },
      }, '×'),
    ]) : null
  },
})

export const NeuChip = defineComponent({
  name: 'NeuChip',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<'assist' | 'filter' | 'input'>, default: 'assist' },
    selected: Boolean,
    removable: Boolean,
    disabled: Boolean,
  },
  emits: ['click', 'remove', 'update:selected'],
  setup(props, { attrs, emit, slots }) {
    const body = () => h('button', {
      type: 'button',
      class: 'neu-chip__body',
      disabled: props.disabled,
      'aria-pressed': props.variant === 'filter' ? props.selected : undefined,
      onClick: (event: MouseEvent) => {
        if (props.disabled) return
        emit('click', event)
        if (props.variant === 'filter') emit('update:selected', !props.selected)
      },
    }, [
      slots.icon?.(),
      h('span', { class: 'neu-chip__label' }, slots.default?.()),
    ])

    return () => h('span', {
      ...attrs,
      class: [
        'neu-chip',
        `neu-chip--${props.variant}`,
        { 'is-selected': props.selected, 'is-disabled': props.disabled },
        attrs.class,
      ],
    }, [
      body(),
      props.removable && h('button', {
        type: 'button',
        class: 'neu-chip__remove',
        'aria-label': 'Remove',
        disabled: props.disabled,
        onClick: () => emit('remove'),
      }, '×'),
    ])
  },
})

export const NeuBottomSheet = defineComponent({
  name: 'NeuBottomSheet',
  inheritAttrs: false,
  props: {
    open: Boolean,
    title: String,
    description: String,
    closeLabel: { type: String, default: 'Close sheet' },
  },
  emits: ['update:open'],
  setup(props, { attrs, emit, slots }) {
    return () => h(DialogRoot, {
      open: props.open,
      'onUpdate:open': (open: boolean) => emit('update:open', open),
    }, {
      default: () => [
        slots.trigger && h(DialogTrigger, { asChild: true }, () => slots.trigger?.()),
        h(DialogPortal, {}, () => [
          h(DialogOverlay, { class: 'neu-sheet__overlay' }),
          h(DialogContent, {
            ...attrs,
            class: ['neu-sheet', attrs.class],
          }, {
            default: () => [
              h('div', { class: 'neu-sheet__handle', 'aria-hidden': 'true' }),
              h('div', { class: 'neu-sheet__head' }, [
                h('div', {}, [
                  h(DialogTitle, { class: 'neu-sheet__title' }, () => props.title || 'Details'),
                  props.description
                    ? h(DialogDescription, { class: 'neu-sheet__description' }, () => props.description)
                    : h(DialogDescription, { class: 'neu-sr-only' }, () => 'Sheet content'),
                ]),
                h(DialogClose, { asChild: true }, () => h('button', {
                  type: 'button',
                  class: 'neu-sheet__close',
                  'aria-label': props.closeLabel,
                }, '×')),
              ]),
              h('div', { class: 'neu-sheet__body' }, slots.default?.()),
              slots.footer && h('div', { class: 'neu-sheet__footer' }, slots.footer()),
            ],
          }),
        ]),
      ],
    })
  },
})

export const NeuCircularProgress = defineComponent({
  name: 'NeuCircularProgress',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    size: { type: [Number, String], default: 96 },
    stroke: { type: Number, default: 8 },
    label: String,
    showValue: { type: Boolean, default: true },
    indeterminate: Boolean,
  },
  setup(props, { attrs, slots }) {
    const clamped = computed(() => Math.max(0, Math.min(props.max, props.value)))
    const percent = computed(() => (clamped.value / Math.max(props.max, 1)) * 100)
    const radius = computed(() => 42 - props.stroke / 2)
    const circumference = computed(() => 2 * Math.PI * radius.value)
    const offset = computed(() => circumference.value * (1 - percent.value / 100))

    return () => h('div', {
      ...attrs,
      class: ['neu-circular-progress', { 'is-indeterminate': props.indeterminate }, attrs.class],
      style: [{ '--neu-circular-size': cssSize(props.size) }, attrs.style],
      role: 'progressbar',
      'aria-label': props.label,
      'aria-valuemin': 0,
      'aria-valuemax': props.max,
      'aria-valuenow': props.indeterminate ? undefined : clamped.value,
    }, [
      h('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, [
        h('circle', { class: 'neu-circular-progress__track', cx: 50, cy: 50, r: radius.value, 'stroke-width': props.stroke }),
        h('circle', {
          class: 'neu-circular-progress__value',
          cx: 50,
          cy: 50,
          r: radius.value,
          'stroke-width': props.stroke,
          'stroke-dasharray': circumference.value,
          'stroke-dashoffset': props.indeterminate ? undefined : offset.value,
        }),
      ]),
      h('span', { class: 'neu-circular-progress__label' }, slots.default?.() ?? (props.showValue ? `${Math.round(percent.value)}%` : '')),
    ])
  },
})
