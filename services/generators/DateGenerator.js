function isMoreThanOneMonthAgo(timestamp) {
  const oneMonthInMilliseconds = 7 * 24 * 60 * 60 * 1000; // Assuming 30 days in a month

  const currentTimestamp = Date.now();
  const difference = currentTimestamp - timestamp;

  return difference > oneMonthInMilliseconds;
}

function hoursBetween(stampOne, stampTwo) {
  const difference = Math.abs(stampOne - stampTwo)
  const hour = 60 * 60 * 1000
  return Math.floor(difference / hour)
}

function GenerateDateInGMT() {
  const date = new Date(new Date().setUTCMinutes(new Date().getUTCMinutes() + 60)).toISOString()
  return date;
}

function GenerateTimePassed(timestamp) {
  const now = Date.now();
  const timeDiff = now - timestamp;

  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 2) {
    return `${days} days ago`;
  } else if (days === 1) {
    return '1 day ago';
  } else if (hours >= 2) {
    return `${hours} hours ago`;
  } else if (hours === 1) {
    return '1 hour ago';
  } else if (minutes >= 2) {
    return `${minutes} minutes ago`;
  } else if (minutes === 1) {
    return '1 minute ago';
  } else {
    return 'just now';
  }
}

function GenerateDateTime(timestamp) {
  if (!isMoreThanOneMonthAgo(timestamp)) return GenerateTimePassed(timestamp);

  const date = new Date(timestamp);
  const currentYear = new Date().getFullYear();
  const year = date.getFullYear();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const ampm = hour >= 12 ? 'pm' : 'am';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

  let formattedDate = `${month} ${day}`;

  if (year !== currentYear) {
    formattedDate += `, ${year}`;
  }

  formattedDate += ` at ${formattedHour}:${String(minute).padStart(2, '0')}${ampm}`;

  return formattedDate;
}

const DateGenerator = {
  isMoreThanOneMonthAgo,
  hoursBetween,
  
  GenerateDateInGMT,
  GenerateTimePassed,
  GenerateDateTime
}

export default DateGenerator;