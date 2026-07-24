import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/public/**',
    '**/components.d.ts',
    '**/auto-imports.d.ts',
  ]),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
  {
    rules: {
      // ! TypeScript 相关规则
      '@typescript-eslint/ban-ts-ignore': 'off', // 允许使用 // @ts-ignore 忽略 TS 报错
      '@typescript-eslint/explicit-function-return-type': 'off', // 不强制函数必须写返回值类型
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型（关闭 any 警告）
      '@typescript-eslint/no-var-requires': 'off', // 允许使用 require() 导入
      '@typescript-eslint/no-empty-function': 'off', // 允许写空函数 {}
      '@typescript-eslint/no-use-before-define': 'off', // 允许变量/函数在定义前使用
      '@typescript-eslint/ban-ts-comment': 'off', // 允许使用 @ts-ignore / @ts-nocheck
      '@typescript-eslint/ban-types': 'off', // 允许使用 Object / String / Boolean 等不推荐类型
      '@typescript-eslint/no-non-null-assertion': 'off', // 允许使用 ! 非空断言
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 不强制函数/导出必须写类型
      '@typescript-eslint/no-redeclare': 'error', // 【报错】不允许重复声明变量（重要）
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off', // 允许 a?.b! 这种写法
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ], // 【报错】不允许声明了变量却不用（2 = error级别）
      // ! Vue 相关规则
      'vue/custom-event-name-casing': 'off', // 不强制自定义事件名必须用 kebab-case
      'vue/attributes-order': 'off', // 不强制标签属性顺序
      'vue/one-component-per-file': 'off', // 允许一个文件写多个组件
      'vue/html-closing-bracket-newline': 'off', // 不强制标签右括号换行
      'vue/max-attributes-per-line': 'off', // 不强制一行最多几个属性
      'vue/multiline-html-element-content-newline': 'off', // 不强制多行内容必须换行
      'vue/singleline-html-element-content-newline': 'off', // 不强制单行内容格式
      'vue/attribute-hyphenation': 'off', // 不强制属性必须用短横线
      'vue/html-self-closing': 'off', // 不强制标签自闭合
      'vue/no-multiple-template-root': 'off', // Vue3 允许 template 多个根节点（必须关）
      'vue/require-default-prop': 'off', // 不强制 props 必须写默认值
      'vue/no-v-model-argument': 'off', // 允许 v-model 带参数
      'vue/no-arrow-functions-in-watch': 'off', // 允许 watch 用箭头函数
      'vue/no-template-key': 'off', // 允许 template 标签写 key
      'vue/no-v-html': 'off', // 允许使用 v-html
      'vue/comment-directive': 'off', // 允许 eslint 注释在模板中
      'vue/no-parsing-error': 'off', // 不检查模板解析错误（关闭后不爆红）
      'vue/no-deprecated-v-on-native-modifier': 'off', // 允许使用旧版 .native 修饰符
      'vue/multi-word-component-names': 'off', // 不强制组件名必须多单词（如 Home 而不是 HomeItem）
      // ! 原生 JS 规则
      'no-useless-escape': 'off', // 允许不必要的转义字符
      'no-sparse-arrays': 'off', // 允许稀疏数组 [1,,2]
      'no-prototype-builtins': 'off', // 允许直接使用 hasOwnProperty 等
      'no-constant-condition': 'off', // 允许 if(true) / if(1) 这种常量条件
      'no-use-before-define': 'off', // 允许先使用后定义
      'no-restricted-globals': 'off', // 不限制全局变量
      'no-restricted-syntax': 'off', // 不限制语法
      'generator-star-spacing': 'off', // 不强制 generator 函数空格
      'no-unreachable': 'off', // 允许不可达代码（return 后代码）
      'no-multiple-template-root': 'off', // 【报错】不允许声明变量不用
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ], // 允许在 case 中定义变量
      'no-v-model-argument': 'off', // 允许在 v-model 上使用 冒号参数写法
      'no-case-declarations': 'off', // 允许在 case 中定义变量
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }], // 【报错】不允许 console.log，但允许 warn / error
      'no-redeclare': 'off', // 允许重复声明（已被 TS 规则覆盖）
    },
  },
)
