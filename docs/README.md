---
home: true
actionText: Demo →
actionLink: /demo/
footer: MIT Licensed | Copyright © 2018 Servicios A0 SpA
---

# About

Whenever a new [Time Zone Database is released](https://www.iana.org/time-zones) it could mean a huge pain for you and your users. This utilities allow you to get the ranges of affected dates when that happens; so your system may automatically migrate that data or ask your users what is the right thing to do.

# Sample code

You can incorporate this in your own systems. There are currently packages for ruby and javascript, they fetch the latest tzdb versions from our [repository](https://a0.github.io/a0-tzmigration-ruby/data/) to calculate the changes.

Please note you can transition between any *(timezone, version)*, which could be useful when users change their timezone. For ex:
*(America/Santiago, 2015a)* → *(America/Punta_Arenas, 2018e)*, 

**Ruby gem**

```ruby
require 'a0-tzmigration-ruby'

version_a = A0::TZMigration::TZVersion.new('America/Santiago', '2015a')
version_b = A0::TZMigration::TZVersion.new('America/Punta_Arenas', '2017a')

version_a.changes(version_b)
# =>
[{:ini_str=>"-∞", :fin_str=>"1890-01-01 04:43:40 UTC", :off_str=>"-00:00:54", :ini=>-Infinity, :fin=>-2524504580, :off=>-54},
 {:ini_str=>"1910-01-01 04:42:46 UTC", :fin_str=>"1910-01-10 04:42:46 UTC", :off_str=>"+00:17:14", :ini=>-1893439034, :fin=>-1892661434, :off=>1034},
 {:ini_str=>"1918-09-01 04:42:46 UTC", :fin_str=>"1918-09-10 04:42:46 UTC", :off_str=>"-00:42:46", :ini=>-1619983034, :fin=>-1619205434, :off=>-2566},
 {:ini_str=>"1946-09-01 03:00:00 UTC", :fin_str=>"1947-04-01 04:00:00 UTC", :off_str=>"+01:00:00", :ini=>-736376400, :fin=>-718056000, :off=>3600},
 {:ini_str=>"1947-05-22 04:00:00 UTC", :fin_str=>"1947-05-22 05:00:00 UTC", :off_str=>"+01:00:00", :ini=>-713649600, :fin=>-713646000, :off=>3600},
 {:ini_str=>"1988-10-02 04:00:00 UTC", :fin_str=>"1988-10-09 04:00:00 UTC", :off_str=>"-01:00:00", :ini=>591768000, :fin=>592372800, :off=>-3600},
 {:ini_str=>"1990-03-11 03:00:00 UTC", :fin_str=>"1990-03-18 03:00:00 UTC", :off_str=>"-01:00:00", :ini=>637124400, :fin=>637729200, :off=>-3600},
 {:ini_str=>"2016-05-15 03:00:00 UTC", :fin_str=>"2016-08-14 04:00:00 UTC", :off_str=>"-01:00:00", :ini=>1463281200, :fin=>1471147200, :off=>-3600}]

# get current known versions in the repository
A0::TZMigration::TZVersion.versions

# get current known transitions in the repository
A0::TZMigration::TZVersion.transitions
```

**Javascript NPM package**

```javascript
import { TZVersion } from 'a0-tzmigration-js'

let version_a = TZVersion.new('America/Santiago', '2015a')
let version_b = TZVersion.new('America/Santiago', '2015c')

version_a.changes(version_b).then(changes => {
  console.log(changes)
})

// get current known versions in the repository
TZVersion.versions().then(versions => {
  console.log(versions)
})

// get current known transitions in the repository
TZVersion.transitions().then(transitions => {
  console.log(transitions)
})
```

# Time can be really complicated in computers

If you are new to the issues of handling correctly time in software, please read the following:
- [About time and computers](https://medium.com/servicios-a0/about-time-and-computers-530dd3937582) for an introductory post to some of the nuances (13 min read).

# Opensource

Please note this is an effort from normal people, like you.

The current version of the database or software packages could have bugs. Or errors could be present in our JSON repository, which is generated from the [tzinfo-data](https://github.com/tzinfo/tzinfo-data) ruby gem; which have versions 2013c onwards and calculates timezone transitions up to 50 years from now (currently ≈ 2068). Double check everything before applying changes to your systems.

Bug reports, corrections and suggestions are welcome in our [github issues page](https://github.com/a0/a0-tzmigration/issues).
