/**
 * This is a stripped version of npm/config
 *
 * I will smooth this out in the future maybe just forking the original
 *
 * But for now this will work.
 *
 * @see https://github.com/npm/config
 * */

const nopt = require('nopt')

const log = require('./utils/log')
const { parseField } = require('./utils')

const hasOwnProperty = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const kTypes = new Set([
  'default',
  'env',
  'cli'
])

const _loaded = Symbol('loaded')
const _loadObject = Symbol('loadObject')
const _get = Symbol('get')

/**
 * @typedef {Object} ConfigOptions
 *
 * This values are only set for testing purposes
 *
 * @property {Object} [env]
 * @property {Array<string>} [argv]
 * @property {string} [cwd]
 * */

/**
 * Configuration handler
 *
 * @class
 * */
class Config {
  /**
   * @param {Object} defaults
   * @param {Object} types
   * @param {Object} envMap
   * @param {ConfigOptions} [options]
   *
   * @constructor
   * */
  constructor (defaults, types, envMap, { env = process.env, argv = process.argv, cwd = process.cwd() }) {
    /** @type {Object} */
    this.defaults = defaults

    /** @type {Object} */
    this.types = types

    /** @type {Object} */
    this.envMap = envMap

    /** @type {Array<string>} */
    this.argv = argv

    /** @type {Object} */
    this.env = env

    /** @type {string} */
    this.cwd = cwd

    // set up the prototype chain of config objects
    //
    // From my understanding, since CLI comes last
    // it gets and overwrites any defaults that may
    // have occurred when parsing the arguments
    const wheres = [...kTypes]

    /**
     * @type {Map<('cli'|'default'|'env'), ConfigData>}
     * @private
     * */
    this.data = new Map()
    let parent = null
    for (const where of wheres) {
      this.data.set(where, parent = new ConfigData(parent))
    }

    /**
     * @type {Map<string, ('cli'|'default'|'env')>}
     * @private
     * */
    this.sources = new Map([])

    /**
     * @type {Array<ConfigData>}
     * @private
     * */
    this.list = []
    for (const { data } of this.data.values()) {
      this.list.unshift(data)
    }
    Object.freeze(this.list)

    /**
     * @type Boolean
     * @private
     * */
    this[_loaded] = false
  }

  /**
   * Get if the configuration is loaded
   *
   * @type {Boolean}
   * */
  get loaded () {
    return this[_loaded]
  }

  /**
   * Get a key from its source
   *
   * @param {string} key
   * @param {('cli'|'default'|'env')} [where]
   *
   * @return any
   * @throws
   * */
  get (key, where) {
    if (!this.loaded) { throw new Error('call config.load() before reading values') }
    return this[_get](key, where)
  }

  /**
   * we need to get values sometimes, so use this internal one to do so
   * while in the process of loading.
   *
   * @param {string} key
   * @param {string|null} where
   *
   * @private
   * */
  [_get] (key, where = null) {
    if (where !== null && !kTypes.has(where)) {
      throw new Error('invalid config location param: ' + where)
    }
    const { data } = this.data.get(where || 'cli')
    return where === null || hasOwnProperty(data, key) ? data[key] : undefined
  }

  /**
   * Set a value with its key in a source
   *
   * @param {string} key
   * @param {any} val
   * @param {('cli'|'default'|'env')} [where=cli]
   *
   * @throws
   * */
  set (key, val, where = 'cli') {
    if (!this.loaded) { throw new Error('call config.load() before setting values') }
    if (!kTypes.has(where)) { throw new Error('invalid config location param: ' + where) }
    this.data.get(where).data[key] = val
  }

  /**
   * Load the configuration
   *
   * @throws
   * */
  load () {
    if (this.loaded) throw new Error('attempting to load config multiple times')

    this.loadDefaults()
    this.loadEnv()
    this.loadCLI()

    this[_loaded] = true
  }

  /**
   * @private
   * */
  loadDefaults () {
    this[_loadObject](this.defaults, 'default', 'default-values')
  }

  /**
   * @private
   * */
  loadEnv () {
    const conf = Object.create(null)
    for (const [envKey, envVal] of Object.entries(this.env)) {
      if (this.envMap[envKey] === undefined || envVal === '') continue
      conf[this.envMap[envKey]] = envVal
    }
    this[_loadObject](conf, 'env', 'environment')
  }

  /**
   * @private
   * */
  loadCLI () {
    const conf = nopt(this.types, { }, this.argv, 2)
    this.parsedArgv = conf.argv
    delete conf.argv

    this[_loadObject](conf, 'cli', 'command line options')
    log.info('load', { ...conf, parsedArgv: this.parsedArgv }, 'loaded cli arguments')
  }

  /**
   * Load the values based on source
   *
   * @param {Object} obj
   * @param {string} where
   * @param {string} source
   * @param {Error} er
   *
   * @private
   * */
  [_loadObject] (obj, where, source, er = null) {
    const conf = this.data.get(where)
    if (conf.source) {
      const m = `double-loading "${where}" configs from ${source}, ` +
                `previously loaded from ${conf.source}`
      throw new Error(m)
    }

    if (this.sources.has(source)) {
      const m = `double-loading config "${source}" as "${where}", ` +
                `previously loaded as "${this.sources.get(source)}"`
      throw new Error(m)
    }

    conf.source = source
    this.sources.set(source, where)
    if (er) {
      conf.loadError = er
      if (er.code !== 'ENOENT') log.verbose('config', `error loading ${where} config`, er)
    } else {
      conf.raw = obj
      for (const [key, value] of Object.entries(obj)) {
        conf.data[key] = parseField(this.types, value, key)
      }
    }
  }
}

const _data = Symbol('data')
const _raw = Symbol('raw')
const _loadError = Symbol('loadError')
const _source = Symbol('source')
const _valid = Symbol('valid')

/**
 * Hold the data for the source
 *
 * @private
 * */
class ConfigData {
  constructor (parent) {
    this[_data] = Object.create(parent && parent.data)
    this[_source] = null
    this[_loadError] = null
    this[_raw] = null
    this[_valid] = true
  }

  get data () {
    return this[_data]
  }

  get valid () {
    return this[_valid]
  }

  set source (s) {
    if (this[_source]) { throw new Error('cannot set ConfigData source more than once') }
    this[_source] = s
  }

  get source () { return this[_source] }

  set loadError (e) {
    if (this[_loadError] || this[_raw]) { throw new Error('cannot set ConfigData loadError after load') }
    this[_loadError] = e
  }

  get loadError () { return this[_loadError] }

  set raw (r) {
    if (this[_raw] || this[_loadError]) { throw new Error('cannot set ConfigData raw after load') }
    this[_raw] = r
  }

  get raw () { return this[_raw] }
}

module.exports = Config
