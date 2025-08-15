/**
 * Utility functions for user information retrieval
 * These functions can be imported and used throughout the application
 */

import {
  getUserPackageInfo,
  getUserBillInfo,
  getUserSupportTickets,
  getUserCompleteInfo,
} from "../services/userService.js";

/**
 * Export all user utility functions for easy import
 */
export {
  getUserPackageInfo,
  getUserBillInfo,
  getUserSupportTickets,
  getUserCompleteInfo,
};

/**
 * Convenience wrapper functions with additional functionality
 */

/**
 * Get user package info with usage alerts
 * @param {number} user_id
 * @returns {Object} Package info with usage alerts
 */
export const getUserPackageInfoWithAlerts = async (user_id) => {
  const packageInfo = await getUserPackageInfo(user_id);

  // Add usage alerts
  const alerts = [];
  if (
    packageInfo.current_package &&
    packageInfo.current_package.usage_summary
  ) {
    const usage = packageInfo.current_package.usage_summary;

    if (parseFloat(usage.data_used_percentage) > 90) {
      alerts.push({
        type: "warning",
        message: "Data usage is over 90% of your limit",
        action: "Consider upgrading your package or monitoring usage",
      });
    }

    if (parseFloat(usage.voice_used_percentage) > 90) {
      alerts.push({
        type: "warning",
        message: "Voice usage is over 90% of your limit",
        action:
          "Consider upgrading your package or using alternative communication",
      });
    }
  }

  return {
    ...packageInfo,
    alerts,
  };
};

/**
 * Get user bills with payment reminders
 * @param {number} user_id
 * @returns {Object} Bill info with payment reminders
 */
export const getUserBillInfoWithReminders = async (user_id) => {
  const billInfo = await getUserBillInfo(user_id);

  // Add payment reminders
  const reminders = [];
  if (billInfo.billing_summary.overdue_bills_count > 0) {
    reminders.push({
      type: "urgent",
      message: `You have ${billInfo.billing_summary.overdue_bills_count} overdue bill(s)`,
      amount: billInfo.billing_summary.overdue_amount,
      action: "Please make payment immediately to avoid service interruption",
    });
  }

  if (billInfo.billing_summary.total_owed > 0) {
    reminders.push({
      type: "info",
      message: `Total outstanding amount: $${billInfo.billing_summary.total_owed}`,
      action: "Please review and pay pending bills",
    });
  }

  return {
    ...billInfo,
    reminders,
  };
};

/**
 * Get user tickets with priority alerts
 * @param {number} user_id
 * @returns {Object} Ticket info with priority alerts
 */
export const getUserTicketsWithAlerts = async (user_id) => {
  const ticketInfo = await getUserSupportTickets(user_id);

  // Add priority alerts
  const alerts = [];
  const urgentTickets = ticketInfo.tickets.filter(
    (t) => t.priority === "urgent" && t.status === "open"
  );
  const overdueTickets = ticketInfo.tickets.filter((t) => t.is_overdue);

  if (urgentTickets.length > 0) {
    alerts.push({
      type: "urgent",
      message: `You have ${urgentTickets.length} urgent open ticket(s)`,
      action: "These require immediate attention",
    });
  }

  if (overdueTickets.length > 0) {
    alerts.push({
      type: "warning",
      message: `You have ${overdueTickets.length} overdue ticket(s)`,
      action: "Please follow up on these tickets",
    });
  }

  return {
    ...ticketInfo,
    alerts,
  };
};

/**
 * Get comprehensive user dashboard data
 * @param {number} user_id
 * @returns {Object} Complete dashboard information
 */
export const getUserDashboard = async (user_id) => {
  const [packageInfo, billInfo, ticketInfo] = await Promise.all([
    getUserPackageInfoWithAlerts(user_id),
    getUserBillInfoWithReminders(user_id),
    getUserTicketsWithAlerts(user_id),
  ]);

  // Combine all alerts
  const allAlerts = [
    ...packageInfo.alerts,
    ...billInfo.reminders,
    ...ticketInfo.alerts,
  ];

  // Determine overall account status
  let accountStatus = "good";
  if (billInfo.billing_summary.overdue_bills_count > 0) {
    accountStatus = "payment_required";
  } else if (ticketInfo.tickets_summary.open_tickets > 2) {
    accountStatus = "support_needed";
  } else if (allAlerts.some((alert) => alert.type === "urgent")) {
    accountStatus = "attention_required";
  }

  return {
    user_info: packageInfo.user_info,
    account_status: accountStatus,
    dashboard_summary: {
      package_name: packageInfo.current_package?.name || "No Package",
      monthly_bill: packageInfo.current_package?.price || 0,
      outstanding_amount: billInfo.billing_summary.total_owed,
      open_tickets: ticketInfo.tickets_summary.open_tickets,
      data_usage_percentage:
        packageInfo.current_package?.usage_summary?.data_used_percentage || 0,
      voice_usage_percentage:
        packageInfo.current_package?.usage_summary?.voice_used_percentage || 0,
    },
    alerts: allAlerts,
    package_info: packageInfo,
    billing_info: billInfo,
    support_info: ticketInfo,
    last_updated: new Date().toISOString(),
  };
};

// Example usage:
// import { getUserPackageInfo, getUserDashboard } from './utils/userUtils.js';
//
// const packageInfo = await getUserPackageInfo(1);
// const dashboard = await getUserDashboard(1);
