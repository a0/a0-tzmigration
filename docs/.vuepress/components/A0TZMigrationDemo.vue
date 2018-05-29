<template lang="pug">
  div
    div.parent
      template(v-if="timezones")
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.a" label="First Zone")
          CustomSelect(:items="versions_a" v-model="version.a" label="Version" updown="x")
          div.item
            label &nbsp;
            button(@click="copy") use same timezone →
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.b" label="Second Zone")
          CustomSelect(:items="versions_b" v-model="version.b" label="Version" updown="x")
      template(v-else)
        | Loading…
    div.row.text-left
      b(v-if="loading.a") Loading A …
      b(v-else) {{ info.name.a }} {{ version.a }}
      small {{ this.info.items.a.length }} transitions
    div.text-left
      button(:disabled="prev_select_disabled('a')" @click="select_prev('a')") ⇤ Prev
      button(:disabled="fit_disabled('a')" @click="fit('a')") FIT
      button(:disabled="next_select_disabled('a')" @click="select_next('a')") Next ⇥
    div(ref="timeline_a")
    div.row.text-center
      b(v-if="loading.a || loading.b") …
      b(v-else-if="info.items.d.length == 0") NO Changes (A → B)
      b(v-else-if="info.items.d.length == 1") 1 Change (A → B)
      b(v-else) {{ info.items.d.length }} Changes (A → B)
    div.text-center
      button(:disabled="prev_select_disabled('d')" @click="select_prev('d')") ⇤ Prev
      button(:disabled="fit_disabled('d')" @click="fit('d')") FIT
      button(:disabled="next_select_disabled('d')" @click="select_next('d')") Next ⇥
    div(ref="timeline_d")
    div.row.text-right
      b(v-if="loading.b") Loading B …
      b(v-else) {{ info.name.b }} {{ version.b }}
      small {{ this.info.items.b.length }} transitions
    div.text-right
      button(:disabled="prev_select_disabled('b')" @click="select_prev('b')") ⇤ Prev
      button(:disabled="fit_disabled('b')" @click="fit('b')") FIT
      button(:disabled="next_select_disabled('b')" @click="select_next('b')") Next ⇥
    div(ref="timeline_b")
</template>

<script>
import { TZVersion } from 'a0-tzmigration-js'
import axios from 'axios'
import vis from 'vis'
import moment from 'moment'
import 'vis/dist/vis.min.css'

let tzversion = new TZVersion()
window.m = moment

