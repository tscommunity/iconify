// Core
import { IconifyJSON } from '@iconify/types';
import { merge } from '@iconify/core/lib/misc/merge';
import {
	stringToIcon,
	validateIcon,
	IconifyIconName,
} from '@iconify/core/lib/icon/name';
import { IconifyIcon, FullIconifyIcon } from '@iconify/core/lib/icon';
import {
	IconifyIconCustomisations,
	fullCustomisations,
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
} from '@iconify/core/lib/customisations';
import {
	getStorage,
	getIcon,
	addIcon,
	addIconSet,
	listStoredProviders,
	listStoredPrefixes,
} from '@iconify/core/lib/storage';
import { iconToSVG, IconifyIconBuildResult } from '@iconify/core/lib/builder';
import { replaceIDs } from '@iconify/core/lib/builder/ids';
import { calcSize } from '@iconify/core/lib/builder/calc-size';

// Modules
import { coreModules } from '@iconify/core/lib/modules';
import { browserModules } from './modules';

// Finders
import { addFinder } from './finder';
import { finder as iconifyFinder } from './finders/iconify';
// import { finder as iconifyIconFinder } from './finders/iconify-icon';

// Cache
import { storeCache, loadCache, config } from '@iconify/core/lib/cache/storage';

// API
import { IconifyAPI } from './api';
import {
	API,
	getRedundancyCache,
	IconifyAPIInternalStorage,
} from '@iconify/core/lib/api/';
import {
	setAPIModule,
	IconifyAPIModule,
	IconifyAPISendQuery,
	IconifyAPIPrepareQuery,
} from '@iconify/core/lib/api/modules';
import {
	setAPIConfig,
	PartialIconifyAPIConfig,
	IconifyAPIConfig,
	getAPIConfig,
	GetAPIConfig,
} from '@iconify/core/lib/api/config';
import { getAPIModule } from '@iconify/core/lib/api/modules/jsonp';
import {
	IconifyIconLoaderCallback,
	IconifyIconLoaderAbort,
} from '@iconify/core/lib/interfaces/loader';

// Observer
import { IconifyObserver } from './observer';
import { observer } from './observer/observer';

// Render
import { IconifyRenderer } from './renderer';
import { renderIcon } from './renderer/render';

// Scan
import { IconifyScanner } from './scanner';
import { scanDOM } from './scanner/scan';

/**
 * Export required types
 */
// JSON stuff
export { IconifyIcon, IconifyJSON, IconifyIconName };

// Customisations
export {
	IconifyIconCustomisations,
	IconifyIconSize,
	IconifyHorizontalIconAlignment,
	IconifyVerticalIconAlignment,
};

// Build
export { IconifyIconBuildResult };

// API
export {
	IconifyAPIConfig,
	IconifyIconLoaderCallback,
	IconifyIconLoaderAbort,
	IconifyAPIInternalStorage,
	IconifyAPIModule,
	GetAPIConfig,
	IconifyAPIPrepareQuery,
	IconifyAPISendQuery,
};

/**
 * Cache types
 */
export type IconifyCacheType = 'local' | 'session' | 'all';

/**
 * Exposed internal functions
 *
 * Used by plug-ins, such as Icon Finder
 *
 * Important: any changes published in a release must be backwards compatible.
 */
export interface IconifyExposedInternals {
	/**
	 * Calculate width knowing height and width/height ratio (or vice versa)
	 */
	calculateSize: (
		size: IconifyIconSize,
		ratio: number,
		precision?: number
	) => IconifyIconSize;

	/**
	 * Get internal API data, used by Icon Finder
	 */
	getAPI: (provider: string) => IconifyAPIInternalStorage | undefined;

	/**
	 * Get API config, used by custom modules
	 */
	getAPIConfig: GetAPIConfig;

	/**
	 * Set API module
	 */
	setAPIModule: (provider: string, item: IconifyAPIModule) => void;
}

/**
 * Iconify interface
 */
