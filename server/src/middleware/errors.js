export function notFound(_req, res) {
  res.status(404).json({ message: "Endpoint not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with this email or enrollment number already exists" });
  }
  const status = ["ValidationError", "CastError"].includes(err.name) ? 400 : 500;
  res.status(status).json({ message: err.message || "Internal server error" });
}
