import { User, Package, Bill, SupportTicket } from "../models/index.js";

/**
 * Get user package information by user ID
 * @param {number} user_id - The user ID
 * @returns {Object} User with package information
 */
export const getUserPackageInfo = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Package,
          as: "package",
          attributes: [
            "id",
            "package_id",
            "name",
            "price",
            "data_limit_gb",
            "voice_minutes",
            "sms_count",
            "features",
            "is_active",
          ],
        },
      ],
      attributes: [
        "id",
        "customer_id",
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "current_package_id",
        "payment_status",
        "balance",
        "data_usage_gb",
        "voice_usage_minutes",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user_info: {
        id: user.id,
        customer_id: user.customer_id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
        email: user.email,
        payment_status: user.payment_status,
        balance: user.balance,
        data_usage_gb: user.data_usage_gb,
        voice_usage_minutes: user.voice_usage_minutes,
      },
      current_package: user.package
        ? {
            package_id: user.package.package_id,
            name: user.package.name,
            price: user.package.price,
            data_limit_gb: user.package.data_limit_gb,
            voice_minutes: user.package.voice_minutes,
            sms_count: user.package.sms_count,
            features: user.package.features,
            is_active: user.package.is_active,
            usage_summary: {
              data_used_percentage:
                user.package.data_limit_gb > 0
                  ? (
                      (user.data_usage_gb / user.package.data_limit_gb) *
                      100
                    ).toFixed(2)
                  : 0,
              voice_used_percentage:
                user.package.voice_minutes > 0
                  ? (
                      (user.voice_usage_minutes / user.package.voice_minutes) *
                      100
                    ).toFixed(2)
                  : 0,
              remaining_data_gb:
                user.package.data_limit_gb > 0
                  ? Math.max(0, user.package.data_limit_gb - user.data_usage_gb)
                  : "Unlimited",
              remaining_voice_minutes:
                user.package.voice_minutes > 0
                  ? Math.max(
                      0,
                      user.package.voice_minutes - user.voice_usage_minutes
                    )
                  : "Unlimited",
            },
          }
        : null,
    };
  } catch (error) {
    throw new Error(`Error fetching user package info: ${error.message}`);
  }
};

/**
 * Get user bill information by user ID
 * @param {number} user_id - The user ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of bills to return (default: 10)
 * @param {string} options.payment_status - Filter by payment status
 * @returns {Object} User bills information
 */
