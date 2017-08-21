import { has, get, set, isObject } from 'lodash';

export class StoredConfig {
  constructor(defaultConfig = {}, key = 'KBN::NOTIFS::CONFIG') {
    this.key = key;
    this.config = defaultConfig;
  };

  has(path) {
    return has(this.config, path);
  };

  get(path, defaultValue) {
    return get(this.config, path, defaultValue);
  };

  set(path, value) {
    return set(this.config, path, value);
  };

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.config));
    return this;
  };

  load() {
    try {
      const storedConfig = JSON.parse(localStorage.getItem(this.key));
      if (isObject(storedConfig)) {
        this.config = storedConfig;
      }
    } catch (e) {
      console.warn('Failed to load stored config.\n', e);
    }
    return this;
  };
};