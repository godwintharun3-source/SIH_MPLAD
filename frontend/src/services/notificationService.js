/**
 * Chrome Browser & Web Notification Service
 * Dispatches native browser desktop notifications and in-app alerts,
 * enabling real-time audit news delivery even before login.
 */

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.history = [];
    this.hasPermission = this.checkPermission();
  }

  checkPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  async requestPermission() {
    if (!this.isSupported()) {
      return { supported: false, granted: false };
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return { supported: true, granted: this.hasPermission, status: permission };
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return { supported: true, granted: false, error: err.message };
    }
  }

  /**
   * Dispatches a native Chrome/Browser Notification and logs to in-app stream
   */
  sendNotification(title, options = {}) {
    const item = {
      id: Date.now() + Math.random(),
      title,
      body: options.body || '',
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'mplad-alert',
      timestamp: new Date().toLocaleTimeString(),
      type: options.type || 'INFO'
    };

    // Record in in-memory feed
    this.history.unshift(item);
    if (this.history.length > 20) this.history.pop();
    this.notifyListeners(item);

    // If browser notification permission is granted, dispatch desktop alert
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: 'https://img.icons8.com/fluency/96/courthouse.png',
          badge: 'https://img.icons8.com/fluency/48/law.png',
          tag: options.tag || 'mplad-audit-update',
          renotify: true,
          requireInteraction: options.requireInteraction || false,
          silent: false,
          data: options.data || {}
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification dispatch error:', err);
      }
    }

    return item;
  }

  /**
   * Dispatches breaking MPLAD Audit Intelligence news updates
   * (can be triggered directly from the opening portfolio page prior to logging in)
   */
  triggerPreLoginAuditNews() {
    const breakingNews = [
      {
        title: '🚨 CRITICAL RISK ALERT: Project #80673 Flagged',
        body: 'Cost deviation of +100% detected in Amritsar (Punjab). Final expenditure ₹10.0L exceeds sanctioned limit.',
        type: 'CRITICAL'
      },
      {
        title: '🏛️ Rajya Sabha Parliamentary Division Live',
        body: 'Ingested 231 Rajya Sabha MPs with ₹34,818 Cr allocation & 37,733 development works.',
        type: 'INFO'
      },
      {
        title: '👥 Citizen Audit Mode Activated',
        body: 'Public auditors can inspect state-scoped expenditures or toggle between Lok Sabha & Rajya Sabha.',
        type: 'SUCCESS'
      }
    ];

    // Stagger notifications for maximum impact
    breakingNews.forEach((news, idx) => {
      setTimeout(() => {
        this.sendNotification(news.title, {
          body: news.body,
          type: news.type,
          tag: `mplad-breaking-${idx}`
        });
      }, idx * 1200);
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(notification) {
    this.listeners.forEach(fn => fn(notification));
  }

  getHistory() {
    return [...this.history];
  }
}

export const notificationService = new NotificationService();
export default notificationService;
