import {
  computed,
  defineComponent,
  h,
  useId,
  type PropType,
} from 'vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
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

export interface NeuSelectItem {
  value: string
  label: string
  disabled?: boolean
}

export const NeuSelect = defineComponent({
  name: 'NeuSelect',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    items: { type: Array as PropType<NeuSelectItem[]>, default: () => [] },
    label: String,
    placeholder: { type: String, default: '请选择' },
    disabled: Boolean,
    name: String,
    id: String,
    size: sizeProp,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    const id = props.id || `neu-select-${useId()}`
    const value = computed(() => props.modelValue || undefined)

    return () => h('div', {
      ...attrs,
      class: ['neu-select-field', `neu-size--${props.size}`, attrs.class],
    }, [
      props.label && h('label', { class: 'neu-field__label', for: id }, props.label),
      h(SelectRoot, {
        modelValue: value.value,
        disabled: props.disabled,
        name: props.name,
        'onUpdate:modelValue': (next: unknown) => {
          emit('update:modelValue', String(next ?? ''))
          emit('change', String(next ?? ''))
        },
      }, {
        default: () => [
          h(SelectTrigger, {
            id,
            class: ['neu-select__trigger', `neu-size--${props.size}`],
            'aria-label': props.label,
          }, {
            default: () => [
              h(SelectValue, { placeholder: props.placeholder }),
              h(SelectIcon, { class: 'neu-select__icon', 'aria-hidden': 'true' }, () => h(
                'svg',
                { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', 'aria-hidden': 'true' },
                h('path', {
                  d: 'M4 6l4 4 4-4',
                  stroke: 'currentColor',
                  'stroke-width': 1.6,
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                }),
              )),
            ],
          }),
          h(SelectPortal, {}, () => h(SelectContent, {
            class: 'neu-select__content',
            position: 'popper',
            sideOffset: 6,
          }, {
            default: () => h(SelectViewport, { class: 'neu-select__viewport' }, () => (
              props.items.length
                ? props.items.map(item => h(SelectItem, {
                    class: 'neu-select__item',
                    value: item.value,
                    disabled: item.disabled,
                  }, {
                    default: () => [
                      h(SelectItemText, {}, () => item.label),
                      h(SelectItemIndicator, { class: 'neu-select__check', 'aria-hidden': 'true' }, () => '✓'),
                    ],
                  }))
                : slots.empty?.() ?? h('span', { class: 'neu-select__empty' }, '暂无选项')
            )),
          })),
        ],
      }),
    ])
  },
})

export interface NeuAccordionItem {
  value: string
  title: string
  content?: string
  disabled?: boolean
}

export const NeuAccordion = defineComponent({
  name: 'NeuAccordion',
  props: {
    items: { type: Array as PropType<NeuAccordionItem[]>, default: () => [] },
    type: { type: String as PropType<'single' | 'multiple'>, default: 'single' },
    modelValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    collapsible: { type: Boolean, default: true },
    disabled: Boolean,
    label: { type: String, default: 'Accordion' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, slots }) {
    const singleValue = computed(() => {
      const value = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
      return value || undefined
    })
    const multipleValue = computed(() => (
      Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []
    ))

    const content = () => props.items.map(item => h(AccordionItem, {
      class: 'neu-accordion__item',
      value: item.value,
      disabled: item.disabled,
    }, {
      default: () => [
        h(AccordionHeader, { class: 'neu-accordion__header' }, () => h(AccordionTrigger, {
          class: 'neu-accordion__trigger',
        }, () => [
          h('span', { class: 'neu-accordion__title' }, item.title),
          h('span', { class: 'neu-accordion__chevron', 'aria-hidden': 'true' }, '⌄'),
        ])),
        h(AccordionContent, { class: 'neu-accordion__content' }, () => h(
          'div',
          { class: 'neu-accordion__body' },
          slots[item.value]?.() ?? item.content ?? '',
        )),
      ],
    }))

    return () => {
      if (props.type === 'multiple') {
        return h(AccordionRoot, {
          type: 'multiple',
          modelValue: multipleValue.value,
          disabled: props.disabled,
          class: 'neu-accordion',
          'aria-label': props.label,
          'onUpdate:modelValue': (next?: string | string[]) => {
            const nextValue = Array.isArray(next) ? next : next ? [next] : []
            emit('update:modelValue', nextValue)
            emit('change', nextValue)
          },
        }, { default: content })
      }

      return h(AccordionRoot, {
        type: 'single',
        modelValue: singleValue.value,
        collapsible: props.collapsible,
        disabled: props.disabled,
        class: 'neu-accordion',
        'aria-label': props.label,
        'onUpdate:modelValue': (next?: string | string[]) => {
          const nextValue = Array.isArray(next) ? next[0] : next
          emit('update:modelValue', nextValue ?? '')
          emit('change', nextValue ?? '')
        },
      }, { default: content })
    }
  },
})

