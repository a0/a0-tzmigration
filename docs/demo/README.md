---
title: Demo
pageClass: demo
---

<A0TZMigrationDemo/>

# About this demo

**THIS SOFTWARE IS BETA, USE WITH CAUTION, DOUBLE CHECK EVERYTHING**

This UI allows you to see what changes must be applied to your system/database whenever a change occurs in the [tzdata/zoneinfo/Olson database](https://en.wikipedia.org/wiki/Tz_database).

In order to do so, your system must adhere to the following rules:
1. All timestamps must be stored in UTC/seconds since the epoch, leap seconds *ignored* (as UNIX does).
2. To display a local time, the representation uses some form of the tzdata, and your system/users configure an official timezone name like 'America/Santiago', ie: not 'UTC-4'.
3. You must store somewhere in your system what version of the tzinfo is currently being used, like '2013c'.

Given the above, Choose your current timezone/version on the left (ex: 'America/Santiago', '2013c') and then the new timezone/version on the right (ex: 'America/Santiago', '2016a').

Time in software is kind of a mess, so please take that into account.

## Acknowledgments

- The data comes from our [a0-tzmigration-ruby gem](https://github.com/a0/a0-tzmigration-ruby), which in turns take the data from the [tzinfo-data ruby gem](https://github.com/tzinfo/tzinfo-data), which in turns uses the original [IANA Time Zone Database](https://www.iana.org/time-zones).
- The cool timeline is from [visjs.org](http://visjs.org).
- The page is powered by [VuePress](https://vuepress.vuejs.org), the demo is coded using [Vue.js](https://vuejs.org).
