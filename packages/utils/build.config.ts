import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	outDir: './dual-lib',
	entries: [
		{ input: 'src/colors/types', name: 'colors/types' },
		{ input: 'src/colors/keywords', name: 'colors/keywords' },
		{ input: 'src/colors/index', name: 'colors/index' },
		{ input: 'src/customisations/bool', name: 'customizations/bool' },
		{ input: 'src/customisations/compare', name: 'customizations/compare' },
		{ input: 'src/customisations/index', name: 'customizations/index' },
		{ input: 'src/customisations/rotate', name: 'customizations/rotate' },
		{ input: 'src/customisations/shorthand', name: 'customizations/shorthand' },
		{ input: 'src/icon/index', name: 'icon/index' },
		{ input: 'src/icon/merge', name: 'icon/merge' },
		{ input: 'src/icon/name', name: 'icon/name' },
		{ input: 'src/icon-set/convert-info', name: 'icon-set/convert-info' },
		{ input: 'src/icon-set/expand', name: 'icon-set/expand' },
		{ input: 'src/icon-set/get-icon', name: 'icon-set/get-icon' },
		{ input: 'src/icon-set/get-icons', name: 'icon-set/get-icons' },
		{ input: 'src/icon-set/minify', name: 'icon-set/minify' },
		{ input: 'src/icon-set/parse', name: 'icon-set/parse' },
		{ input: 'src/icon-set/validate', name: 'icon-set/validate' },
		{ input: 'src/loader/custom', name: 'loader/custom' },
		{ input: 'src/loader/fs', name: 'loader/fs' },
		{ input: 'src/loader/install-pkg', name: 'loader/install-pkg' },
		{ input: 'src/loader/loader', name: 'loader/loader' },
		{ input: 'src/loader/loaders', name: 'loader/loaders' },
		{ input: 'src/loader/modern', name: 'loader/modern' },
		{ input: 'src/loader/types', name: 'loader/types' },
		{ input: 'src/loader/utils', name: 'loader/utils' },
		{ input: 'src/loader/warn', name: 'loader/warn' },
		{ input: 'src/misc/strings', name: 'misc/strings' },
		{ input: 'src/svg/build', name: 'svg/build' },
		{ input: 'src/svg/encode-svg-for-css', name: 'svg/encode-svg-for-css' },
		{ input: 'src/svg/id', name: 'svg/id' },
		{ input: 'src/svg/size', name: 'svg/size' },
		{ input: 'src/index', name: 'index' },
	],
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
})
