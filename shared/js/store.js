const BLANK = { mode: null, section: 'all', review: [], missed: [] };

export class Store {
  constructor(id) {
    this.key = `study-guide:${id}`;
    this.data = { ...BLANK, ...read(this.key) };
  }

  get(name) {
    return this.data[name];
  }

  set(name, value) {
    this.data[name] = value;
    write(this.key, this.data);
  }

  reset() {
    this.data = { ...BLANK };
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? {};
  } catch {
    return {};
  }
}

function write(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}
