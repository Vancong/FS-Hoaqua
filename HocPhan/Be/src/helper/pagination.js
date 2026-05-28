
const pagination = async ({ model, page = 1, limit = 8, sort = {},query={} ,populate=null}) => {
  try {
    const skip = (page - 1) * limit;
    
    let dbQuery = model.find(query).limit(limit).skip(skip).sort(sort);
    if (populate) {
      dbQuery = dbQuery.populate(populate);
    }

    const data = await dbQuery;
    const total = await model.countDocuments(query);

    return {
      status: 'OK',
      message: 'Thành công',
      data,
      totalPage: Math.ceil(total / limit),
      total:total
    };
  } catch (error) {
    console.error('Lỗi', error);
  }
};

module.exports = pagination;
