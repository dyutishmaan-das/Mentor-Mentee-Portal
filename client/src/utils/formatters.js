export const initials = name => String(name || "?").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
export const errorMessage = error => error.response?.data?.message || error.message || "Something went wrong";
export const formatDate = date => date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
