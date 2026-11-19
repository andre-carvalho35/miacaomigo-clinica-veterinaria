const pool = require('../config/db');

const getAllCustomersService = async () => {
  const result = await pool.query("SELECT * FROM customers");
  return result.rows;
};

const getCustomersByIdService = async (id) => {
  const result = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [id]);
  return result.rows[0];
};

const createCustomersService = async (firstName, lastName, email, phone, complaints) => {
    const result = await pool.query(
      `INSERT INTO customers 
        (first_name, last_name, email_address, phone_number, number_of_complaints) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstName, lastName, email, phone, complaints]
    );
    return result.rows[0];
  };
  
  const updateCustomersService = async (id, firstName, lastName, email, phone, complaints) => {
    const result = await pool.query(
      `UPDATE customers 
       SET first_name = $1, 
           last_name = $2, 
           email_address = $3, 
           phone_number = $4, 
           number_of_complaints = $5 
       WHERE id = $6 
       RETURNING *`,
      [firstName, lastName, email, phone, complaints, id]
    );
    return result.rows[0];
  };
  

const deleteCustomersService = async (id) => {
  const result = await pool.query(
    "DELETE FROM customers WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAllCustomersService,
  getCustomersByIdService,
  createCustomersService,
  updateCustomersService,
  deleteCustomersService
};
