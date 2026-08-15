const { v4: uuidv4 } = require('uuid');

const generateSaleNumber = (companyId) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SALE-${timestamp}-${random}`;
};

const generateWarehouseCode = (name) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
};

const generateSku = (category, name) => {
  const catPrefix = category ? category.substring(0, 3).toUpperCase() : 'PRD';
  const namePrefix = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${catPrefix}-${namePrefix}-${random}`;
};

const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  return { skip, take: limit, totalPages, total };
};

module.exports = {
  generateSaleNumber,
  generateWarehouseCode,
  generateSku,
  calculatePagination,
};
