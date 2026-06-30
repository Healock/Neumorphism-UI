import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  useId,
  type InjectionKey,
  type PropType,
} from 'vue'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from 'reka-ui'

type Size = 'sm' | 'md' | 'lg'
type Surface = 'flat' | 'convex' | 'concave' | 'inset' | 'glass'

const sizeProp = {
  type: String as PropType<Size>,
  default: 'md',
}

export const NeuButton = defineComponent({
  name: 'NeuButton',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<'default' | 'primary' | 'danger'>, default: 'default' },
    size: sizeProp,
    loading: Boolean,
    disabled: Boolean,
    href: String,
    target: String,
    rel: String,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    const content = () => [
      props.loading ? h('span', { class: 'neu-spinner', 'aria-hidden': 'true' }) : slots.icon?.(),
      h('span', { class: 'neu-btn__label' }, slots.default?.()),
    ]

    return () => {
      const isDisabled = props.disabled || props.loading
      const className = [
        'neu-btn',
        `neu-btn--${props.variant}`,
        `neu-size--${props.size}`,
        { 'is-disabled': isDisabled },
        attrs.class,
      ]

      const onClick = (event: MouseEvent) => {
        if (isDisabled) {
          event.preventDefault()
          event.stopPropagation()
          return
        }

        emit('click', event)
      }

      if (props.href) {
        const rel = props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined)

        return h('a', {
          ...attrs,
          href: isDisabled ? undefined : props.href,
          target: props.target,
          rel,
          class: className,
          'aria-busy': props.loading || undefined,
          'aria-disabled': isDisabled || undefined,
          tabindex: isDisabled ? -1 : attrs.tabindex,
          onClick,
        }, content())
      }

      return h('button', {
        ...attrs,
        type: props.type,
        disabled: isDisabled,
        class: className,
        'aria-busy': props.loading || undefined,
        onClick,
      }, content())
    }
  },
})

export const NeuCard = defineComponent({
  name: 'NeuCard',
  inheritAttrs: false,
  props: {
    surface: { type: String as PropType<Surface>, default: 'flat' },
    size: sizeProp,
    tag: { type: String, default: 'div' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.tag, {
      ...attrs,
      class: ['neu-card', `neu-surface--${props.surface}`, `neu-size--${props.size}`, attrs.class],
    }, slots.default?.())
  },
})

const fieldProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
  label: String,
  hint: String,
  error: String,
  disabled: Boolean,
  required: Boolean,
  name: String,
  id: String,
}

function fieldId(id: string | undefined, name: string | undefined, fallback: string) {
  return id || name || fallback
}

export const NeuInput = defineComponent({
  name: 'NeuInput',
  inheritAttrs: false,
  props: {
    ...fieldProps,
    type: { type: String, default: 'text' },
  },
  emits: ['update:modelValue', 'focus', 'blur', 'change'],
  setup(props, { attrs, emit, slots }) {
    const id = fieldId(props.id, props.name, `neu-input-${useId()}`)
    return () => h('label', { class: ['neu-field', { 'is-invalid': Boolean(props.error) }] }, [
      props.label && h('span', { class: 'neu-field__label' }, [
        props.label,
        props.required && h('span', { 'aria-hidden': 'true' }, ' *'),
      ]),
      h('span', { class: 'neu-input-wrap' }, [
        slots.prefix?.(),
        h('input', {
          ...attrs,
          id,
          name: props.name,
          type: props.type,
          value: props.modelValue,
          disabled: props.disabled,
          required: props.required,
          class: ['neu-input', attrs.class],
          'aria-invalid': props.error ? 'true' : undefined,
          'aria-describedby': props.error || props.hint ? `${id}-help` : undefined,
          onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
          onFocus: (event: FocusEvent) => emit('focus', event),
          onBlur: (event: FocusEvent) => emit('blur', event),
          onChange: (event: Event) => emit('change', event),
        }),
        slots.suffix?.(),
      ]),
      (props.error || props.hint) && h('span', {
        id: `${id}-help`,
        class: ['neu-field__help', { 'is-error': Boolean(props.error) }],
      }, props.error || props.hint),
    ])
  },
})

