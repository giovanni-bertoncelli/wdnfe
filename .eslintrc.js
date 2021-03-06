module.exports = {
	'env': {
		'node': true,
		'commonjs': true,
		'es6': true
	},
	'extends': 'eslint:recommended',
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		]
	},
	'parserOptions': {
		'ecmaVersion': 8
	}
};