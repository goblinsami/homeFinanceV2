import { mapGetters, mapMutations } from "vuex";

export default {
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  methods: {
    ...mapMutations("auth", ["SET_USER", "LOG_OUT"]),
    _login() {
      console.log(this.username, this.password, this.isAuthenticated);
      const user = { user: "home", password: "shakiraantologia" };
      if (this.username === user.user && this.password === user.password) {
        this.SET_USER();
        this.$router.push("/home");
      } else {
        alert("Wrong Password");
      }
    },
    _logout() {
      this.LOG_OUT();
      this.$router.push("/");
    },
  },
};
