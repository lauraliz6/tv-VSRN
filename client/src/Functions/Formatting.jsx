export function formatDate(date) {
  var time = new Date(date);
  let newTime = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  if (newTime === "12:00 AM") {
    newTime = "Any Time";
  }
  var month = time.getMonth() + 1;
  var day = time.getDate();
  var year = time.getFullYear();
  const newDate = month + "-" + day + "-" + year;
  return newDate + " " + newTime;
}
