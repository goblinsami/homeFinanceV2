<template>
  <section>
    <!-- HEADER -->
    <article
      style="background-color: #e0e0e0"
      class="row justify-center items-center"
    >
      <div class="text-h5 text-bold text-positive">
        Home Finance
        <q-icon name="house" size="lg" color="positive" />
      </div>
    </article>
    <div class="row justify-end">
      <q-btn
        @click="_logout()"
        style="padding: 1px"
        flat
        :color="'grey-7'"
        icon="logout"
        size="xs"
      />
    </div>

    <!-- EXPENSE AMOUNT, TOGGLE CALENDAR -->
    <article class="row justify-center">
      <div class="q-my-md text-h5 text-bold">
        {{ currentMonth }}
      </div>
      <div class="q-my-md text-h5 q-px-sm">{{ expenses_amount }} €</div>
    </article>
    <q-btn
      :label="!showCalendar ? 'Ocultar' : ''"
      :icon="showCalendar ? 'visibility' : 'visibility_off'"
      flat
      @click="showCalendar = !showCalendar"
      color="grey"
      size="sm"
    />
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
              <q-date first-day-of-week="1" v-model="date">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="row justify-center q-my-sm">
        <q-btn outline style="color: gray" label="+" @click="addItem" />
      </div>
    </article>
    <!-- DOUGHNUT -->

    <div class="q-py-md row justify-center">
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
      </article>
      <!-- CALENDAR -->
      <article class="row justify-center q-py-md q-my-sm">
        <q-date
          minimal
          :events="filteredExpenses().map((el) => el.date)"
          mask="YYYY-MM-DD"
          :value="date2"
          :event-color="setEventsColors()"
          @navigation="(a) => changeMonth(a)"
          first-day-of-week="1"
        />
      </article>
    </div>
    <article class="q-px-xs row justify-center">
      <q-btn
        v-for="(button, index) in buttons"
        :key="index"
        :color="button.color"
        :style="`color:${button.bg}`"
        :label="button.label"
        @click="setActive(button, index)"
        class="q-ma-sm"
      />
    </article>

    <!-- LIST - aasdd-->
    <article style="min-width: 200px" class="q-py-md">
      <q-btn
        class="q-ma-xs"
        outline
        style="color: gray"
        size="xs"
        @click="sortExpensesByPrice()"
        icon="euro"
      >
        <q-tooltip> Ordenar por precio </q-tooltip>
      </q-btn>
      <ExpensesList
        :key="key2"
        :data="filteredExpenses()"
        @delete-item="deleteItem"
      />
    </article>
  </section>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Doughnut from "src/layouts/Doughnut.vue";
import { CATEGORIES2 } from "src/consts";
import main from "src/mixins/main.mixin";
import axios from "axios";
import auth from "src/mixins/auth.mixin";

