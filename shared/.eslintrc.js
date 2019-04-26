module.exports = {
  'env': {
    'es6': true,
    'node': true,
  },
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    'valid-jsdoc': [
      "error", {
        requireParamDescription: false,
        requireReturnDescription: false,
        "requireReturn": false,
        "prefer": {
          "arg": "param",
          "argument": "param",
          "class": "constructor",
          "return": "returns",
          "virtual": "abstract"
        }
      }
    ],
    'max-len': [
      'warn', {
        code: 150,
        tabWidth: 2,
        ignoreUrls: true,
      }
    ],
    'indent': [
      'error', 2, {
        'CallExpression': {
          'arguments': 1,
        },
        SwitchCase: 1
      }
    ]
  },
};