export interface IconifyGlobal
	extends IconifyScanner,
		IconifyObserver,
		IconifyRenderer,
		IconifyAPI {
	/* General section */
	/**
	 * Get version
	 */
	getVersion: () => string;

	/* Scan DOM */
	/**
	 * Toggle local and session storage
	 */
	enableCache: (storage: IconifyCacheType, value: boolean) => void;

	/**
	 * Expose internal functions
	 */
	_internal: IconifyExposedInternals;
}

// Export dependencies
export { IconifyObserver, IconifyScanner, IconifyRenderer, IconifyAPI };

/**
 * Get icon name
 */
function getIconName(name: string): IconifyIconName | null {
	const icon = stringToIcon(name);
	if (!validateIcon(icon)) {
		return null;
	}
	return icon;
}

/**
 * Get icon data
 */
function getIconData(name: string): FullIconifyIcon | null {
	const icon = getIconName(name);
	return icon
		? getIcon(getStorage(icon.provider, icon.prefix), icon.name)
		: null;
}

/**
 * Get SVG data
 */
function buildIcon(
	name: string,
	customisations: IconifyIconCustomisations
): IconifyIconBuildResult | null {
	// Get icon data
	const iconData = getIconData(name);
	if (!iconData) {
		return null;
	}

	// Clean up customisations
	const changes = fullCustomisations(customisations);

	// Get data
	return iconToSVG(iconData, changes);
}

/**
 * Generate icon
 */
function generateIcon(
	name: string,
	customisations: IconifyIconCustomisations,
	returnString: boolean
): SVGElement | string | null {
	// Get icon data
	const iconData = getIconData(name);
	if (!iconData) {
		return null;
	}

	// Split name
	const iconName = stringToIcon(name);

	// Clean up customisations
	const changes = fullCustomisations(customisations);

	// Get data
	return (renderIcon(
		{
			name: iconName,
		},
		changes,
		iconData,
		returnString
	) as unknown) as SVGElement | string | null;
}

/**
 * Add icon set
 */
function addCollection(data: IconifyJSON, provider?: string) {
	if (typeof provider !== 'string') {
		provider = typeof data.provider === 'string' ? data.provider : '';
	}

	if (
		typeof data !== 'object' ||
		typeof data.prefix !== 'string' ||
		!validateIcon({
			provider,
			prefix: data.prefix,
			name: 'a',
		})
	) {
		return false;
	}

	const storage = getStorage(provider, data.prefix);
	return !!addIconSet(storage, data);
}

/**
 * Global variable
 */
