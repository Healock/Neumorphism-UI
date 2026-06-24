import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Neumorphism UI',
  description: 'Vue 3 components and UnoCSS utilities',
  lastUpdated: false,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/overview' },
      { text: 'GitHub', link: 'https://github.com/Healock/Neumorphism-UI' },
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '开始使用', link: '/guide/getting-started' },
          { text: '主题', link: '/guide/theme' },
          { text: '迁移旧版 CSS', link: '/guide/migration' },
        ],
      },
      {
        text: '参考',
        items: [
          { text: '组件总览', link: '/components/overview' },
          { text: 'Utilities', link: '/utilities' },
        ],
      },
    ],
  },
})
