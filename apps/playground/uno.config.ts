import { defineConfig, presetWind4 } from 'unocss'
import { presetNeumorphism } from '@healock/neumorphism-ui/preset'

export default defineConfig({
  presets: [presetWind4(), presetNeumorphism()],
})
