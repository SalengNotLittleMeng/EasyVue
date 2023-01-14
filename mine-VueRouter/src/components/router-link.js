export default {
  name: "router-link",
  props: {
    to: { type: String },
    tag: { type: String, default: "a" },
  },
  methods: {
    handler() {
      this.$router.push(this.to);
    },
  },
  render(h) {
    let tag = this.tag;
    return h(
      tag,
      {
        on: {
          click: () => {
            this.handler();
          },
        },
      },
      [this.$slots.default]
    );
  },
};
