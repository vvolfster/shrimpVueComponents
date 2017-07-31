// http://eslint.org/docs/user-guide/configuring
module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module'
    },
    'settings': {
        'import/resolver': {
            'webpack': {
                'config': 'build/webpack.base.conf.js'
            }
        }
    },
    env: {
        browser: true
    },
    globals: {
        'cordova': true,
        'DEV': true,
        'PROD': true,
        '__THEME': true
    },
    //
    extends: 'airbnb-base',
    // required to lint *.vue files
    plugins: [
        'html', 'vue'
    ],
    validate: [
        "javascript",
        "javascriptreact",
        //  { "language": "html", "autoFix": true }
    ],
    // add your custom rules here
    'rules': {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/copic-color.vue']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'semi':'off',
    'curly':'off',
    'max-len': ["error", { code : 150, ignoreComments: true, ignoreStrings: true }],
    'no-multi-spaces':'off',
    'arrow-body-style' : 'off',
    'comma-dangle' : 'off',
    'no-param-reassign' : ['warn', { "props": false }], // Turning it off for embedded props makes it so we can use lodash.reduce without getting a headache.
    'indent' : ["error",4, {"SwitchCase": 1}],
    'linebreak-style' : 'off',
    'quotes' : 'off',
    'keyword-spacing' : 'off',
    'no-restricted-syntax' : 'off',
    'guard-for-in' : 'off',
    'space-before-blocks' : 'off',
    'brace-style': 'off',
    'import/no-dynamic-require': 'off',
    'no-console' : ["warn", { allow: ["warn", "error"] }],
    'no-shadow': ["error", { allow: ["resolve","reject","done","cb"] }]
  }
}