export const NeuModal = defineComponent({
  name: 'NeuModal',
  inheritAttrs: false,
  props: {
    open: Boolean,
    title: String,
    description: String,
    size: sizeProp,
    closeLabel: { type: String, default: '关闭' },
    hideClose: Boolean,
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
          h(DialogOverlay, { class: 'neu-modal__overlay' }),
          h(DialogContent, {
            ...attrs,
            class: ['neu-modal', `neu-modal--${props.size}`, attrs.class],
            'aria-label': props.title ? undefined : '对话框',
          }, {
            default: () => [
              h('header', { class: 'neu-modal__header' }, [
                h('div', { class: 'neu-modal__heading' }, [
                  props.title
                    ? h(DialogTitle, { class: 'neu-modal__title' }, () => props.title)
                    : h(DialogTitle, { class: 'neu-sr-only' }, () => '对话框'),
                  props.description
                    ? h(DialogDescription, { class: 'neu-modal__description' }, () => props.description)
                    : h(DialogDescription, { class: 'neu-sr-only' }, () => '对话框内容'),
                ]),
                !props.hideClose && h(DialogClose, { asChild: true }, () => h('button', {
                  type: 'button',
                  class: 'neu-modal__close',
                  'aria-label': props.closeLabel,
                }, h('span', { class: 'neu-modal__close-icon', 'aria-hidden': 'true' }, '×'))),
              ]),
              h('div', { class: 'neu-modal__body' }, slots.default?.()),
              slots.footer && h('footer', { class: 'neu-modal__footer' }, slots.footer()),
            ],
          }),
        ]),
      ],
    })
  },
})

export interface NeuTooltipProps {
  content?: string
}

export const NeuTooltip = defineComponent({
  name: 'NeuTooltip',
  props: {
    content: String,
    side: { type: String as PropType<'top' | 'right' | 'bottom' | 'left'>, default: 'top' },
    align: { type: String as PropType<'start' | 'center' | 'end'>, default: 'center' },
    delay: { type: Number, default: 300 },
    sideOffset: { type: Number, default: 8 },
  },
  setup(props, { slots }) {
    return () => h(TooltipProvider, { delayDuration: props.delay }, () => h(TooltipRoot, {}, {
      default: () => [
        h(TooltipTrigger, { asChild: true }, () => slots.trigger?.()),
        h(TooltipPortal, {}, () => h(TooltipContent, {
          class: 'neu-tooltip',
          side: props.side,
          align: props.align,
          sideOffset: props.sideOffset,
        }, {
          default: () => slots.default?.() ?? props.content,
        })),
      ],
    }))
  },
})

export interface NeuSegmentedItem {
  value: string
  label: string
  disabled?: boolean
}

export const NeuSegmented = defineComponent({
  name: 'NeuSegmented',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    items: { type: Array as PropType<NeuSegmentedItem[]>, default: () => [] },
    label: { type: String, default: '分段选择' },
    disabled: Boolean,
    size: sizeProp,
    name: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const groupName = props.name || `neu-segmented-${useId()}`

    return () => h('div', {
      ...attrs,
      class: ['neu-segmented', `neu-size--${props.size}`, attrs.class],
      role: 'radiogroup',
      'aria-label': props.label,
    }, props.items.map(item => h('label', {
      class: ['neu-segmented__option', { 'is-active': props.modelValue === item.value }],
    }, [
      h('input', {
        type: 'radio',
        name: groupName,
        value: item.value,
        checked: props.modelValue === item.value,
        disabled: props.disabled || item.disabled,
        class: 'neu-visually-hidden-input',
        onChange: () => {
          emit('update:modelValue', item.value)
          emit('change', item.value)
        },
      }),
      h('span', { class: 'neu-segmented__label' }, item.label),
    ])))
  },
})

