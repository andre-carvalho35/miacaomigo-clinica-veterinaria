const express = require('express');
const {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  getAllCustomers_Index,
} = require("../controllers/customersController.js");

const validateCustomers = require("../middlewares/inputValidator");

const router = express.Router();

// rota para exibir na página inicial (index html)
router.get("/", getAllCustomers_Index);

//Criar todas as rotas (routes) associadas a customers
router.post("/customers", validateCustomers, createCustomer);
router.get("/customers", getAllCustomers);
router.get("/customers/:id", getCustomerById);
router.put("/customers/:id", validateCustomers, updateCustomer);
router.delete("/customers/:id", deleteCustomer);

module.exports = router;


