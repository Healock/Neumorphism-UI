import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = join(rootDir, 'packages', 'neumorphism-ui')
const tempDir = mkdtempSync(join(tmpdir(), 'neumorphism-ui-consumer-'))
const consumerDir = join(tempDir, 'consumer')
const nodeDir = dirname(process.execPath)
const pnpmCli = join(nodeDir, 'node_modules', 'corepack', 'dist', 'pnpm.js')
const npmCli = join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: '1',
    },
  })
}

function runPnpm(args, cwd) {
  if (process.platform === 'win32' && existsSync(pnpmCli)) {
    run(process.execPath, [pnpmCli, ...args], cwd)
    return
  }

  run('pnpm', args, cwd)
}

function runNpm(args, cwd) {
  const previousEnv = process.env
  const cleanEnv = { ...previousEnv }
  for (const key of Object.keys(cleanEnv)) {
    if (['npm_config_verify_deps_before_run', 'npm_config__jsr_registry'].includes(key.toLowerCase()))
      delete cleanEnv[key]
  }

  if (process.platform === 'win32' && existsSync(npmCli)) {
    execFileSync(process.execPath, [npmCli, ...args], {
      cwd,
      stdio: 'inherit',
      env: { ...cleanEnv, CI: '1' },
    })
    return
  }

  execFileSync('npm', args, {
    cwd,
    stdio: 'inherit',
    env: { ...cleanEnv, CI: '1' },
  })
}

function write(relativePath, content) {
  const target = join(consumerDir, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
}

try {
  runPnpm(['--filter', '@healock/neumorphism-ui', 'build'], rootDir)
  runPnpm(['pack', '--pack-destination', tempDir], packageDir)

  const tarballName = readdirSync(tempDir).find((name) => name.endsWith('.tgz'))
  if (!tarballName)
    throw new Error('pnpm pack did not create a tarball')

  const tarballPath = join(tempDir, tarballName).replaceAll('\\', '/')
  mkdirSync(consumerDir)

  write('package.json', `${JSON.stringify({
    name: 'neumorphism-ui-consumer-smoke',
    private: true,
    type: 'module',
    scripts: {
      build: 'vue-tsc --noEmit && vite build',
    },
    dependencies: {
      '@healock/neumorphism-ui': `file:${tarballPath}`,
      'vue': '3.5.38',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '6.0.7',
      'typescript': '5.9.3',
      'unocss': '66.7.2',
      'vite': '8.1.0',
      'vue-tsc': '3.1.4',
    },
  }, null, 2)}\n`)
  write('index.html', '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n')
  write('tsconfig.json', `${JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      skipLibCheck: true,
      isolatedModules: true,
      useDefineForClassFields: true,
      allowImportingTsExtensions: false,
    },
    include: ['src/**/*.ts', 'src/**/*.vue'],
  }, null, 2)}\n`)
  write('vite.config.mjs', `import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
})
`)
  write('uno.config.mjs', `import { presetNeumorphism } from '@healock/neumorphism-ui/preset'
import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [presetWind4(), presetNeumorphism()],
})
`)
  write('src/vite-env.d.ts', '/// <reference types="vite/client" />\n')
  write('src/main.ts', `import { createApp } from 'vue'
import '@healock/neumorphism-ui/style.css'
import 'virtual:uno.css'
import App from './App.vue'

createApp(App).mount('#app')
`)
  write('src/App.vue', `<script setup lang="ts">
import { ref } from 'vue'
import {
  NeuButton,
  NeuInput,
  NeuThemeProvider,
} from '@healock/neumorphism-ui'

const name = ref('Healock')
</script>

<template>
  <NeuThemeProvider class="neu-page">
    <main class="neu-card mx-auto max-w-xl">
      <NeuInput v-model="name" label="Name" />
      <NeuButton class="mt-4">Hello {{ name }}</NeuButton>
    </main>
  </NeuThemeProvider>
</template>
`)

  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], consumerDir)
  runNpm(['run', 'build'], consumerDir)

  const outputFile = join(consumerDir, 'dist', 'index.html')
  if (!existsSync(outputFile))
    throw new Error('consumer build did not produce dist/index.html')

  const assetDir = join(consumerDir, 'dist', 'assets')
  const javascriptBytes = readdirSync(assetDir)
    .filter(name => name.endsWith('.js'))
    .reduce((total, name) => total + statSync(join(assetDir, name)).size, 0)
  if (javascriptBytes > 150_000) {
    throw new Error(
      `on-demand consumer emitted ${javascriptBytes} bytes of JavaScript; tree-shaking limit is 150000`,
    )
  }

  console.log(`Tarball consumer smoke test passed: ${tarballName}`)
}
finally {
  rmSync(tempDir, { recursive: true, force: true })
}
