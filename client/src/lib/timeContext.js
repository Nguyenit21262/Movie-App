const TIME_CONTEXT_TIMEZONE = "Asia/Ho_Chi_Minh";

const getHourInTimeZone = (date = new Date()) => {
  try {
    const hourPart = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_CONTEXT_TIMEZONE,
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .find((part) => part.type === "hour");

    const hour = Number(hourPart?.value);
    return Number.isInteger(hour) ? hour : date.getHours();
  } catch {
    return date.getHours();
  }
};

export const getCurrentTimeContextBucket = (date = new Date()) => {
  const hour = getHourInTimeZone(date);

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "evening";
  return "night";
};

