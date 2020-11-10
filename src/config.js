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

class Config {
  constructor (defaults, types, envMap, { env = process.env, argv = process.argv, cwd = process.cwd() }) {
    this.defaults = defaults
    this.types = types
    this.envMap = envMap

    this.argv = argv
    this.env = env
    this.cwd = cwd

    // set up the prototype chain of config objects
    //
    // From my understanding, since CLI comes last
    // it gets and overwrites any defaults that may
    // have occurred when parsing the arguments
    const wheres = [...kTypes]
    this.data = new Map()
    let parent = null
    for (const where of wheres) {
      this.data.set(where, parent = new ConfigData(parent))
    }

    this.sources = new Map([])

    this.list = []
    for (const { data } of this.data.values()) {
      this.list.unshift(data)
    }
    Object.freeze(this.list)

    this[_loaded] = false
  }

  get loaded () {
    return this[_loaded]
  }

  get (key, where) {
    if (!this.loaded) { throw new Error('call config.load() before reading values') }
    return this[_get](key, where)
  }

  // we need to get values sometimes, so use this internal one to do so
  // while in the process of loading.
  [_get] (key, where = null) {
    if (where !== null && !kTypes.has(where)) {
      throw new Error('invalid config location param: ' + where)
    }
    const { data } = this.data.get(where || 'cli')
    return where === null || hasOwnProperty(data, key) ? data[key] : undefined
  }

  set (key, val, where = 'cli') {
    if (!this.loaded) { throw new Error('call config.load() before setting values') }
    if (!kTypes.has(where)) { throw new Error('invalid config location param: ' + where) }
    this.data.get(where).data[key] = val
  }

  load () {
    if (this.loaded) throw new Error('attempting to load config multiple times')

    this.loadDefaults()
    this.loadEnv()
    this.loadCLI()

    this[_loaded] = true
  }

  loadDefaults () {
    this[_loadObject](this.defaults, 'default', 'default-values')
  }

  loadEnv () {
    const conf = Object.create(null)
    for (const [envKey, envVal] of Object.entries(this.env)) {
      if (this.envMap[envKey] === undefined || envVal === '') continue
      conf[this.envMap[envKey]] = envVal
    }
    this[_loadObject](conf, 'env', 'environment')
  }

  loadCLI () {
    const conf = nopt(this.types, { }, this.argv, 2)
    this.parsedArgv = conf.argv
    delete conf.argv

    this[_loadObject](conf, 'cli', 'command line options')
    log.info('load', { ...conf, parsedArgv: this.parsedArgv }, 'loaded cli arguments')
  }

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