const Iconify: IconifyGlobal = {
	// Version
	getVersion: () => '__iconify_version__',

	// Check if icon exists
	iconExists: (name) => getIconData(name) !== null,

	// Get raw icon data
	getIcon: (name) => {
		const result = getIconData(name);
		return result ? merge(result) : null;
	},

	// List icons
	listIcons: (provider?: string, prefix?: string) => {
		let icons = [];

		// Get providers
		let providers: string[];
		if (typeof provider === 'string') {
			providers = [provider];
		} else {
			providers = listStoredProviders();
		}

		// Get all icons
		providers.forEach((provider) => {
			let prefixes: string[];

			if (typeof prefix === 'string') {
				prefixes = [prefix];
			} else {
				prefixes = listStoredPrefixes(provider);
			}

			prefixes.forEach((prefix) => {
				const storage = getStorage(provider, prefix);
				let icons = Object.keys(storage.icons).map(
					(name) =>
						(provider !== '' ? '@' + provider + ':' : '') +
						prefix +
						':' +
						name
				);
				icons = icons.concat(icons);
			});
		});

		return icons;
	},

	// Load icons
	loadIcons: API.loadIcons,

	// Render SVG
	renderSVG: (name: string, customisations: IconifyIconCustomisations) => {
		return generateIcon(name, customisations, false) as SVGElement | null;
	},

	renderHTML: (name: string, customisations: IconifyIconCustomisations) => {
		return generateIcon(name, customisations, true) as string | null;
	},

	// Get rendered icon as object that can be used to create SVG (use replaceIDs on body)
	renderIcon: buildIcon,

	// Replace IDs in body
	replaceIDs: replaceIDs,

	// Add icon
	addIcon: (name, data) => {
		const icon = getIconName(name);
		if (!icon) {
			return false;
		}
		const storage = getStorage(icon.provider, icon.prefix);
		return addIcon(storage, icon.name, data);
	},

	// Add icon set
	addCollection: addCollection,

	// API providers
	addAPIProvider: setAPIConfig,

	// Scan DOM
	scanDOM: scanDOM,

	// Set root node
	setRoot: (root: HTMLElement) => {
		browserModules.root = root;

		// Restart observer
		observer.init(scanDOM);

		// Scan DOM on next tick
		setTimeout(scanDOM);
	},

	// Allow storage
	enableCache: (storage: IconifyCacheType, value: boolean) => {
		switch (storage) {
			case 'local':
			case 'session':
				config[storage] = value;
				break;

			case 'all':
				for (const key in config) {
					config[key] = value;
				}
				break;
		}
	},

	// Observer
	pauseObserver: observer.pause,
	resumeObserver: observer.resume,

	// Exposed internal functions
	_internal: {
		// Calculate size
		calculateSize: calcSize,

		// Get API data
		getAPI: getRedundancyCache,

		// Get API config
		getAPIConfig,

		// Get API module
		setAPIModule,
	},
};

/**
 * Initialise stuff
 */
// Set API
coreModules.api = API;
setAPIModule('', getAPIModule(getAPIConfig));

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
	// Add finder modules
	// addFinder(iconifyIconFinder);
	addFinder(iconifyFinder);

	// Set cache and load existing cache
	coreModules.cache = storeCache;
	loadCache();

	const _window = window;

	// Load icons from global "IconifyPreload"
	interface WindowWithIconifyPreload {
		IconifyPreload: IconifyJSON[] | IconifyJSON;
	}
	if (
		((_window as unknown) as WindowWithIconifyPreload).IconifyPreload !==
		void 0
	) {
		const preload = ((_window as unknown) as WindowWithIconifyPreload)
			.IconifyPreload;
		const err = 'Invalid IconifyPreload syntax.';
		if (typeof preload === 'object' && preload !== null) {
			(preload instanceof Array ? preload : [preload]).forEach((item) => {
				try {
					if (
						// Check if item is an object and not null/array
						typeof item !== 'object' ||
						item === null ||
						item instanceof Array ||
						// Check for 'icons' and 'prefix'
						typeof item.icons !== 'object' ||
						typeof item.prefix !== 'string' ||
						// Add icon set
						!addCollection(item)
					) {
						console.error(err);
					}
				} catch (e) {
					console.error(err);
				}
			});
		}
	}

	// Set API from global "IconifyProviders"
	interface WindowWithIconifyProviders {
		IconifyProviders: Record<string, PartialIconifyAPIConfig>;
	}
	if (
		((_window as unknown) as WindowWithIconifyProviders)
			.IconifyProviders !== void 0
	) {
		const providers = ((_window as unknown) as WindowWithIconifyProviders)
			.IconifyProviders;
		if (typeof providers === 'object' && providers !== null) {
			for (let key in providers) {
				const err = 'IconifyProviders[' + key + '] is invalid.';
				try {
					const value = providers[key];
					if (
						typeof value !== 'object' ||
						!value ||
						value.resources === void 0
					) {
						continue;
					}
					if (!setAPIConfig(key, value)) {
						console.error(err);
					}
				} catch (e) {
					console.error(err);
				}
			}
		}
	}

	// Load observer
	browserModules.observer = observer;
	setTimeout(() => {
		// Init on next tick when entire document has been parsed
		observer.init(scanDOM);
	});
}

export default Iconify;