export const cleanUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  phone: user.phone
});

export const studentScope = req =>
  req.user.role === "mentor"
    ? { mentor: req.user._id }
    : req.user.role === "student"
      ? { user: req.user._id }
      : {};
