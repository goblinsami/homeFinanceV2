<template>
  <article>
    <q-btn @click="sortByPrice()" icon="euro"/>
    <q-list bordered separator>
      <q-item
        :key="expense.key"
        v-for="expense in sortedExpenses"
        clickable
        v-ripple
        :style="categoryStyle(expense)"
      >
        <q-item-section>
          <q-item-label> {{ expense.price }} €</q-item-label>
          <q-item-label caption>{{ expense.concept }}</q-item-label>
          <q-item-label caption>{{ expense.date }}</q-item-label>

          <q-item-label caption
            >{{ expense.category }} {{ expense.key }}</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <q-btn @click="deleteItem(expense)" color="gray" label="x" flat
        /></q-item-section>
      </q-item>
    </q-list>
  </article>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      expenses: this.data,
    };
  },

  computed: {
    sortedExpenses() {
      const arr = this.expenses.map((el) =>
        this.$moment(el.date, "YYYY/MM/DD")
      );
      const sortedArray = arr.sort((a, b) => a.diff(b));
      const sortedExpenses = sortedArray.map((m) => {
        return this.expenses.find((el) =>
          this.$moment(el.date, "YYYY/MM/DD").isSame(m)
        );
      });

      return sortedExpenses;
    },
  },
  name: "ExpensesList",
  props: {
    data: {
      required: true,
      type: Array,
    },
  },
  methods: {
    ...mapMutations("expenses", ["SET_TOTAL_AMOUNT", "SET_EXPENSES"]),

/*     created() {
      this.expenses.sort((a, b) =>
        this.$moment(a.date, "YYYY-MM-DD").diff(
          this.$moment(b.date, "YYYY-MM-DD")
        )
      );
    }, */


    sortByPrice() {

    },

    categoryStyle(expense) {
      if (expense.category === "Comida a Domicilio") {
        return "background-color: rgba(242, 192, 55, 0.4)";
      } else if (expense.category === "Supermercado") {
        return "background-color: rgba(156, 39, 176, 0.4)";
      } else if (expense.category === "Restaurante") {
        return "background-color: rgba(0, 216, 255, 0.4)";
      } else if (expense.category === "Hogar") {
        return "background-color: rgba(221, 27, 22, 0.4)";
      } else if (expense.category === "Facturas") {
        return "background-color: rgba(65, 184, 131, 0.4)";
      }
    },
    deleteItem(expense) {
      const expenseFound = this.expenses.find((e) => e.key === expense.key);
      const index = this.expenses.indexOf(expenseFound);
      this.expenses.splice(index, 1);
      this.expenses_amount = 0;
      this.SET_EXPENSES(this.expenses);
      this.$emit("delete-item");
      //this.computeExpenses();
    },
  },
};
</script>

<style></style>