export interface NeuBreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export const NeuBreadcrumb = defineComponent({
  name: 'NeuBreadcrumb',
  props: {
    items: { type: Array as PropType<NeuBreadcrumbItem[]>, default: () => [] },
    separator: { type: String, default: '›' },
    label: { type: String, default: 'Breadcrumb' },
  },
  setup(props, { slots }) {
    return () => h('nav', { class: 'neu-breadcrumb', 'aria-label': props.label }, h(
      'ol',
      { class: 'neu-breadcrumb__list' },
      props.items.map((item, index) => {
        const current = item.current ?? index === props.items.length - 1
        const content = item.href && !current
          ? h('a', { href: item.href, class: 'neu-breadcrumb__link' }, item.label)
          : h('span', {
              class: 'neu-breadcrumb__current',
              'aria-current': current ? 'page' : undefined,
            }, item.label)

        return h('li', { class: 'neu-breadcrumb__item' }, [
          content,
          index < props.items.length - 1 && h('span', {
            class: 'neu-breadcrumb__separator',
            'aria-hidden': 'true',
          }, slots.separator?.() ?? props.separator),
        ])
      }),
    ))
  },
})

export const NeuSkeleton = defineComponent({
  name: 'NeuSkeleton',
  props: {
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    shape: { type: String as PropType<'line' | 'block' | 'circle'>, default: 'line' },
    lines: { type: Number, default: 1 },
    animated: { type: Boolean, default: true },
  },
  setup(props) {
    const lineWidths = ['100%', '86%', '72%', '92%', '78%']
    const rootStyle = computed(() => ({
      width: cssSize(props.width),
      height: cssSize(props.height),
    }))

    return () => {
      const shapeClass = `neu-skeleton--${props.shape}`
      if (props.shape !== 'line' || props.lines <= 1) {
        return h('span', {
          class: ['neu-skeleton', shapeClass, { 'is-animated': props.animated }],
          style: rootStyle.value,
          'aria-hidden': 'true',
        })
      }

      return h('span', {
        class: ['neu-skeleton-lines', { 'is-animated': props.animated }],
        style: { width: cssSize(props.width) },
        'aria-hidden': 'true',
      }, Array.from({ length: Math.min(props.lines, 8) }, (_, index) => h('span', {
        class: ['neu-skeleton', shapeClass, { 'is-animated': props.animated }],
        style: { width: lineWidths[index % lineWidths.length], height: cssSize(props.height) },
      })))
    }
  },
})

export const NeuSlider = defineComponent({
  name: 'NeuSlider',
  props: {
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: Boolean,
    label: String,
    showValue: { type: Boolean, default: true },
    id: String,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const id = props.id || `neu-slider-${useId()}`
    const percent = computed(() => {
      if (props.max === props.min) return 0
      return Math.max(0, Math.min(100, ((props.modelValue - props.min) / (props.max - props.min)) * 100))
    })

    return () => h('div', { class: 'neu-slider' }, [
      (props.label || props.showValue) && h('div', { class: 'neu-slider__meta' }, [
        props.label && h('label', { class: 'neu-field__label', for: id }, props.label),
        props.showValue && h('output', {
          class: 'neu-slider__value',
          for: id,
          'aria-hidden': 'true',
        }, String(props.modelValue)),
      ]),
      h('input', {
        id,
        type: 'range',
        class: 'neu-slider__input',
        min: props.min,
        max: props.max,
        step: props.step,
        value: props.modelValue,
        disabled: props.disabled,
        style: { '--neu-slider-fill': `${percent.value}%` },
        onInput: (event: Event) => {
          const next = Number((event.target as HTMLInputElement).value)
          emit('update:modelValue', next)
        },
        onChange: (event: Event) => {
          emit('change', Number((event.target as HTMLInputElement).value))
        },
      }),
    ])
  },
})

export const NeuEmptyState = defineComponent({
  name: 'NeuEmptyState',
  props: {
    title: { type: String, default: '暂无内容' },
    description: String,
    size: sizeProp,
  },
  setup(props, { slots }) {
    return () => h('section', { class: ['neu-empty', `neu-size--${props.size}`] }, [
      h('div', { class: 'neu-empty__icon', 'aria-hidden': 'true' }, slots.icon?.() ?? '◇'),
      h('h3', { class: 'neu-empty__title' }, slots.title?.() ?? props.title),
      (props.description || slots.description) && h(
        'p',
        { class: 'neu-empty__description' },
        slots.description?.() ?? props.description,
      ),
      slots.default && h('div', { class: 'neu-empty__actions' }, slots.default()),
    ])
  },
})
