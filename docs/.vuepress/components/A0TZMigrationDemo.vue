<template lang="pug">
  div
    div.parent
      template(v-if="timezones")
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.a" label="First Zone")
          CustomSelect(:items="versions_a" v-model="version.a" label="Version" updown="x")
        div.col
          div
            label copy
            button(@click="copy") same timezone →
          div
            label mode
            button(@click="set_mode('timeline')" :disabled="mode == 'timeline'") timeline
            button(@click="set_mode('table')" :disabled="mode == 'table'") data
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.b" label="Second Zone")
          CustomSelect(:items="versions_b" v-model="version.b" label="Version" updown="x")
      template(v-else)
        | Loading indexes…
    div(v-show="mode == 'timeline'")
      div.row.text-left
        b(v-if="loading.a") Loading A …
        b(v-else) {{ info.name.a }} {{ version.a }}
        small {{ transitions_text_a }}
      div.text-left
        button(:disabled="prev_select_disabled('a')" @click="select_prev('a')") ⇤ Prev
        button(:disabled="zoom_in_disabled('a')" @click="zoom_in('a')") Zoom in
        button(:disabled="fit_disabled('a')" @click="fit('a')") FIT
        button(:disabled="zoom_out_disabled('a')" @click="zoom_out('a')") Zoom out
        button(:disabled="next_select_disabled('a')" @click="select_next('a')") Next ⇥
      div(ref="timeline_a")
      div.row.text-center
        b {{ changes_text }}
      div.text-center
        button(:disabled="prev_select_disabled('d')" @click="select_prev('d')") ⇤ Prev
        button(:disabled="zoom_in_disabled('d')" @click="zoom_in('d')") Zoom in
        button(:disabled="fit_disabled('d')" @click="fit('d')") FIT
        button(:disabled="zoom_out_disabled('d')" @click="zoom_out('d')") Zoom out
        button(:disabled="next_select_disabled('d')" @click="select_next('d')") Next ⇥
      div(ref="timeline_d")
      div.row.text-right
        b(v-if="loading.b") Loading B …
        b(v-else) {{ info.name.b }} {{ version.b }}
        small {{ transitions_text_b }}
      div.text-right
        button(:disabled="prev_select_disabled('b')" @click="select_prev('b')") ⇤ Prev
        button(:disabled="zoom_in_disabled('b')" @click="zoom_in('b')") Zoom in
        button(:disabled="fit_disabled('b')" @click="fit('b')") FIT
        button(:disabled="zoom_out_disabled('b')" @click="zoom_out('b')") Zoom out
        button(:disabled="next_select_disabled('b')" @click="select_next('b')") Next ⇥
      div(ref="timeline_b")
    div.parent(v-show="mode == 'table'")
      div.col
        TableTimezone(:info="info" item="a" :transitions_text="transitions_text_a" :timezone_text="`${info.name.a} ${version.a}`")
      div.col
        TableChanges(:info="info" :changes_text="changes_text")
      div.col
        TableTimezone(:info="info" item="b" :transitions_text="transitions_text_b" :timezone_text="`${info.name.b} ${version.b}`")
</template>

<script>
import { TZVersion } from 'a0-tzmigration-js'
import axios from 'axios'
import vis from 'vis'
import moment from 'moment'
import 'vis/dist/vis.min.css'
import Common from './Common'

