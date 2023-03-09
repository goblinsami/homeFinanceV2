<template>
  <section class="q-pt-md q-mt-md">
    <q-card-section class="row justify-center">
      <q-icon
        :key="key"
        :color="'positive'"
        :name="changeIcon()[0]"
        style="font-size: 10em"
      />
    </q-card-section>
    <q-card-section class="row justify-center">
      <h5 class="text-bold">Home Finance</h5>
    </q-card-section>
    <q-card-section>
      <q-input v-model="username" filled type="text" hint="username" />
      <q-input v-model="password" filled type="password" hint="Password" />
      <div class="row justify-center">
        <q-btn label="entrar" @click="_login()" class="q-mt-md" :color="'positive'" />
      </div>
    </q-card-section>
  </section>
</template>

<script>
import auth from "src/mixins/auth.mixin";

export default {
  mixins: [auth],
  data() {
    return {
      username: null,
      password: null,
      interval: null,
      key: 0,
    };
  },
  created() {
    setInterval(() => {
      this.changeIcon();
      this.key += 1;
    }, 1500);
  },
  methods: {

    changeIcon() {
      let icons = [
        "donut_large",
        "trending_down",
        "credit_card_off",
        "local_fire_department",
        "production_quantity_limits",
        "savings",
        "flood",
      ];
      let colors = ["warning", "accent", "info", "negative", "positive"];

      let icon = icons[Math.floor(Math.random() * icons.length)];
      let color = colors[Math.floor(Math.random() * colors.length)];
      return [icon, color];
    },
  },
};
</script>

<style></style>
