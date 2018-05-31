<template lang="pug">
  table
    tr
      th(colspan="4")
        button(@click="generate_csv") download csv
        template(v-if="info.name[item]") {{ timezone_text }}
        small {{ transitions_text }}
    tr
      th local time
      th offset
      th previous
    template(v-if="info.data[item]")
      tr(v-for="transition in info.data[item].transitions")
        td
          .block ini: {{ transition.local_ini_str }}
          .block fin: {{ transition.local_fin_str }}
        td {{ offset_to_str(transition.utc_offset) }}
        td {{ offset_to_str(transition.utc_prev_offset) }}
    template(v-else)
      tr
        th(colspan="4") no data
</template>

<script>
import Common from './Common'

export default {
  props: ['info', 'item', 'transitions_text', 'version', 'timezone_text'],
  extends: Common,
  methods: {
    generate_csv() {
      let content = ['data:text/csv;charset=utf-8,TRANSITIONS']

      content.push(`timezone:,${this.info.name[this.item]},version:,${this.info.version[this.item]}`)
      content.push(`local time ini,local time fin,offset,previous offset`)
      this.info.data[this.item].transitions.forEach(transition => {
        content.push([transition.local_ini_str, transition.fin_ini_str, this.offset_to_str(transition.utc_offset), this.offset_to_str(transition.utc_prev_offset)])
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
