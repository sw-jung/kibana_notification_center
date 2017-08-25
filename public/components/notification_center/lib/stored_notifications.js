import { find, isArray, remove, chain, pick, defaults, union } from 'lodash';

const NOT_INSERTABLE_ERROR = new Error('StoredNotifications cannot insert directly. Please use `StoredNotifications.merge`.');
export class StoredNotifications extends Array {
  constructor(key) {
    super();
    this.key = `KBN::NOTIFS-${key}`;

    this.push = (...items) => {
      throw NOT_INSERTABLE_ERROR;
    };

    this.unshift = (...items) => {
      throw NOT_INSERTABLE_ERROR;
    };

    this.merge = (...items) => {
      const timestamp = new Date().valueOf();
      const freshItems = chain(items)
      .filter(item => {
        const mergeable = find(this, pick(item, ['type', 'content']));
        if (mergeable) {
          mergeable.timestamp = item.timestamp;
          mergeable.count += (item.count || 1);
          mergeable.stacks = union(mergeable.stacks, item.stacks);
        }
        return !mergeable;
      })
      .map(item => defaults(item, { timestamp, count: 1 }))
      .value();
      const result = super.push(...freshItems);
      this.save();
      return result;
    };

    this.remove = (predicate) => {
      const result = remove(this, predicate);
      this.save();
      return result;
    };

    this.save = () => {
      const requiredFields = ['timestamp', 'type', 'content', 'stack', 'stacks', 'title', 'icon', 'count'];
      const items = this.map(item => pick(item,requiredFields));
      localStorage.setItem(this.key, JSON.stringify(items));
      return this;
    };

    this.load = () => {
      try {
        const storedList = JSON.parse(localStorage.getItem(this.key));
        if (isArray(storedList)) {
          this.length = 0;
          this.merge(...storedList);
        }
      } catch (e) {
        console.warn('Failed to load stored notifications.\n', e);
      }
      return this;
    };

    this.isEmpty = () => {
      return this.length === 0;
    };
  };

};
