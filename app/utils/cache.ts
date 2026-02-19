export const actionsCache = {
  data: null as any[] | null,
  timestamp: 0,
  set(actions: any[]) {
    this.data = actions;
    this.timestamp = Date.now();
  },
  get() {
    // Cache valid for 5 minutes (adjustable)
    if (Date.now() - this.timestamp > 5 * 60 * 1000) {
      this.data = null;
      return null;
    }
    return this.data;
  },
  clear() {
    this.data = null;
    this.timestamp = 0;
  },
};

export const partnersCache = {
  data: null as any[] | null,
  timestamp: 0,
  set(partners: any[]) {
    this.data = partners;
    this.timestamp = Date.now();
  },
  get() {
    // Cache valid for 30 minutes (partners change less frequently)
    if (Date.now() - this.timestamp > 30 * 60 * 1000) {
      this.data = null;
      return null;
    }
    return this.data;
  },
  clear() {
    this.data = null;
    this.timestamp = 0;
  },
};
