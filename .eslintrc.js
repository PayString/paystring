module.exports = {
  root: true,

  parser: '@typescript-eslint/parser', // Make ESLint compatible with TypeScript
  parserOptions: {
    // Enable linting rules with type information from our tsconfig
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],

    sourceType: 'module', // Allow the use of imports / ES modules

    ecmaFeatures: {
      impliedStrict: true, // Enable global strict mode
    },
  },

  // Specify global variables that are predefined
  env: {
    node: true, // Enable node global variables & Node.js scoping
    es2020: true, // Add all ECMAScript 2020 globals and automatically set the ecmaVersion parser option to ES2020
  },

  plugins: ['import', 'node'],

  extends: ['@xpring-eng/eslint-config-base/loose'],

  rules: {
    // We explicitly use `process.exit()` because all other errors should really be handled.
    'no-process-exit': 'off',
    'node/no-process-exit': 'off',

    // TODO:(hbergren) These are all rules we should remove eventually
    'import/max-dependencies': ['warn', { max: 9 }],
    'max-lines-per-function': ['warn', { max: 86 }],
    'max-statements': ['warn', { max: 26 }],
    complexity: ['warn', { max: 12 }],
  },

  // TODO:(hbergren) Should be able tor remove these overrides when we remove the above rules
  overrides: [
    {
      files: ['test/**/*.ts'],
      rules: {
        // Warn when modules have too many dependencies (code smell)
        // Increased the max for test files and test helper files, since tests usually need to import more things
        'import/max-dependencies': ['warn', { max: 8 }],

        // describe blocks count as a function in Mocha tests, and can be insanely long
        'max-lines-per-function': 'off',

        // TODO:(hbergren) We should probably cut this override eventually
        'max-lines': ['warn', {max: 500}],
      },
    },
  ],
}
