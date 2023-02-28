<template>
  <section>
    <!-- HEADER -->
    <article
      style="background-color: #e0e0e0"
      class="row justify-center items-center"
    >
      <div class="text-h5">
        Home Finance
        <q-icon name="house" size="lg" />
      </div>
    </article>
    <!-- EXPENSE AMOUNT, TOGGLE CALENDAR -->
    <article class="row justify-center">
      <div class="q-my-md text-h5">{{ expenses_amount }} €</div>
      <q-btn flat icon="calendar_month" @click="showCalendar = !showCalendar" />
    </article>
    <!-- DOUGHNUT -->

    <div class="row justify-center">
      <article>
        <Doughnut
          :key="key"
          :width="250"
          :height="250"
          :chart-data="chartData"
          v-if="!emptyChart"
          class="q-px-md"
        />
        <h5 v-else style="color: gray">Añade gastos</h5>
        <q-btn @click="sortExpensesByDate()" />
      </article>
      <!-- CALENDAR -->
      <article class="row justify-center q-my-md">
        <q-date
          minimal
          :events="filteredExpenses().map((el) => el.date)"
          mask="YYYY-MM-DD"
          :value="date2"
          :event-color="test()"
        />
      </article>
    </div>

    <article class="q-my-md row justify-center">
      <q-btn-group>
        <q-btn
          v-for="(button, index) in buttons"
          :key="index"
          :color="button.color"
          :label="button.label"
          @click="setActive(button, index)"
        ></q-btn>
      </q-btn-group>
    </article>
    <!-- INPUTS -->
    <article class="q-px-lg" v-if="!showCalendar">
      <q-input v-model="price" label="Añade Gastos €" type="number" />
      <q-input v-model="concept" label="Contepto" type="text" />

      <q-select v-model="category" :options="options" label="Categoría" />

      <q-input flat v-model="date" mask="date" :rules="['date']">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="date">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="row justify-center q-my-md">
        <q-btn flat label="+" @click="addItem" />
      </div>
    </article>
    <!-- LIST -->
    <ExpensesList :data="filteredExpenses()" @delete-item="computeExpenses()" />
  </section>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Doughnut from "src/layouts/Doughnut.vue";
import { CATEGORIES2 } from "src/consts";

