/**
 * Notification Service
 * Provides proactive alerts and insights notifications
 */

const NOTIFICATION_STORAGE_KEY = "ai_concierge_notifications";
const MAX_NOTIFICATIONS = 100;

/**
 * Get all notifications
 * @returns {Array} Array of notifications
 */
export const getNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
  return [];
};

/**
 * Save notifications
 * @param {Array} notifications - Notifications to save
 */
const saveNotifications = (notifications) => {
  try {
    // Keep only recent notifications
    const recent = notifications.slice(-MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(recent));
  } catch (error) {
    console.error("Error saving notifications:", error);
  }
};

/**
 * Add a notification
 * @param {Object} notification - Notification object
 */
export const addNotification = (notification) => {
  const notifications = getNotifications();
  const newNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false,
    ...notification,
  };
  notifications.push(newNotification);
  saveNotifications(notifications);
  return newNotification;
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export const markAsRead = (notificationId) => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = () => {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 */
export const deleteNotification = (notificationId) => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
};

/**
 * Clear all notifications
 */
export const clearNotifications = () => {
  saveNotifications([]);
};

/**
 * Get unread notification count
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = () => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

/**
 * Create insight alert notification
 * @param {Object} insight - Insight data
 */
export const createInsightAlert = (insight) => {
  return addNotification({
    type: "insight",
    title: "New Insight Available",
    message: insight.summary || "New insights have been generated from your knowledge base",
    data: insight,
    priority: "medium",
  });
};

/**
 * Create improvement suggestion notification
 * @param {Object} suggestion - Suggestion data
 */
export const createImprovementNotification = (suggestion) => {
  return addNotification({
    type: "improvement",
    title: "Improvement Suggestion",
    message: suggestion.title || suggestion.description || "A new improvement suggestion is available",
    data: suggestion,
    priority: suggestion.priority || "medium",
  });
};

/**
 * Create related content notification
 * @param {Object} content - Content data
 */
export const createRelatedContentNotification = (content) => {
  return addNotification({
    type: "related_content",
    title: "Related Content Found",
    message: `New content related to "${content.topic || "your work"}" has been found`,
    data: content,
    priority: "low",
  });
};

/**
 * Create action item reminder
 * @param {Object} actionItem - Action item data
 */
export const createActionReminder = (actionItem) => {
  return addNotification({
    type: "action_reminder",
    title: "Action Item Reminder",
    message: actionItem.description || "You have a pending action item",
    data: actionItem,
    priority: actionItem.priority || "medium",
  });
};

/**
 * Create knowledge update notification
 * @param {Object} update - Update data
 */
export const createKnowledgeUpdateNotification = (update) => {
  return addNotification({
    type: "knowledge_update",
    title: "Knowledge Base Updated",
    message: update.message || "Your knowledge base has been updated",
    data: update,
    priority: "low",
  });
};

/**
 * Check for new insights and create notifications
 * @param {string|Array<string>} storeNames - Store name(s)
 * @param {Function} onNewInsight - Callback for new insights
 */
export const checkForNewInsights = async (storeNames, onNewInsight = null) => {
  try {
    // This would typically call the concierge service to check for new insights
    // For now, we'll just return a placeholder
    const notifications = getNotifications();
    const lastInsightCheck = localStorage.getItem("last_insight_check");
    const now = Date.now();
    
    // Check if enough time has passed (e.g., 1 hour)
    if (lastInsightCheck && (now - parseInt(lastInsightCheck)) < 3600000) {
      return; // Too soon to check again
    }
    
    localStorage.setItem("last_insight_check", now.toString());
    
    // In a real implementation, this would call the concierge service
    // and create notifications for new insights
    if (onNewInsight) {
      onNewInsight();
    }
  } catch (error) {
    console.error("Error checking for new insights:", error);
  }
};

/**
 * Get notifications by type
 * @param {string} type - Notification type
 * @returns {Array} Filtered notifications
 */
export const getNotificationsByType = (type) => {
  const notifications = getNotifications();
  return notifications.filter(n => n.type === type);
};

/**
 * Get notifications by priority
 * @param {string} priority - Priority level
 * @returns {Array} Filtered notifications
 */
export const getNotificationsByPriority = (priority) => {
  const notifications = getNotifications();
  return notifications.filter(n => n.priority === priority);
};

