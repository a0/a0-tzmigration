<template lang="pug">
  table
    tr
      th(colspan="4")
        button(@click="generate_csv") download csv
        | {{ changes_text }}
        small start ≤ t < end
    tr
      th start
      th end
      th apply offset
    tr(v-for="item in info.items.d")
      td {{ item.ini_str }}
      td {{ item.fin_str }}
      td {{ item.content }}
</template>

<script>
import Common from './Common'

export default {
  props: ['info', 'changes_text', 'version'],
  extends: Common,
  methods: {
    generate_csv() {
      let content = ['data:text/csv;charset=utf-8,CHANGES TO BE APPLIED']

      content.push(`start timezone:,${this.info.name.a},start version:,${this.info.version.a}, ,final timezone:,${this.info.name.b},final version:,${this.info.version.b}`)
      content.push(`apply query start <= t < end`)
      content.push(`ini unix timestamp,fin unix timestamp,change [seconds],ini date,fin date,change`)
      this.info.items.d.forEach(item => {
        content.push([item.ini, item.fin, item.group, item.ini_str, item.fin_str, item.content])
      });

      window.open(encodeURI(content.join('\n')))
    }
  }
}
</script>

<style scoped>
tr td {
  text-align: right;
}
button {
  float: right;
}
</style>
