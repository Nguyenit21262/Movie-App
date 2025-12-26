const formatTime = (time) => {
  const [h, m] = time.split(":");
  const hour = +h;
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};
export default formatTime;