export const NeuTextarea = defineComponent({
  name: 'NeuTextarea',
  inheritAttrs: false,
  props: fieldProps,
  emits: ['update:modelValue', 'focus', 'blur', 'change'],
  setup(props, { attrs, emit }) {
    const id = fieldId(props.id, props.name, `neu-textarea-${useId()}`)
    return () => h('label', { class: ['neu-field', { 'is-invalid': Boolean(props.error) }] }, [
      props.label && h('span', { class: 'neu-field__label' }, props.label),
      h('textarea', {
        ...attrs,
        id,
        name: props.name,
        value: props.modelValue,
        disabled: props.disabled,
        required: props.required,
        class: ['neu-input', 'neu-textarea', attrs.class],
        'aria-invalid': props.error ? 'true' : undefined,
        'aria-describedby': props.error || props.hint ? `${id}-help` : undefined,
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value),
        onFocus: (event: FocusEvent) => emit('focus', event),
        onBlur: (event: FocusEvent) => emit('blur', event),
        onChange: (event: Event) => emit('change', event),
      }),
      (props.error || props.hint) && h('span', {
        id: `${id}-help`,
        class: ['neu-field__help', { 'is-error': Boolean(props.error) }],
      }, props.error || props.hint),
    ])
  },
})

function createToggle(name: string, type: 'checkbox' | 'radio') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      modelValue: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: false },
      value: { type: [String, Number, Boolean] as PropType<string | number | boolean>, default: true },
      label: String,
      disabled: Boolean,
      name: String,
    },
    emits: ['update:modelValue', 'change'],
    setup(props, { attrs, emit, slots }) {
      const checked = computed(() => type === 'checkbox' ? Boolean(props.modelValue) : props.modelValue === props.value)
      return () => h('label', { class: [`neu-${type}`, { 'is-disabled': props.disabled }] }, [
        h('input', {
          ...attrs,
          class: 'neu-visually-hidden-input',
          type,
          name: props.name,
          disabled: props.disabled,
          checked: checked.value,
          value: String(props.value),
          onChange: (event: Event) => {
            const target = event.target as HTMLInputElement
            emit('update:modelValue', type === 'checkbox' ? target.checked : props.value)
            emit('change', event)
          },
        }),
        h('span', { class: `neu-${type}__control`, 'aria-hidden': 'true' }),
        h('span', { class: `neu-${type}__label` }, slots.default?.() ?? props.label),
      ])
    },
  })
}

export const NeuCheckbox = createToggle('NeuCheckbox', 'checkbox')

interface RadioGroupContext {
  modelValue: () => string | number | boolean
  update: (value: string | number | boolean) => void
  name: () => string | undefined
  disabled: () => boolean
}
const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('NeuRadioGroup')

export const NeuRadioGroup = defineComponent({
  name: 'NeuRadioGroup',
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean>, required: true },
    name: String,
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    provide(radioGroupKey, {
      modelValue: () => props.modelValue,
      update: value => emit('update:modelValue', value),
      name: () => props.name,
      disabled: () => props.disabled,
    })
    return () => h('div', { class: 'neu-radio-group', role: 'radiogroup' }, slots.default?.())
  },
})

