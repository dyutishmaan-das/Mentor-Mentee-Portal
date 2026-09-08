export function listQuery(query, { allowedSort = ['createdAt'], searchFields = [] } = {}) {
  const page = Math.max(Number(query.page) || 1, 1),
    limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const filter = { isDeleted: { $ne: true } };
  if (query.search && searchFields.length)
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' },
    }));
  for (const key of ['department', 'batch', 'semester', 'section', 'mentorId', 'status'])
    if (query[key]) filter[key] = query[key];
  const sortField = allowedSort.includes(query.sortBy) ? query.sortBy : 'createdAt';
  return {
    filter,
    page,
    limit,
    skip: (page - 1) * limit,
    sort: { [sortField]: query.order === 'asc' ? 1 : -1 },
  };
}
