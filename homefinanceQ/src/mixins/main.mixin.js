import axios from "axios";
export default {
  methods: {
    async _getExpensesFromDB() {
      try {
        let urlProd = "https://pure-spire-45336.herokuapp.com/expenses.json";
       // let local = "http://127.0.0.1:3000/expenses.json";
        const res = await axios.get(urlProd);
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },

    async _deleteExpenseFromDB(id) {
      try {
        let urlProd = "https://pure-spire-45336.herokuapp.com/expenses";
        await axios.delete(`${urlProd}/${id}`);
      } catch (error) {
        console.log(error);
      }
    },

    async _createExpense(obj) {
      /*  let obj = {
              price: obj.price,
              concept: obj.concept,
              category: obj.category,
              date: obj.date,
            }; */
      try {
        let urlProd = "https://pure-spire-45336.herokuapp.com/expenses.json";
        await axios.post(`${urlProd}`, obj);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
