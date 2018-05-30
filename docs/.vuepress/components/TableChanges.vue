<template lang="pug">
  table
    tr
      th(colspan="4")
        | {{ changes_text }}
        small start ≤ t < end
    tr
      th start
      th end
      th apply offset
    tr(v-for="item in info.items.d")
      td {{ item.start_str }}
      td {{ item.end_str }}
      td {{ item.content }}
</template>

<script>
import Common from './Common'

export default {
  props: ['info', 'changes_text'],
  extends: Common
}
</script>

<style scoped>
tr td {
  text-align: right;
}
</style>
