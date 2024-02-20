export default function formatDate(nanoTimestamp: number): string {
  try {
    // Convert nanoseconds to milliseconds
    const date = new Date(nanoTimestamp / 1000000);
    const currentDate = new Date();

    const timeDifference = currentDate.getTime() - date.getTime();
    const millisecondsPerSecond = 1000;
    const millisecondsPerMinute = 60 * millisecondsPerSecond;
    const millisecondsPerHour = 60 * millisecondsPerMinute;
    const millisecondsPerDay = 24 * millisecondsPerHour;
    const millisecondsPerWeek = 7 * millisecondsPerDay;

    if (timeDifference < millisecondsPerMinute) {
      // Less than a minute
      const seconds = Math.floor(timeDifference / millisecondsPerSecond);
      return `${seconds} seconds`;
    }
    if (timeDifference < millisecondsPerHour) {
      // Less than an hour
      return `${Math.floor(timeDifference / millisecondsPerMinute)}m`;
    }
    if (timeDifference < millisecondsPerDay) {
      // Less than a day
      return `${Math.floor(timeDifference / millisecondsPerHour)}h`;
    }
    if (timeDifference < millisecondsPerWeek) {
      // Less than a week
      return `${Math.floor(timeDifference / millisecondsPerDay)}d`;
    }
    // More than or equal to a week
    return `${Math.floor(timeDifference / millisecondsPerWeek)}w`;
  } catch (error) {
    return '';
  }
}

export function formatVODDate(timestamp: number) {
  const date = new Date(timestamp);
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return formattedDate;
}
