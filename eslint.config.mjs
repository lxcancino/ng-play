import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Apps are leaves: nothing may import an app.
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },
            { sourceTag: 'type:lib', onlyDependOnLibsWithTags: ['type:lib'] },
            // Framework-agnostic code must stay free of any framework.
            {
              sourceTag: 'framework:agnostic',
              onlyDependOnLibsWithTags: ['framework:agnostic'],
            },
            // Each framework may use agnostic code and its own kind only.
            {
              sourceTag: 'framework:angular',
              onlyDependOnLibsWithTags: [
                'framework:agnostic',
                'framework:angular',
              ],
            },
            {
              sourceTag: 'framework:react',
              onlyDependOnLibsWithTags: [
                'framework:agnostic',
                'framework:react',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
