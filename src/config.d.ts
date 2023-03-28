export interface ShortFlags {
    [k: string]: string[] | string
}

export type ConfigOptions<T extends Record<string, any>> = {
    env?: object;
    argv?: string[];
    cwd?: string;
    defaults?: object;
    types?: T;
    shorthand?: ShortFlags;
    envMap?: object;
};


export class Config<T extends Record<string, any>> {
    /**
     * @param {ConfigOptions} [options]
     *
     * @constructor
     * */
    constructor(options?: ConfigOptions);

    /** @type {Object} */
    defaults: any;

    /** @type {Object} */
    shorthand: ShortFlags;

    /** @type {Object} */
    types: T;

    /** @type {Object} */
    envMap: any;

    /** @type {[string]} */
    argv: string[];

    /** @type {Object} */
    env: any;

    /** @type {string} */
    cwd: string;

    parsedArgv: any;

    get loaded(): boolean;

    /**
     * Get a key from its source
     *
     * @param {string} key
     * @param {('cli'|'default'|'env')} [where]
     *
     * @return any
     * @throws
     * */
    get(key: keyof T): any
    get(key: string): any
    get(key: keyof T, where?: ('cli' | 'default' | 'env')): any;
    get(key: string, where?: ('cli' | 'default' | 'env')): any;

    /**
     * Set a value with its key in a source
     *
     * @param {string} key
     * @param {any} val
     * @param {('cli'|'default'|'env')} [where=cli]
     *
     * @throws
     * */
    set(key: string, val: any, where?: ('cli' | 'default' | 'env')): void;

    /**
     * Load the configuration
     *
     * @throws
     * */
    load(): void;
}
