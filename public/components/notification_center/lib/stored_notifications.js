import { find, isArray, remove, chain, pick } from 'lodash';

const NOT_INSERTABLE_ERROR = new Error('StoredNotifications cannot insert directly. Please use `StoredNotifications.merge`.');
export class StoredNotifications extends Array {
  constructor(key = 'KBN::NOTIFS') {
    super();
    this.key = key;

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
        const mergeable = find(this, pick(item, ['type', 'content', 'stack', 'title', 'icon']));
        if (mergeable) {
          mergeable.count += (item.count || 1);
        }
        return !mergeable;
      })
      .map(item => chain(item)
        .defaults({ timestamp, count: 1 })
        .pick(['timestamp', 'type', 'content', 'stack', 'title', 'icon', 'count'])
        .value());
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
      localStorage.setItem(this.key, JSON.stringify(this));
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
