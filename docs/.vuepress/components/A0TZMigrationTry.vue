<template>
  <div ref="runkit">
// import { TZVersion } from 'a0-tzmigration-js'

// calculate changes from America/Santiago 2015a to America/Punta_Arenas 2017a
let version_a = new TZVersion('America/Santiago', '2015a')
let version_b = new TZVersion('America/Punta_Arenas', '2017a')

let changes = await version_a.changes(version_b)
console.log(changes)

json2table(changes)
  </div>
</template>

<script>
export default {
  data() {
    return {
      source: '',
      preamble: `
const { ValueViewerSymbol } = require("@runkit/value-viewer")
const { TZVersion } = require('a0-tzmigration-js')

function json2table(json) {
  var cols = Object.keys(json[0])

  let header = cols.map(x => '<th>' + x + '</th>').join('')
  let body = json.map(row => {
    return '<tr>' + cols.map(col => '<td>' + row[col] + '</td>').join('') + '</tr>'
  }).join('')
  let html = '<table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table>'

  return {
    [ValueViewerSymbol]: {
        title: "JSON 2 TABLE",
        HTML: html
    }
  }
}
`
    }
  },
  mounted() {
    let script = document.createElement('script')
    let vm = this

    vm.source = this.$refs['runkit'].innerHTML
    this.$refs['runkit'].innerHTML = ''

    script.setAttribute('src', 'https://embed.runkit.com')
    script.onload = function() {
      window.RunKit.createNotebook({
        element: vm.$refs['runkit'],
        source: vm.source,
        preamble: vm.preamble
      })
    }
    document.head.appendChild(script);
  }
}
</script>