export default {
  extends: Common,
  data() {
    return {
      timezone: { a: null, b: null },
      version: { a: null, b: null },
      timeline: { a: null, b: null, d: null },
      info: {
        name: { a: null, b: null },
        version: { a: null, b: null },
        tzversion: { a: null, b: null },
        transitions: { a: null, b: null },
        utc_min: { a: null, b: null },
        utc_max: { a: null, b: null },
        items: { a: [], b: [], d: [] },
        groups: { a: null, b: null },
        options: { a: {}, b: {} }
      },
      loading: { a: null, b: null, d: null },
      timezones: null,
      timezone_names: null,
      mode: 'timeline',
      do_sync: false
    }
  },
  mounted() {
    TZVersion.timezones().then(data => {
      this.timezones = data
      this.timezone_names = Object.keys(this.timezones).slice().sort()
    })
  },
  computed: {
    versions_a() {
      let object = this.timezones && this.timezones[this.timezone.a]
      return object && object.versions.slice().sort().reverse()
    },
    versions_b() {
      let object = this.timezones && this.timezones[this.timezone.b]
      return object && object.versions.slice().sort().reverse()
    },
    timezone_a() {
      return this.timezone.a
    },
    timezone_b() {
      return this.timezone.b
    },
    version_a() {
      return this.version.a
    },
    version_b() {
      return this.version.b
    },
    changes_text() {
      if (this.loading.a || this.loading.b) {
        return '…'
      } else if (this.info.items.d.length == 0) {
        return 'NO Changes (A → B)'
      } else if (this.info.items.d.length == 1) {
        return '1 Change (A → B)'
      } else {
        return `${this.info.items.d.length} Changes (A → B)`
      }
    },
    transitions_text_a() {
      if (this.info.items.a.length == 1) {
        return '1 transition'
      } else {
        return `${this.info.items.a.length} transitions`
      }
    },
    transitions_text_b() {
      if (this.info.items.b.length == 1) {
        return '1 transition'
      } else {
        return `${this.info.items.b.length} transitions`
      }
    }
  },
  watch: {
    timezone_a() {
      if (this.version.a == null && this.versions_a) {
        this.version.a = this.versions_a[1] || this.versions_a[0]
      }

      if (this.timezone.b == null) {
        this.timezone.b = this.timezone.a
      }

      this.load_timezone('a')
    },
    timezone_b() {
      if (this.version.b == null && this.versions_b) {
        this.version.b = this.versions_b[0]
      }

      this.load_timezone('b')
    },
    version_a() {
      if (!this.loading.a) {
        this.load_timezone('a')
      }
    },
    version_b() {
      if (!this.loading.b) {
        this.load_timezone('b')
      }
    },
    '$route': {
      immediate: true,
      handler() {
        if (this.$route.query.ta) { this.timezone.a = this.$route.query.ta }
        if (this.$route.query.tb) { this.timezone.b = this.$route.query.tb }
        if (this.$route.query.va) { this.version.a = this.$route.query.va }
        if (this.$route.query.vb) { this.version.b = this.$route.query.vb }
        if (this.$route.query.m) { this.mode = this.$route.query.m }
      }
    },
    mode() {
      this.update_history()
    }
  },
  methods: {
    set_mode(mode) {
      this.mode = mode
    },
    copy() {
      this.$set(this.timezone, 'b', this.timezone.a)
    },
    min(a, b) {
      if (a == null) {
        return b
      }
      if (b == null) {
        return a
      }
      return (a < b) ? a : b
    },
    max(a, b) {
      if (a == null) {
        return b
      }
      if (b == null) {
        return a
      }
      return (a > b) ? a : b
    },
    load_timezone(item) {
      this.loading[item] = true
      this.$nextTick(async () => {
        this.info.utc_min[item] = null
        this.info.utc_max[item] = null
        let name = this.info.name[item] = this.timezone[item]
        let version = this.info.version[item] = this.version[item]

        let tzversion = this.info.tzversion[item] = new TZVersion(name, version)
        let transitions = this.info.transitions[item] = await tzversion.transitions()

        let offsets = {}
        let items = this.info.items[item] = transitions.map((elem, index) => {
          let utc_timestamp = elem['utc_timestamp']
          let utc_offset = elem['utc_offset']
          let str_offset = this.offset_to_str(utc_offset)
          offsets[str_offset] = { id: utc_offset, content: str_offset }

          let title = '<b>' + str_offset + '</b>'
          title += '<small>local:</small>'
          title += '<small>' + elem['local_ini_str'] + '</small>'
          title += '<small>' + elem['local_fin_str'] + '</small>'

          this.info.utc_min[item] = this.min(utc_timestamp, this.info.utc_min[item])
          this.info.utc_max[item] = this.max(utc_timestamp, this.info.utc_max[item])

          return { id: index, group: utc_offset, content: '', title: title, start: elem['utc_time'] }
        })

        let groups = this.info.groups[item] = new vis.DataSet()
        Object.values(offsets).forEach((value) => {
          groups.add(value)
        })
        let min_utc = this.min(this.info.utc_min.a, this.info.utc_min.b) - 86400*30
        let max_utc = this.max(this.info.utc_max.a, this.info.utc_max.b) + 86400*30
        let min_date = new Date()
        let max_date = new Date()
        min_date.setTime(min_utc*1000)
        max_date.setTime(max_utc*1000)

        this.info.options[item] = {
          groupOrder: 'id',
          min: min_date,
          max: max_date,
          moment: function (date) {
            return vis.moment(date).utc();
          }
        }

        this.draw_timeline(item)
        this.update_timeline_options()
        this.calculate_diff()
        this.update_history()
      })
    },
    draw_timeline(item) {
      let elem = this.$refs['timeline_' + item]
      let items = this.info.items[item]
      let options = this.info.options[item]
      let groups = this.info.groups[item]
      if (this.timeline[item]) {
        this.timeline[item].setItems(items)
        this.timeline[item].setGroups(groups)
        this.timeline[item].setOptions(options)
        this.timeline[item].fit()
      } else {
        this.timeline[item] = new vis.Timeline(elem, items, groups, options)
        this.timeline[item].on('rangechanged', (props) => { if (this.do_sync || props.byUser) { this.sync_range(item) } })
        this.timeline[item].on('select', (props) => { this.sync_range(item) })
      }
      // this.timeline[item] && this.timeline[item].destroy()
      this.loading[item] = false
    },
    update_timeline_options() {
      if (this.timeline.a) {
        let ooo = JSON.stringify(this.info.options.a)
        this.info.options.a.min = this.min(this.info.options.a.min, this.info.options.b.min)
        this.info.options.a.max = this.max(this.info.options.a.max, this.info.options.b.max)
        let nnn = JSON.stringify(this.info.options.a)
        if (ooo != nnn) {
          this.timeline.a.setOptions(this.info.options.a)
        }
      }
      if (this.timeline.b) {
        let ooo = JSON.stringify(this.info.options.b)
        this.info.options.b.min = this.min(this.info.options.a.min, this.info.options.b.min)
        this.info.options.b.max = this.max(this.info.options.a.max, this.info.options.b.max)
        let nnn = JSON.stringify(this.info.options.b)
        if (ooo != nnn) {
          this.timeline.b.setOptions(this.info.options.b)
        }
      }
    },
    update_history() {
      if (this.timezone.a && this.timezone.b && this.version.a && this.version.b) {
        this.$router.replace({ query: { ta: this.timezone_a, va: this.version_a, tb: this.timezone_b, vb: this.version_b, m: this.mode } })
      }
    },
    date_from_time(time, min, max) {
      if (time == -Infinity) {
        return min
      } else if (time == Infinity) {
        return max
      } else {
        return moment(time * 1000)
      }
    },
    sync_range(item) {
      ['a', 'b', 'd'].filter(e => e !== item).forEach(tl => {
        this.timeline[tl].setWindow(this.timeline[item].getWindow())
      })
      this.do_sync = false
    },
    calculate_diff() {
      if (!this.info.transitions.a || !this.info.transitions.b) {
        return
      }

      // console.log('calculating diff for', this.info.transitions.a, this.info.transitions.b)

      this.$nextTick(async () => {
        let offsets = {}
        let min = this.min(this.info.options.a.min, this.info.options.b.min)
        let max = this.max(this.info.options.a.max, this.info.options.b.max)
        let changes = await this.info.tzversion.a.changes(this.info.tzversion.b)
        this.info.items.d = changes.map((item, index) => {
          let start = this.date_from_time(item.ini, min, max)
          let end = this.date_from_time(item.fin, min, max)

          let str_offset = this.offset_to_str(item.off)
          offsets[str_offset] = { id: item.off, content: str_offset }
          let title = `<small><b>${item.ini_str}</b> ≤ <b>t</b> < <b>${item.fin_str}</b></small><b>${str_offset}</b>`

          return { id: index, group: item.off, content: str_offset, title: title, start: start, end: end, ini_str: item.ini_str, fin_str: item.fin_str, ini: item.ini, fin: item.fin }
        })

        let groups = this.info.groups.d = new vis.DataSet()
        Object.values(offsets).forEach((value) => {
          groups.add(value)
        })

        this.info.options.d = {
          groupOrder: 'id',
          min: min,
          max: max,
          moment: function (date) {
            return vis.moment(date).utc();
          }
        }
        this.draw_timeline('d')
      })
    },
    fit(item) {
      this.timeline[item].fit()
      this.do_sync = true
    },
    select_prev(item) {
      let selected = this.timeline[item].getSelection()[0] - 1 || 0
      selected = selected < 0 ? 0 : selected
      this.timeline[item].setSelection([selected], { focus: true })
      this.do_sync = true
    },
    select_next(item) {
      let length = this.info.items[item].length
      let selected = this.timeline[item].getSelection()[0] + 1 || length - 1
      selected = selected >= length ? length - 1 : selected
      this.timeline[item].setSelection([selected], { focus: true })
      this.do_sync = true
    },
    fit_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
    },
    prev_select_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
    },
    next_select_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
    },
    zoom_in_disabled(item) {
      return this.timeline[item] == null
    },
    zoom_out_disabled(item) {
      return this.timeline[item] == null
    },
    zoom_in(item) {
      this.timeline[item] && this.timeline[item].zoomIn(1)
      this.do_sync = true
    },
    zoom_out(item) {
      this.timeline[item] && this.timeline[item].zoomOut(1)
      this.do_sync = true
    }
  }
}
</script>

<style scoped>
div.parent {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex: 1 1 auto;
  /* border: 1px dashed blue; */
}
label {
  display: block;
  text-align: center;
}
div.item {
  border: 1px solid red;
  flex-grow: 1;
  justify-content: center;
}
div.row {
  margin-top: 15px;
}
div.col {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex: 1 1 auto;
  /* border: 1px dashed green; */
  justify-content: center;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.block {
  display: block;
}
table {
  font-size: 14px;
}
</style>

<style>
.vis-item-content, small {
  display: block;
}
</style>