export default {
  name: "MainLayout",
  mixins: [main, auth],

  components: {
    Doughnut,
    ExpensesList: () => import("src/layouts/ExpensesList.vue"),
  },
  data() {
    return {
      setPriceFilter: false,
      orderbyPrice: false,
      currentMonth: null,
      currentMonthNumber: this.$moment().month(),

      showCalendar: false,
      date: this.$moment().format("YYYY/MM/DD"),
      date2: this.$moment().format("YYYY/MM/DD"),

      key: 0,
      key2: 0,
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
          color: "warning",
          onOff: "false",
          bg: "#F2C037",
        },
        {
          label: "Supermercado",
          color: "accent",
          onOff: "false",
          bg: "#F2C037",
        },
        {
          label: "Restaurante",
          color: "info",
          onOff: "false",
          bg: "#F2C037",
        },
        {
          label: "Hogar",
          color: "negative",
          onOff: "false",
          bg: "#F2C037",
        },
        {
          label: "Facturas",
          color: "positive",
          onOff: "false",
          bg: "#F2C037",
        },
      ],
    };
  },

  computed: {
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
    /*    expenses: {
      handler() {
        this.sortExpensesByDate();
      },
    }, */
    computedFilters: {
      handler() {
        this.setChartColors(this.computedFilters);
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
    this.setMonth();
    // this._getExpensesFromDB();
    /*  this.testGoogleApi() */
  },

  methods: {
    ...mapMutations("expenses", ["SET_TOTAL_AMOUNT", "SET_EXPENSES"]),
    ...mapActions("expenses", ["action_updateExpenses"]),

    setMonth() {
      this.currentMonth = this.$moment()
        .month(this.currentMonthNumber)
        .format("MMMM");
    },

    async testGoogleApi() {
      const sheetId = "17Pv9shY-CmubpF4S7VvRnhH-aaoIh2ql51zHzLsPY0U";
      const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
      const sheetName = "DB";
      const query = encodeURIComponent("Select *");
      const url = `${base}&sheet=${sheetName}&tq=${query}`;
      let resp = await axios.get(url);

      console.log(JSON.parse(resp.data.substring(47).slice(0, -2)).table.rows);

      //const SHEET_ID = '17Pv9shY-CmubpF4S7VvRnhH-aaoIh2ql51zHzLsPY0U'
    },

    changeMonth(month) {
      console.log(month);
      this.expenses_amount = 0;
      this.currentMonthNumber = month.month - 1;

      this.setMonth();
      console.log(this.currentMonthNumber);
      this.computeExpenses();
    },
    testSortMonth() {
      this.currentMonthNumber = 1;
    },
    sortExpensesByPrice() {
      console.log(this.expenses.map((el) => el.price).sort((a, b) => a - b));
      console.log(this.expenses.map((el) => el.price).sort((a, b) => b - a));
      this.setPriceFilter = true;
      this.orderbyPrice = !this.orderbyPrice;
    },
    sortExpensesByDate() {
      const arr = this.expenses.map((el) =>
        this.$moment(el.date, "YYYY/MM/DD")
      );
      const sortedArray = arr.sort((a, b) => a.diff(b));
      const sortedExpenses = sortedArray.map((m) => {
        return this.expenses.find((el) =>
          this.$moment(el.date, "YYYY/MM/DD").isSame(m)
        );
      });
      /*  this.expenses = sortedExpenses; */
      //   this.key2 = +1;
      return sortedExpenses;
    },
    setEventsColors() {
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
    setChartColors(filters) {
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

    async init() {
      this.expenses = await this._getExpensesFromDB();
      // this.expenses = this.sortExpensesByDate();
      this.computeExpenses();
    },
    setActive(button, index) {
      let array = ["warning", "accent", "info", "negative", "positive"];
      if (button.onOff) {
        console.log(button, index);
        this.buttons[index].color = "grey";
        this.buttons[index].onOff = false;
      } else {
        this.buttons[index].color = array[index];
        this.buttons[index].onOff = true;
      }
    },

    filteredExpenses() {
      let current = this.currentMonthNumber;

      let array = this.expenses.filter(
        (el) => this.$moment(el.date, "YYYY/MM/DD").month() === current
      );
      let storeArray = this.expenses.filter(
        (el) => this.$moment(el.date, "YYYY/MM/DD").month() === current
      );
      let result = [];
      let filters = this.buttons
        .filter((el) => !el.onOff)
        .map((el) => el.label);
      result = array.filter((expense) => filters.includes(expense.category));

      if (this.computedFilters.length === 0) {
        result = storeArray;
      }
      let sortedArray = result.sort((a, b) =>
        this.$moment(a.date).diff(this.$moment(b.date))
      );
      if (this.setPriceFilter) {
        if (this.orderbyPrice) {
          console.log("sort asc");
          sortedArray = result.sort((a, b) => a.price - b.price);
        } else {
         sortedArray = result.sort((a, b) => b.price - a.price);
          console.log("sort desc");
        }
      }

      return sortedArray;
    },

    setDoughNutChart() {
      let optionsNames = CATEGORIES2.map((el) => el.name);
      let optionsColors = CATEGORIES2.map((el) => el.color);

      this.chartData.labels = optionsNames;
      let arr = this.filteredExpenses();
      let data = [];
      optionsNames.forEach((el) => {
        let element = arr
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
      let current = this.currentMonthNumber;
      let arr = this.expenses.filter(
        (el) => this.$moment(el.date, "YYYY/MM/DD").month() === current
      );
/*       console.log(arr.map(el => el.price).reduce((a,b) => a + b, 0)) */
      this.expenses_amount = arr.map(el => el.price).reduce((a, b) => a + b, 0)
 /*      for (let i = 0; i < arr.length; i++) {
        this.expenses_amount += parseFloat(arr[i]["price"]);
      } */
      this.setDoughNutChart();
      this.key += 1;
      this.key2 += 1;
    },
    async deleteItem(expense) {
      await this._deleteExpenseFromDB(expense.id);
      this.expenses_amount = 0;
      await this.init();
    },

    async addItem() {
      const expense = {
        price: this.price,
        category: this.category,
        concept: this.concept,
        date: this.date,
      };

      await this._createExpense(expense);
      await this.init();
    },
  },
};
</script>
<style>
.q-btn__content .q-date__today {
  background-color: red !important ;
}
</style>
