(window.webpackJsonp=window.webpackJsonp||[]).push([[8,10],{11:function(t,n,e){"use strict";e.r(n);e(161);var i={methods:{offset_to_str:function(t){var n=new Date(null),e=t<0?-t:t,i=t<0?"-":"+";return n.setTime(1e3*e),i+n.toISOString().substr(11,8)}}},s=e(0),o=Object(s.a)(i,void 0,void 0,!1,null,null,null);n.default=o.exports},160:function(t,n,e){"use strict";var i=e(5),s=Date.prototype.getTime,o=Date.prototype.toISOString,r=function(t){return t>9?t:"0"+t};t.exports=i(function(){return"0385-07-25T07:06:39.999Z"!=o.call(new Date(-5e13-1))})||!i(function(){o.call(new Date(NaN))})?function(){if(!isFinite(s.call(this)))throw RangeError("Invalid time value");var t=this,n=t.getUTCFullYear(),e=t.getUTCMilliseconds(),i=n<0?"-":n>9999?"+":"";return i+("00000"+Math.abs(n)).slice(i?-6:-4)+"-"+r(t.getUTCMonth()+1)+"-"+r(t.getUTCDate())+"T"+r(t.getUTCHours())+":"+r(t.getUTCMinutes())+":"+r(t.getUTCSeconds())+"."+(e>99?e:"0"+r(e))+"Z"}:o},161:function(t,n,e){var i=e(3),s=e(160);i(i.P+i.F*(Date.prototype.toISOString!==s),"Date",{toISOString:s})},163:function(t,n,e){},299:function(t,n,e){"use strict";var i=e(163);e.n(i).a},338:function(t,n,e){"use strict";e.r(n);e(10),e(22),e(78);var i={props:["info","changes_text","version"],extends:e(11).default,methods:{generate_csv:function(){var t=["data:text/csv;charset=utf-8,CHANGES TO BE APPLIED"];t.push("start timezone:,".concat(this.info.name.a,",start version:,").concat(this.info.version.a,", ,final timezone:,").concat(this.info.name.b,",final version:,").concat(this.info.version.b)),t.push("apply query start <= t < end"),t.push("ini unix timestamp,fin unix timestamp,change [seconds],ini date,fin date,change"),this.info.items.d.forEach(function(n){t.push([n.ini,n.fin,n.group,n.ini_str,n.fin_str,n.content])}),window.open(encodeURI(t.join("\n")))}}},s=(e(299),e(0)),o=Object(s.a)(i,function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("table",[e("tr",[e("th",{attrs:{colspan:"4"}},[e("button",{on:{click:t.generate_csv}},[t._v("download csv")]),t._v(t._s(t.changes_text)),e("small",[t._v("start ≤ t < end")])])]),t._m(0),t._l(t.info.items.d,function(n){return e("tr",[e("td",[t._v(t._s(n.ini_str))]),e("td",[t._v(t._s(n.fin_str))]),e("td",[t._v(t._s(n.content))])])})],2)},[function(){var t=this.$createElement,n=this._self._c||t;return n("tr",[n("th",[this._v("start")]),n("th",[this._v("end")]),n("th",[this._v("apply offset")])])}],!1,null,"670998c8",null);n.default=o.exports}}]);