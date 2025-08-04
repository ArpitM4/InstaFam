// Custom event system for cross-component communication

export const EVENTS = {
  PAYMENT_SUCCESS: 'payment_success',
  PROFILE_UPDATE: 'profile_update',
  ACCOUNT_TYPE_CHANGE: 'account_type_change',
  POINTS_UPDATE: 'points_update',
};

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventEmitter();

// Helper functions to emit common events
export const emitPaymentSuccess = (data) => {
  eventBus.emit(EVENTS.PAYMENT_SUCCESS, data);
};

export const emitProfileUpdate = (data) => {
  eventBus.emit(EVENTS.PROFILE_UPDATE, data);
};

export const emitAccountTypeChange = (accountType) => {
  eventBus.emit(EVENTS.ACCOUNT_TYPE_CHANGE, { accountType });
};

export const emitPointsUpdate = (points) => {
  eventBus.emit(EVENTS.POINTS_UPDATE, { points });
};