export const NeuRadio = defineComponent({
  name: 'NeuRadio',
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean> },
    value: { type: [String, Number, Boolean] as PropType<string | number | boolean>, required: true },
    label: String,
    disabled: Boolean,
    name: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const group = inject(radioGroupKey, undefined)
    const current = () => group ? group.modelValue() : props.modelValue
    return () => h('label', { class: ['neu-radio', { 'is-disabled': props.disabled || group?.disabled() }] }, [
      h('input', {
        ...attrs,
        class: 'neu-visually-hidden-input',
        type: 'radio',
        name: group?.name() || props.name,
        disabled: props.disabled || group?.disabled(),
        checked: current() === props.value,
        value: String(props.value),
        onChange: (event: Event) => {
          group?.update(props.value)
          emit('update:modelValue', props.value)
          emit('change', event)
        },
      }),
      h('span', { class: 'neu-radio__control', 'aria-hidden': 'true' }),
      h('span', { class: 'neu-radio__label' }, slots.default?.() ?? props.label),
    ])
  },
})

export const NeuSwitch = defineComponent({
  name: 'NeuSwitch',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    label: String,
    disabled: Boolean,
    name: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    return () => h('label', { class: ['neu-switch', { 'is-disabled': props.disabled }] }, [
      h('input', {
        ...attrs,
        class: 'neu-visually-hidden-input',
        type: 'checkbox',
        role: 'switch',
        name: props.name,
        disabled: props.disabled,
        checked: props.modelValue,
        'aria-checked': props.modelValue,
        onChange: (event: Event) => {
          emit('update:modelValue', (event.target as HTMLInputElement).checked)
          emit('change', event)
        },
      }),
      h('span', { class: 'neu-switch__track', 'aria-hidden': 'true' }),
      h('span', { class: 'neu-switch__label' }, slots.default?.() ?? props.label),
    ])
  },
})

export const NeuTag = defineComponent({
  name: 'NeuTag',
  inheritAttrs: false,
  props: {
    size: sizeProp,
    variant: { type: String as PropType<'default' | 'primary' | 'danger'>, default: 'default' },
    removable: Boolean,
  },
  emits: ['remove'],
  setup(props, { attrs, emit, slots }) {
    return () => h('span', {
      ...attrs,
      class: ['neu-tag', `neu-tag--${props.variant}`, `neu-size--${props.size}`, attrs.class],
    }, [
      slots.default?.(),
      props.removable && h('button', {
        type: 'button',
        class: 'neu-tag__remove',
        'aria-label': 'Remove',
        onClick: () => emit('remove'),
      }, '×'),
    ])
  },
})

export const NeuAvatar = defineComponent({
  name: 'NeuAvatar',
  inheritAttrs: false,
  props: {
    src: String,
    alt: { type: String, default: '' },
    size: { type: [Number, String], default: 48 },
  },
  setup(props, { attrs, slots }) {
    const style = computed(() => ({
      '--neu-avatar-size': typeof props.size === 'number' ? `${props.size}px` : props.size,
    }))
    return () => h('span', { ...attrs, class: ['neu-avatar', attrs.class], style: [style.value, attrs.style] }, [
      props.src ? h('img', { src: props.src, alt: props.alt }) : slots.default?.(),
    ])
  },
})

export const NeuAlert = defineComponent({
  name: 'NeuAlert',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<'info' | 'success' | 'warning' | 'danger'>, default: 'info' },
    title: String,
    closable: Boolean,
  },
  emits: ['close'],
  setup(props, { attrs, emit, slots }) {
    return () => h('div', {
      ...attrs,
      class: ['neu-alert', `neu-alert--${props.variant}`, attrs.class],
      role: props.variant === 'danger' ? 'alert' : 'status',
    }, [
      slots.icon?.(),
      h('div', { class: 'neu-alert__content' }, [
        props.title && h('strong', { class: 'neu-alert__title' }, props.title),
        slots.default?.(),
      ]),
      props.closable && h('button', {
        class: 'neu-alert__close',
        type: 'button',
        'aria-label': 'Close',
        onClick: () => emit('close'),
      }, '×'),
    ])
  },
})

