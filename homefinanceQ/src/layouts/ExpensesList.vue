<template>
    <q-list bordered separator>
      <q-item
        :key="expense.key"
        v-for="(expense, index) in data"
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
          <q-btn @click="deleteItem(index)" color="gray" label="x" flat
        /></q-item-section>
      </q-item>
    </q-list>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      expenses: this.data,
    };
  },

  computed: {},
  name: "ExpensesList",
  props: {
    data: {
      required: true,
      type: Array,
    },
  },
  methods: {
    ...mapMutations("expenses", ["SET_TOTAL_AMOUNT", "SET_EXPENSES"]),

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
    deleteItem(index) {
      this.$emit("delete-item", index);
    },
  },
};
</script>

<style></style>
