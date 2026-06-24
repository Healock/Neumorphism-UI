import { afterEach } from 'vitest'
import { config } from '@vue/test-utils'

afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-neu-theme')
  document.documentElement.removeAttribute('style')
})

config.global.stubs = {
  teleport: true,
}
