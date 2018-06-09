(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{340:function(n,e,t){"use strict";t.r(e);var r={data:function(){return{source:"",preamble:"\nconst { ValueViewerSymbol } = require(\"@runkit/value-viewer\")\nconst { TZVersion } = require('a0-tzmigration-js')\n\nfunction json2table(json) {\n  var cols = Object.keys(json[0])\n\n  let header = cols.map(x => '<th>' + x + '</th>').join('')\n  let body = json.map(row => {\n    return '<tr>' + cols.map(col => '<td>' + row[col] + '</td>').join('') + '</tr>'\n  }).join('')\n  let html = '<table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table>'\n\n  return {\n    [ValueViewerSymbol]: {\n        title: \"JSON2TABLE\",\n        HTML: html\n    }\n  }\n}\n"}},mounted:function(){var n=document.createElement("script"),e=this;e.source=this.$refs.runkit.innerHTML,this.$refs.runkit.innerHTML="",n.setAttribute("src","https://embed.runkit.com"),n.onload=function(){window.RunKit.createNotebook({element:e.$refs.runkit,source:e.source,preamble:e.preamble})},document.head.appendChild(n)}},o=t(0),a=Object(o.a)(r,function(){var n=this.$createElement;return(this._self._c||n)("div",{ref:"runkit"},[this._v("\n// import { TZVersion } from 'a0-tzmigration-js'\n\n// calculate changes from America/Santiago 2015a to America/Punta_Arenas 2017a\nlet version_a = new TZVersion('America/Santiago', '2015a')\nlet version_b = new TZVersion('America/Punta_Arenas', '2017a')\n\nlet changes = await version_a.changes(version_b)\nconsole.log(changes)\n\njson2table(changes)\n  ")])},[],!1,null,null,null);e.default=a.exports}}]);