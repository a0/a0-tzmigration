---
home: true
actionText: Demo →
actionLink: /demo/
footer: MIT Licensed | Copyright © 2018 Servicios A0 SpA
---

# About

Whenever a new [Time Zone Database](https://www.iana.org/time-zones) is released it could mean a huge pain for you and your users. This utilities allow you to get the ranges of affected dates when that happens; so your system may automatically migrate that data or ask your users what is the right thing to do.


# Integrating this in your own software

There are currently packages for [ruby](./api/ruby/) and [javascript](./api/js/), all of them fetch the latest tzdb versions from our [repository](https://a0.github.io/a0-tzmigration-ruby/data/) to calculate the changes.

You can calculate changes between any *(timezone, version)*, not only consecutive transitions. This could be useful when users change their timezone. For ex:
*(America/Santiago, 2015a)* → *(America/Punta_Arenas, 2018e)*.


# Try it!

Use our [Demo](./demo/) app, or modify the code below for calling the javascript API.

<ClientOnly><A0TZMigrationTry/></ClientOnly>

# Time can be really complicated in computers

If you are new to the issues of handling correctly time in software, please read the following:
- [About time and computers](https://medium.com/servicios-a0/about-time-and-computers-530dd3937582) for an introductory post to some of the nuances (13 min read).


# Opensource

Please note this is an effort from normal people, like you.

The current version of the database or software packages could have bugs. Or errors could be present in our JSON repository, which is generated from the [tzinfo-data](https://github.com/tzinfo/tzinfo-data) ruby gem; which have versions 2013c onwards and calculates timezone transitions up to 50 years from now (currently ≈ 2068).

**THIS SOFTWARE IS CURRENTLY IN BETA, USE WITH CAUTION, DOUBLE CHECK EVERYTHING BEFORE APPLYING CHANGES TO YOUR SYSTEMS**

Bug reports, corrections and suggestions are welcome in our [github issues page](https://github.com/a0/a0-tzmigration/issues).