export default {
  name: "MainLayout",
  components: {
    Doughnut,
    ExpensesList: () => import("src/layouts/ExpensesList.vue"),
  },
  data() {
    return {
      categoryFilter: {
        delivery: false,
        market: false,
        restaurant: false,
        home: false,
        bills: false,
      },
      model: "one",

      events: [
        "2023/02/01",
        "2023/02/05",
        "2023/02/06",
        "2023/02/09",
        "2023/02/23",
      ],

      showCalendar: false,
      date: "2023/02/08",
      date2: this.$moment().format("YYYY-MM-DD"),

      key: 0,
      number: 0,
      delivery: 10,
      expenses_amount: 0,
      price: "",
      concept: "",
      category: null,
      datasets: [],
      options: CATEGORIES2.map((el) => el.name),
      expenses: [],
      chartData: {},
      emptyChart: false,
      buttons: [
        {
          label: "Comida a Domicilio",
          color: "secondary",
          onOff: "false",
        },
        {
          label: "Supermercado",
          color: "secondary",
          onOff: "false",
        },
        {
          label: "Restaurante",
          color: "secondary",
          onOff: "false",
        },
        {
          label: "Hogar",
          color: "secondary",
          onOff: "false",
        },
        {
          label: "Facturas",
          color: "secondary",
          onOff: "false",
        },
      ],
    };
  },

  computed: {
    //  ...mapGetters("expenses", ["getExpenses"]),

    computedEvents() {
      return this.expenses
        .map((el) => el.date)
        .map((el) => el.replace(/-/g, "/"));
    },
    computedFilters() {
      return this.buttons.filter((el) => !el.onOff).map((el) => el.label);
    },
    getExpenses() {
      return [...this.$store.state.expenses.expenses];
    },
  },
  watch: {
    computedFilters: {
      handler() {
        this.testChangeColor(this.computedFilters);
        this.key += 1;
        if (this.computedFilters.length === 0) {
          this.setDoughNutChart();
        }
      },
    },
  },
  created() {
    this.init();
    this.setDoughNutChart();
  },

  methods: {
    ...mapMutations("expenses", ["SET_TOTAL_AMOUNT", "SET_EXPENSES"]),
    ...mapActions("expenses", ["action_updateExpenses"]),
    sortExpensesByDate() {
      console.log(
        this.filteredExpenses().map((el) => this.$moment(el.date, "YYYY-MM-DD"))
      );

      let arr = this.filteredExpenses().map((el) =>
        this.$moment(el.date, "YYYY-MM-DD")
      );
      const sortedArray = arr.sort((a, b) => a.diff(b));

      console.log(sortedArray);
    },
    test() {
      let value;
      if (this.computedFilters[0] === "Comida a Domicilio") {
        value = "warning";
      } else if (this.computedFilters[0] === "Supermercado") {
        value = "purple";
      } else if (this.computedFilters[0] === "Restaurante") {
        value = "cyan";
      } else if (this.computedFilters[0] === "Hogar") {
        value = "red";
      } else if (this.computedFilters[0] === "Facturas") {
        value = "light-green";
      }

      return value;
    },
    testChangeColor(filters) {
      const defaultColors = {
        "Comida a Domicilio": "#F2C037",
        Supermercado: "#9C27B0",
        Restaurante: "#00D8FF",
        Hogar: "#DD1B16",
        Facturas: "#41B883",
      };

      const result = [];

      for (let i = 0; i < Object.keys(defaultColors).length; i++) {
        const categoria = Object.keys(defaultColors)[i];
        if (filters.includes(categoria)) {
          result.push(defaultColors[categoria]);
        } else {
          result.push("#cccccc");
        }
      }
      let optionsNames = CATEGORIES2.map((el) => el.name);
      let optionsColors = CATEGORIES2.map((el) => el.color);

      this.chartData.labels = optionsNames;

      let data = [];
      optionsNames.forEach((el) => {
        let element = this.expenses
          .filter((exp) => exp.category === el)
          .map((el) => parseInt(el.price))
          .reduce((acc, curr) => acc + curr, 0);
        data.push(element);
      });
      this.chartData.datasets = [
        {
          backgroundColor: result,
          data: data,
        },
      ];
      return result;
    },

    init() {
      this.expenses = this.getExpenses;
      this.computeExpenses();
    },
    setActive(button, index) {
      if (button.onOff) {
        this.buttons[index].color = "teal-9";
        this.buttons[index].onOff = false;
      } else {
        this.buttons[index].color = "secondary";
        this.buttons[index].onOff = true;
      }
    },

    filteredExpenses() {
      let result = [];
      let filters = this.buttons
        .filter((el) => !el.onOff)
        .map((el) => el.label);
      result = this.expenses.filter((expense) =>
        filters.includes(expense.category)
      );
      if (this.computedFilters.length === 0) {
        result = this.getExpenses;
      }

      return result;
    },
    setCategoryFilter(category) {
      if (category === "Comida a Domicilio") {
        this.categoryFilter.delivery = !this.categoryFilter.delivery;
      } else if (category === "Supermercado") {
        this.categoryFilter.market = !this.categoryFilter.market;
      } else if (category === "Restaurante") {
        this.categoryFilter.restaurant = !this.categoryFilter.restaurant;
      } else if (category === "Hogar") {
        this.categoryFilter.home = !this.categoryFilter.home;
      } else if (category === "Facturas") {
        this.categoryFilter.bills = !this.categoryFilter.bills;
      }
    },

    filterButtonColor(category, index) {
      if (this.categoryFilter.delivery === true) {
        return "teal";
      } else {
        return "green";
      }
    },
    computedEventsColor(events) {
      let value;
      events.forEach((el) => {
        if (el == "2023/02/15") {
          value = "teal";
        } else {
          value = "orange";
        }
      });
      return value;
    },
    setDoughNutChart() {
      let optionsNames = CATEGORIES2.map((el) => el.name);
      let optionsColors = CATEGORIES2.map((el) => el.color);

      this.chartData.labels = optionsNames;

      let data = [];
      optionsNames.forEach((el) => {
        let element = this.expenses
          .filter((exp) => exp.category === el)
          .map((el) => parseInt(el.price))
          .reduce((acc, curr) => acc + curr, 0);
        data.push(element);
      });
      this.chartData.datasets = [
        {
          backgroundColor: optionsColors,
          /*  [
            "#F2C037",
            "#9C27B0",
            "#00D8FF",
            "#DD1B16",
            "#41B883",
          ], */
          data: data,
        },
      ];

      this.emptyChart = data.every((el) => el === 0);
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
    computeExpenses() {
      for (let i = 0; i < this.expenses.length; i++) {
        this.expenses_amount += parseFloat(this.expenses[i]["price"]);
      }
      this.setDoughNutChart();
      this.key += 1;
    },
    deleteItem(index) {
      this.expenses.splice(index, 1);
      this.expenses_amount = 0;
      this.SET_EXPENSES(this.expenses);
      this.computeExpenses();
    },
    addItem() {
      this.expenses_amount = 0;
      let key = null
     key = Math.random().toString(36).substring(2, 7);
      if (this.price && this.category) {
        this.expenses.push({
          price: this.price,
          category: this.category,
          concept: this.concept,
          date: this.date,

       key: key,
        });
        this.SET_EXPENSES(this.expenses);
        this.computeExpenses();
      } else {
        alert("campo vacío");
      }
    },
  },
};
</script>
<style>
.q-btn__content .q-date__today {
  background-color: red !important ;
}
</style>
