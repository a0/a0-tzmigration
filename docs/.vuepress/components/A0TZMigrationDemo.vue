<template lang="pug">
  div
    div.parent
      template(v-if="timezones")
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.a" label="First Zone")
          CustomSelect(:items="versions_a" v-model="version.a" label="Version" updown="x")
          div.item
            label &nbsp;
            button(@click="copy") copy →
        div.col
          CustomSelect(:items="timezone_names" v-model="timezone.b" label="Second Zone")
          CustomSelect(:items="versions_b" v-model="version.b" label="Version" updown="x")
      template(v-else)
        | Loading…
    div.row.text-left
      b(v-if="loading.a") Loading A …
      b(v-else) {{ info.name.a }} ({{ version.a }})
    div(ref="timeline_a")
    div.row.text-center
      b(v-if="loading.a || loading.b") …
      b(v-else) Changes (A → B)
    div(ref="timeline_d")
    div.row.text-right
      b(v-if="loading.b") Loading B …
      b(v-else) {{ info.name.b }} ({{ version.b }})
    div(ref="timeline_b")
</template>

<script>
import axios from 'axios'
import vis from 'vis'
import 'vis/dist/vis.min.css'

export default {
  data() {
    return {
      timezone: { a: null, b: null },
      version: { a: null, b: null },
      timeline: { a: null, b: null },
      info: {
        name: { a: null, b: null },
        utc_min: { a: null, b: null },
        utc_max: { a: null, b: null },
        items: { a: null, b: null },
        groups: { a: null, b: null },
        options: { a: {}, b: {} }
      },
      loading: { a: null, b: null },
      timezones: null,
      timezone_names: null
    }
  },
  mounted() {
    axios.get(this.$withBase('/data/timezones/00-index.json')).then(response => {
      this.timezones = response.data.timezones
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
      let pre = offset < 0 ? '-' : ''
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
      console.log('item', item)
      this.loading[item] = true
      this.info.utc_min[item] = null
      this.info.utc_max[item] = null
      this.$nextTick(() => {
        this.fetch_timezone(this.timezone[item], this.version[item], item).then(data => {
          console.log(data)
          let offsets = {}
          let items = data.transitions.map((elem, index) => {
            let utc_timestamp = elem['utc_timestamp']
            let utc_offset = elem['utc_offset']
            let str_offset = this.offset_to_str(utc_offset)
            offsets[str_offset] = { id: utc_offset, content: str_offset }

            let title = '<b>' + str_offset + '</b>'
            title += '<small>' + elem['local_ini_str'] + '</small>'
            title += '<small>' + elem['local_fin_str'] + '</small>'

            this.info.utc_min[item] = this.min(utc_timestamp, this.info.utc_min[item])
            this.info.utc_max[item] = this.max(utc_timestamp, this.info.utc_max[item])
            console.log(item, 'min', JSON.parse(JSON.stringify(this.info.utc_min)), 'max', JSON.parse(JSON.stringify(this.info.utc_max)))

            return { group: utc_offset, content: '', title: title, start: elem['utc_time'] }
          });
          this.info.items[item] = items
          console.log(items)
          
          let groups = this.info.groups[item] = new vis.DataSet()
          console.log('offsets', offsets)
          Object.values(offsets).forEach((value) => {
            console.log('adding to group', value)
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
          window.xxx = this
        })
      })
    },
    draw_timeline(item) {
      let elem = this.$refs['timeline_' + item]
      let items = this.info.items[item]
      let options = this.info.options[item]
      let groups = this.info.groups[item]
      console.log('drawing', item, 'items', this)
      console.log('items', items)
      console.log('options', items, options)
      console.log('groups', items, groups)
      this.timeline[item] && this.timeline[item].destroy()
      this.timeline[item] = new vis.Timeline(elem, items, groups, options)
      this.loading[item] = false
    },
    update_timeline_options() {
      if (this.timeline.a) {
        let ooo = JSON.stringify(this.info.options.a)
        this.info.options.a.min = this.min(this.info.options.a.min, this.info.options.b.min)
        this.info.options.a.max = this.max(this.info.options.a.max, this.info.options.b.max)
        let nnn = JSON.stringify(this.info.options.a)
        if (ooo != nnn) {
          console.log('updating options for a', JSON.parse(ooo), JSON.parse(nnn))
          this.timeline.a.setOptions(this.info.options.a)
        }
      }
      if (this.timeline.b) {
        let ooo = JSON.stringify(this.info.options.b)
        this.info.options.b.min = this.min(this.info.options.a.min, this.info.options.b.min)
        this.info.options.b.max = this.max(this.info.options.a.max, this.info.options.b.max)
        let nnn = JSON.stringify(this.info.options.b)
        if (ooo != nnn) {
          console.log('updating options for b', JSON.parse(ooo), JSON.parse(nnn))
          this.timeline.b.setOptions(this.info.options.b)
        }
      }
    },
    fetch_timezone(timezone, version, item) {
      return new Promise((resolve, reject) => {
        this.info.name[item] = timezone
        axios.get(this.$withBase('/data/timezones/' + timezone + '.json')).then(response => {
          let timeline = response.data.versions[version]
          if (timeline.alias) {
            this.fetch_timezone(timeline.alias, version, item).then(resolve).catch(reject)
          } else {
            resolve(timeline)
          }
        }).catch(reject)
      })
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
