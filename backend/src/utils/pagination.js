export function getPagination(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse(data, total, page, limit) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