export const NeuProgress = defineComponent({
  name: 'NeuProgress',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: String,
    showValue: { type: Boolean, default: true },
  },
  setup(props, { attrs }) {
    const clampedValue = computed(() => Math.max(0, Math.min(props.max, props.value)))
    const percent = computed(() => (clampedValue.value / Math.max(props.max, 1)) * 100)
    return () => h('div', { ...attrs, class: ['neu-progress', attrs.class] }, [
      (props.label || props.showValue) && h('div', { class: 'neu-progress__meta' }, [
        h('span', props.label),
        props.showValue && h('span', `${Math.round(percent.value)}%`),
      ]),
      h('div', {
        class: 'neu-progress__track',
        role: 'progressbar',
        'aria-label': props.label,
        'aria-valuemin': 0,
        'aria-valuemax': props.max,
        'aria-valuenow': clampedValue.value,
      }, h('span', { class: 'neu-progress__fill', style: { width: `${percent.value}%` } })),
    ])
  },
})

export const NeuPagination = defineComponent({
  name: 'NeuPagination',
  props: {
    page: { type: Number, default: 1 },
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    siblingCount: { type: Number, default: 1 },
  },
  emits: ['update:page', 'change'],
  setup(props, { emit }) {
    const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
    const pages = computed(() => {
      const start = Math.max(1, props.page - props.siblingCount)
      const end = Math.min(pageCount.value, props.page + props.siblingCount)
      return Array.from({ length: end - start + 1 }, (_, index) => start + index)
    })
    const go = (page: number) => {
      const next = Math.max(1, Math.min(pageCount.value, page))
      if (next === props.page) return
      emit('update:page', next)
      emit('change', next)
    }
    return () => h('nav', { class: 'neu-pagination', 'aria-label': 'Pagination' }, [
      h('button', { type: 'button', disabled: props.page <= 1, 'aria-label': 'Previous page', onClick: () => go(props.page - 1) }, '‹'),
      ...pages.value.map(page => h('button', {
        type: 'button',
        class: { 'is-active': page === props.page },
        'aria-current': page === props.page ? 'page' : undefined,
        'aria-label': `Page ${page}`,
        onClick: () => go(page),
      }, String(page))),
      h('button', { type: 'button', disabled: props.page >= pageCount.value, 'aria-label': 'Next page', onClick: () => go(props.page + 1) }, '›'),
    ])
  },
})

export interface NeuTabItem {
  value: string
  label: string
  disabled?: boolean
}

export interface NeuNavPillItem {
  value: string
  label: string
  href?: string
  target?: string
  rel?: string
  disabled?: boolean
  current?: boolean
  ariaLabel?: string
}

export const NeuTabs = defineComponent({
  name: 'NeuTabs',
  props: {
    modelValue: { type: String, required: true },
    items: { type: Array as PropType<NeuTabItem[]>, default: () => [] },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    return () => h(TabsRoot, {
      modelValue: props.modelValue,
      orientation: props.orientation,
      class: ['neu-tabs', `neu-tabs--${props.orientation}`],
      'onUpdate:modelValue': (value: string | number) => emit('update:modelValue', String(value)),
    }, {
      default: () => [
        h(TabsList, { asChild: true, 'aria-label': 'Tabs' }, {
          default: () => h('div', { class: 'neu-tabs__list' }, props.items.map(item => h(TabsTrigger, {
            asChild: true,
            value: item.value,
            disabled: item.disabled,
          }, () => h('button', {
            class: 'neu-tabs__trigger',
            type: 'button',
          }, item.label)))),
        }),
        ...(slots.default
          ? slots.default()
          : props.items.map(item => h(TabsContent, {
              class: 'neu-tabs__content',
              value: item.value,
            }, () => slots[item.value]?.({ item })))),
      ],
    })
  },
})

export const NeuTab = defineComponent({
  name: 'NeuTab',
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    return () => h(TabsContent, { value: props.value, class: 'neu-tabs__content' }, slots)
  },
})

