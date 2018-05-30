<template lang="pug">
  table
    tr
      th(colspan="4")
        | {{ timezone_text }}
        small {{ transitions_text }}
    tr
      th local time
      th offset
      th previous
    template(v-if="info.data.a")
      tr(v-for="transition in info.data.a.transitions")
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
  props: ['info', 'transitions_text', 'version', 'timezone_text'],
  extends: Common
}
</script>

<style scoped>
tr td {
  text-align: right;
}
</style>
