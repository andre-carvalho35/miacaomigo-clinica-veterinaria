const {
    createCustomersService,
    deleteCustomersService,
    getAllCustomersService,
    getCustomersByIdService,
    updateCustomersService,
  } = require("../models/customersModel.js");

// Função padrão de resposta
const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

const createCustomer = async (req, res, next) => {
  const { firstName, lastName, email, phone, complaints } = req.body;
  try {
    const newCustomer = await createCustomersService(firstName, lastName, email, phone, complaints);
    handleResponse(res, 201, "Customer created successfully", newCustomer);
  } catch (err) {
    next(err);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await getAllCustomersService();
    handleResponse(res, 200, "Customers fetched successfully", customers);
  } catch (err) {
    res.json({ message: "aqui!" });
    next(err);
  }
};


const getAllCustomers_Index = async (req, res, next) => {
    try {
      const customers = await getAllCustomersService();
      // Retorna os dados dos clientes em formato JSON
      res.json({ customers });
      //res.render("index1", { customers }); // Renderiza com EJS
    } catch (err) {
      next(err); // Passa o erro para o middleware de erro
    }
  };

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await getCustomersByIdService(req.params.id);
    if (!customer) return handleResponse(res, 404, "Customer not found");
    handleResponse(res, 200, "Customer fetched successfully", customer);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  const { firstName, lastName, email, phone, complaints } = req.body;
  try {
    const updatedCustomer = await updateCustomersService(req.params.id, firstName, lastName, email, phone, complaints);
    if (!updatedCustomer) return handleResponse(res, 404, "Customer not found");
    handleResponse(res, 200, "Customer updated successfully", updatedCustomer);
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const deletedCustomer = await deleteCustomersService(req.params.id);
    if (!deletedCustomer) return handleResponse(res, 404, "Customer not found");
    handleResponse(res, 200, "Customer deleted successfully", deletedCustomer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getAllCustomers_Index,
};