export const NeuDropdown = defineComponent({
  name: 'NeuDropdown',
  props: {
    open: Boolean,
    modal: { type: Boolean, default: false },
    align: { type: String as PropType<'start' | 'center' | 'end'>, default: 'end' },
  },
  emits: ['update:open'],
  setup(props, { emit, slots }) {
    return () => h(DropdownMenuRoot, {
      open: props.open,
      modal: props.modal,
      'onUpdate:open': (value: boolean) => emit('update:open', value),
    }, {
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, () => slots.trigger?.()),
        h(DropdownMenuPortal, {}, () => h(DropdownMenuContent, {
          class: 'neu-dropdown__content',
          align: props.align,
          sideOffset: 8,
        }, slots.default)),
      ],
    })
  },
})

export const NeuDropdownItem = defineComponent({
  name: 'NeuDropdownItem',
  inheritAttrs: false,
  props: {
    disabled: Boolean,
  },
  emits: ['select'],
  setup(props, { attrs, emit, slots }) {
    return () => h(DropdownMenuItem, {
      ...attrs,
      class: ['neu-dropdown__item', attrs.class],
      disabled: props.disabled,
      onSelect: (event: Event) => emit('select', event),
    }, slots)
  },
})

export const NeuNavPills = defineComponent({
  name: 'NeuNavPills',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<NeuNavPillItem[]>, default: () => [] },
    modelValue: String,
    label: { type: String, default: 'Navigation' },
    size: sizeProp,
    tag: { type: String, default: 'nav' },
    marker: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'select'],
  setup(props, { attrs, emit, slots }) {
    const isCurrent = (item: NeuNavPillItem) =>
      props.modelValue === undefined ? Boolean(item.current) : props.modelValue === item.value

    const renderContent = (item: NeuNavPillItem, current: boolean) =>
      slots.item?.({ item, current }) ?? h('span', { class: 'neu-nav-pill__label' }, item.label)

    const onSelect = (item: NeuNavPillItem, event: MouseEvent) => {
      if (item.disabled) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      emit('update:modelValue', item.value)
      emit('select', item, event)
    }

    return () => h(props.tag, {
      ...attrs,
      class: [
        'neu-nav-pills',
        `neu-size--${props.size}`,
        { 'neu-nav-pills--no-marker': !props.marker },
        attrs.class,
      ],
      'aria-label': props.label,
    }, h('div', { class: 'neu-nav-pills__list' }, props.items.map(item => {
      const current = isCurrent(item)
      const className = ['neu-nav-pill', { 'is-active': current, 'is-disabled': item.disabled }]
      const commonProps = {
        key: item.value,
        class: className,
        'aria-current': current ? 'page' : undefined,
        'aria-disabled': item.disabled || undefined,
        'aria-label': item.ariaLabel,
        tabindex: item.disabled ? -1 : undefined,
        onClick: (event: MouseEvent) => onSelect(item, event),
      }

      if (item.href) {
        const rel = item.rel ?? (item.target === '_blank' ? 'noopener noreferrer' : undefined)

        return h('a', {
          ...commonProps,
          href: item.disabled ? undefined : item.href,
          target: item.target,
          rel,
        }, renderContent(item, current))
      }

      return h('button', {
        ...commonProps,
        type: 'button',
        disabled: item.disabled,
      }, renderContent(item, current))
    })))
  },
})

export const NeuNavbar = defineComponent({
  name: 'NeuNavbar',
  inheritAttrs: false,
  props: {
    position: { type: String as PropType<'static' | 'sticky' | 'fixed'>, default: 'static' },
    label: { type: String, default: 'Primary navigation' },
  },
  setup(props, { attrs, slots }) {
    return () => h('nav', {
      ...attrs,
      class: ['neu-navbar', `neu-navbar--${props.position}`, attrs.class],
      'aria-label': props.label,
    }, [
      h('div', { class: 'neu-navbar__brand' }, slots.brand?.()),
      h('div', { class: 'neu-navbar__content' }, slots.default?.()),
      h('div', { class: 'neu-navbar__actions' }, slots.actions?.()),
    ])
  },
})