export const getUserBillInfo = async (user_id, options = {}) => {
  try {
    const { limit = 10, payment_status } = options;

    // First get user basic info
    const user = await User.findByPk(user_id, {
      attributes: [
        "id",
        "customer_id",
        "first_name",
        "last_name",
        "phone_number",
        "payment_status",
        "balance",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Build where clause for bills
    const whereClause = { user_id };
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }

    // Get bills with pagination
    const { count, rows: bills } = await Bill.findAndCountAll({
      where: whereClause,
      limit,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "bill_id",
        "billing_period_start",
        "billing_period_end",
        "due_date",
        "total_amount",
        "payment_status",
        "payment_date",
        "data_used_gb",
        "voice_used_minutes",
        "created_at",
      ],
    });

    // Calculate summary statistics
    const totalOwed = bills
      .filter(
        (bill) =>
          bill.payment_status === "pending" || bill.payment_status === "overdue"
      )
      .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

    const overdueBills = bills.filter(
      (bill) =>
        bill.payment_status === "overdue" ||
        (bill.payment_status === "pending" &&
          new Date(bill.due_date) < new Date())
    );

    return {
      user_info: {
        id: user.id,
        customer_id: user.customer_id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
        payment_status: user.payment_status,
        current_balance: user.balance,
      },
      billing_summary: {
        total_bills: count,
        total_owed: totalOwed,
        overdue_bills_count: overdueBills.length,
        overdue_amount: overdueBills.reduce(
          (sum, bill) => sum + (bill.total_amount || 0),
          0
        ),
      },
      recent_bills: bills.map((bill) => ({
        bill_id: bill.bill_id,
        billing_period: {
          start: bill.billing_period_start,
          end: bill.billing_period_end,
        },
        due_date: bill.due_date,
        amount: bill.total_amount,
        payment_status: bill.payment_status,
        payment_date: bill.payment_date,
        usage: {
          data_used_gb: bill.data_used_gb,
          voice_used_minutes: bill.voice_used_minutes,
        },
        created_at: bill.created_at,
        is_overdue:
          bill.payment_status === "overdue" ||
          (bill.payment_status === "pending" &&
            new Date(bill.due_date) < new Date()),
      })),
    };
  } catch (error) {
    throw new Error(`Error fetching user bill info: ${error.message}`);
  }
};

/**
 * Get user support tickets by user ID
 * @param {number} user_id - The user ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of tickets to return (default: 20)
 * @param {string} options.status - Filter by status
 * @param {string} options.priority - Filter by priority
 * @returns {Object} User support tickets information
 */
export const getUserSupportTickets = async (user_id, options = {}) => {
  try {
    const { limit = 20, status, priority } = options;

    // First get user basic info
    const user = await User.findByPk(user_id, {
      attributes: [
        "id",
        "customer_id",
        "first_name",
        "last_name",
        "phone_number",
        "email",
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Build where clause for tickets
    const whereClause = { user_id };
    if (status) {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    // Get tickets with pagination
    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
      limit,
      order: [
        ["priority", "DESC"], // High priority first
        ["created_at", "DESC"], // Most recent first
      ],
      attributes: [
        "id",
        "ticket_id",
        "issue_type",
        "priority",
        "status",
        "title",
        "description",
        "resolution",
        "created_at",
        "resolved_at",
      ],
    });

    // Calculate summary statistics
    const statusCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    const priorityCounts = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});

    const openTickets = tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress"
    );

    const resolvedTickets = tickets.filter(
      (ticket) => ticket.status === "resolved" || ticket.status === "closed"
    );

    // Calculate average resolution time for resolved tickets
    const avgResolutionTime =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, ticket) => {
            if (ticket.resolved_at) {
              const resolutionTime =
                new Date(ticket.resolved_at) - new Date(ticket.created_at);
              return sum + resolutionTime;
            }
            return sum;
          }, 0) / resolvedTickets.length
        : 0;

    const avgResolutionDays = Math.round(
      avgResolutionTime / (1000 * 60 * 60 * 24)
    );

    return {
      user_info: {
        id: user.id,
        customer_id: user.customer_id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
        email: user.email,
      },
      tickets_summary: {
        total_tickets: count,
        open_tickets: openTickets.length,
        resolved_tickets: resolvedTickets.length,
        avg_resolution_days: avgResolutionDays,
        status_breakdown: statusCounts,
        priority_breakdown: priorityCounts,
      },
      tickets: tickets.map((ticket) => ({
        ticket_id: ticket.ticket_id,
        issue_type: ticket.issue_type,
        priority: ticket.priority,
        status: ticket.status,
        title: ticket.title,
        description: ticket.description,
        resolution: ticket.resolution,
        created_at: ticket.created_at,
        resolved_at: ticket.resolved_at,
        days_open: Math.ceil(
          (new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60 * 24)
        ),
        is_overdue:
          ticket.status === "open" &&
          Math.ceil(
            (new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60 * 24)
          ) > 7, // 7 days threshold
      })),
    };
  } catch (error) {
    throw new Error(`Error fetching user support tickets: ${error.message}`);
  }
};

/**
 * Get comprehensive user information (combines all above functions)
 * @param {number} user_id - The user ID
 * @returns {Object} Complete user information
 */
export const getUserCompleteInfo = async (user_id) => {
  try {
    const [packageInfo, billInfo, ticketInfo] = await Promise.all([
      getUserPackageInfo(user_id),
      getUserBillInfo(user_id, { limit: 5 }),
      getUserSupportTickets(user_id, { limit: 10 }),
    ]);

    return {
      package_info: packageInfo,
      billing_info: billInfo,
      support_info: ticketInfo,
      summary: {
        customer_status: packageInfo.user_info.payment_status,
        total_owed: billInfo.billing_summary.total_owed,
        open_tickets: ticketInfo.tickets_summary.open_tickets,
        last_updated: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching complete user info: ${error.message}`);
  }
};
