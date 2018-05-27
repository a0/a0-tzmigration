<template lang="pug">
  div(v-if="items")
    label {{ label }}
    button(v-if="updown" @click="up" :disabled="disabled_up") ↑
    select(v-model="selected_value" @input="event => { $emit('input', event.target.value) }")
      option(:value="null" v-if="!updown")
      option(v-for="item in items") {{ item }}
    button(v-if="updown" @click="dn" :disabled="disabled_dn") ↓
</template>

<script>
export default {
  props: ['label', 'items', 'value', 'updown'],
  data() {
    return {
      selected_value: null
    }
  },
  mounted() {
    this.selected_value = this.value
  },
  methods: {
    up() {
      let index = this.items.indexOf(this.selected_value)
      this.selected_value = this.items[index - 1]
      this.$emit('input', this.selected_value)
    },
    dn() {
      let index = this.items.indexOf(this.selected_value)
      this.selected_value = this.items[index + 1]
      this.$emit('input', this.selected_value)
    }
  },
  computed: {
    disabled_up() {
      return this.selected_value == this.items[0]
    },
    disabled_dn() {
      return this.selected_value == this.items[this.items.length - 1]
    }
  },
  watch: {
    value(new_value) {
      this.selected_value = new_value
    }
  }
}
</script>

<style scoped>
label {
  display: block;
}
</style>
