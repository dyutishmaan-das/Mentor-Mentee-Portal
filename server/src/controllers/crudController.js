export const crudController = (Model, addSubmittedBy = false) => ({
  list: async (req, res) => {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.category) filter.category = req.query.category;
    res.json(await Model.find(filter).populate("student", "enrollmentNo user").populate("mentor", "name").sort({ createdAt: -1 }));
  },
  create: async (req, res) => res.status(201).json(await Model.create({ ...req.body, ...(addSubmittedBy ? { submittedBy: req.user._id } : {}) })),
  update: async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })),
  remove: async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.status(204).end(); }
});
