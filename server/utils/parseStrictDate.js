const DATE_INPUT_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export const parseStrictDate = (value) => {
  const normalizedValue = String(value || "").trim();
  const match = DATE_INPUT_REGEX.exec(normalizedValue);

  if (!match) {
    return { isValid: false, date: null };
  }

  const [, dayString, monthString, yearString] = match;
  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  const parsedDate = new Date(year, month - 1, day);
  const isSameCalendarDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  if (!isSameCalendarDate) {
    return { isValid: false, date: null };
  }

  return { isValid: true, date: parsedDate };
};