export default {
  data() {
    return {
      timezone: { a: null, b: null },
      version: { a: null, b: null },
      timeline: { a: null, b: null, d: null },
      info: {
        data: { a: null, b: null },
        name: { a: null, b: null },
        utc_min: { a: null, b: null },
        utc_max: { a: null, b: null },
        items: { a: [], b: [], d: [] },
        groups: { a: null, b: null },
        options: { a: {}, b: {} }
      },
      loading: { a: null, b: null, d: null },
      timezones: null,
      timezone_names: null
    }
  },
  mounted() {
    tzversion.timezones().then(data => {
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
    }
  },
  watch: {
    timezone_a() {
      if (this.version.a == null) {
        this.version.a = this.versions_a[1] || this.versions_a[0]
      }

      if (this.timezone.b == null) {
        this.timezone.b = this.timezone.a
        this.version.b = this.versions_b[0]
      }

      this.load_timezone('a')
    },
    timezone_b() {
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
    }
  },
  methods: {
    copy() {
      this.$set(this.timezone, 'b', this.timezone.a)
    },
    offset_to_str(offset) {
      let date = new Date(null)
      let off = offset < 0 ? -offset : offset
      let pre = offset < 0 ? '-' : '+'
      date.setTime(off*1000)
      return pre + date.toISOString().substr(11, 8)
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
      // console.log('item', item)
      this.loading[item] = true
      this.info.utc_min[item] = null
      this.info.utc_max[item] = null
      this.$nextTick(() => {
        let timezone_name = this.timezone[item]
        tzversion.fetch(this.timezone[item], this.version[item]).then(data => {
          this.info.data[item] = data
          this.info.name[item] = timezone_name
          // console.log(data)
          let offsets = {}
          let items = data.transitions.map((elem, index) => {
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
            // console.log(item, 'min', JSON.parse(JSON.stringify(this.info.utc_min)), 'max', JSON.parse(JSON.stringify(this.info.utc_max)))

            return { id: index, group: utc_offset, content: '', title: title, start: elem['utc_time'] }
          });
          this.info.items[item] = items
          // console.log(items)
          
          let groups = this.info.groups[item] = new vis.DataSet()
          // console.log('offsets', offsets)
          Object.values(offsets).forEach((value) => {
            // console.log('adding to group', value)
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
          window.xxx = this
        })
      })
    },
    draw_timeline(item) {
      let elem = this.$refs['timeline_' + item]
      let items = this.info.items[item]
      let options = this.info.options[item]
      let groups = this.info.groups[item]
      // console.log('drawing', item, 'items', this)
      // console.log('items', items)
      // console.log('options', items, options)
      // console.log('groups', items, groups)
      if (this.timeline[item]) {
        this.timeline[item].setItems(items)
        this.timeline[item].setGroups(groups)
        this.timeline[item].setOptions(options)
        // console.log('fit!', item)
        this.timeline[item].fit()
      } else {
        this.timeline[item] = new vis.Timeline(elem, items, groups, options)
        this.timeline[item].on('rangechanged', (props) => { if (item == 'd' || props.byUser) { this.sync_range(item) } })
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
          // console.log('updating options for a', JSON.parse(ooo), JSON.parse(nnn))
          this.timeline.a.setOptions(this.info.options.a)
        }
      }
      if (this.timeline.b) {
        let ooo = JSON.stringify(this.info.options.b)
        this.info.options.b.min = this.min(this.info.options.a.min, this.info.options.b.min)
        this.info.options.b.max = this.max(this.info.options.a.max, this.info.options.b.max)
        let nnn = JSON.stringify(this.info.options.b)
        if (ooo != nnn) {
          // console.log('updating options for b', JSON.parse(ooo), JSON.parse(nnn))
          this.timeline.b.setOptions(this.info.options.b)
        }
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
    date_str_from_time(time) {
      if (time == -Infinity) {
        return '-∞'
      } else if (time == Infinity) {
        return '∞'
      } else {

        return this.date_from_time(time).utc().format('YYYY-MM-DD HH:mm:SS UTC')
      }
    },
    sync_range(item) {
      ['a', 'b', 'd'].filter(e => e !== item).forEach(tl => {
        // console.log('syncing range to', item)
        this.timeline[tl].setWindow(this.timeline[item].getWindow())
      })
    },
    calculate_diff() {
      if (!this.info.data.a || !this.info.data.b) {
        return
      }

      let offsets = {}
      let min = this.min(this.info.options.a.min, this.info.options.b.min)
      let max = this.max(this.info.options.a.max, this.info.options.b.max)
      let delta = tzversion.delta_ranges(this.info.data.a, this.info.data.b)
      this.info.items.d = delta.map((item, index) => {

        let start = this.date_from_time(item.ini, min, max)
        let end = this.date_from_time(item.fin, min, max)

        let str_offset = this.offset_to_str(item.off)
        offsets[str_offset] = { id: item.off, content: str_offset }
        let title = `<small><b>${this.date_str_from_time(item.ini)}</b> ≤ <b>t</b> < <b>${this.date_str_from_time(item.fin)}</b></small><b>${str_offset}</b>`

        return { id: index, group: item.off, content: str_offset, title: title, start: start, end: end }
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
    },
    fit(item) {
      this.timeline[item].fit()
    },
    select_prev(item) {
      let selected = this.timeline[item].getSelection()[0] - 1 || 0
      selected = selected < 0 ? 0 : selected
      this.timeline[item].setSelection([selected], { focus: true })

    },
    select_next(item) {
      let length = this.info.items[item].length
      let selected = this.timeline[item].getSelection()[0] + 1 || length - 1
      selected = selected >= length ? length - 1 : selected
      this.timeline[item].setSelection([selected], { focus: true })
    },
    fit_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
    },
    prev_select_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
    },
    next_select_disabled(item) {
      return this.timeline[item] == null || this.info.items[item].length == 0
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
  /* border: 1px solid red; */
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
</style>

<style>
.vis-item-content, small {
  display: block;
}
</style>
