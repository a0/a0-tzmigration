---
sidebar: auto
---

# Ruby gem

## Introduction

The [a0-tzmigration-ruby](https://rubygems.org/gems/a0-tzmigration-ruby) gem helps you automate the correction of inconsistencies when a new tzdb is released, given the following:
- your system stores all dates as unix timestamps, ie: seconds since the epoch ignoring leap seconds. Many current software works this way.
- your system/users choose a local representation that transform the above date to their local time. You should use an official tzdb timezone, like `America/Santiago`, or some mechanism to get that, UTC offsets like -04:00 are not enough.
- your system stores somewhere what version of the tzdb is currently being used, like `2018e`.

### Installation

Add this line to your application's Gemfile:

```ruby
gem 'a0-tzmigration-ruby'
```

And then execute:

```bash
$ bundle
```

Or install it yourself as:

```bash
$ gem install a0-tzmigration-ruby
```

### Basic Usage

Suppose your system is using tzdb version `2014j`, and a new version `2015a` is released. Once the sysadmin install the new version, users tell you there are inconsistencies.

Using this gem, you can query what changed for `America/Santiago` between versions `2014j` and `2015a`:

```ruby
require 'a0-tzmigration-ruby'

version_a = A0::TZMigration::TZVersion.new('America/Santiago', '2014j')
version_b = A0::TZMigration::TZVersion.new('America/Santiago', '2015a')

puts version_a.changes(version_b)
# =>
[ {:ini_str=>"2015-04-26 03:00:00 UTC", :fin_str=>"2015-09-06 04:00:00 UTC", :off_str=>"+01:00:00", :ini=>1430017200, :fin=>1441512000, :off=>3600},
  {:ini_str=>"2016-04-24 03:00:00 UTC", :fin_str=>"2016-09-04 04:00:00 UTC", :off_str=>"+01:00:00", :ini=>1461466800, :fin=>1472961600, :off=>3600},
  … (ommited) …
  {:ini_str=>"2063-04-29 03:00:00 UTC", :fin_str=>"2063-09-02 04:00:00 UTC", :off_str=>"+01:00:00", :ini=>2945041200, :fin=>2955931200, :off=>3600},
  {:ini_str=>"2064-04-27 03:00:00 UTC", :fin_str=>"∞", :off_str=>"+01:00:00", :ini=>2976490800, :fin=>Infinity, :off=>3600} ]
```

The resulting changes is an array of objects, where:
- `ini`, `fin` are unix timestamps or `-Float::INFINITY`, `Float::INFINITY`.
- `off` is seconds to add, or substract if negative.
- `ini_fin`, `fin_str`, `off_str` are strings with the same meaning.


The same changes in a table:

| ini_str                  |  fin_str                  |  off_str    |  ini         |  fin         |  off  |
|------------------------- | ------------------------- | ----------- | ------------ | ------------ | ------|
| 2015-04-26 03:00:00 UTC  |  2015-09-06 04:00:00 UTC  |  +01:00:00  |  1430017200  |  1441512000  |  3600 |
| 2016-04-24 03:00:00 UTC  |  2016-09-04 04:00:00 UTC  |  +01:00:00  |  1461466800  |  1472961600  |  3600 |
| … (ommited) … |
| 2063-04-29 03:00:00 UTC  |  2063-09-02 04:00:00 UTC  |  +01:00:00  |  2945041200  |  2955931200  |  3600 |
| 2064-04-27 03:00:00 UTC  |  ∞                        |  +01:00:00  |  2976490800  |  Infinity    |  3600 |

For each change, the rule to search affected dates in your system should be the following: \
if **ini** ≤ ***date*** < **fin** then **date** += **off** \
English: for dates between **ini** (included) and **fin** (excluded), add **off** to them.

Using our example, here are some changes that may be applied:
- For dates between 2015-04-26 03:00:00 UTC and 2015-09-06 04:00:00 UTC, add 1 hour.
- For dates between 2064-04-27 03:00:00 UTC and ∞, add 1 hour.

**You should always make sure you are comparing unix timestamps, or quering your system using UTC**. Never convert the above timestamps to localtime.

To convert a `Time` ruby object to unix timestamp, you can do the following:

```ruby
date = Time.new
timestamp = date.to_i
# => 1528057688
```

To convert a unix timestamp to a `Time` ruby object, do the following:

```ruby
timestamp = 1472961600

date = Time.at(timestamp)       # note this is localtime
# => 2016-09-04 01:00:00 -0300

date = Time.at(timestamp).utc   # prefer this, UTC time
# => 2016-09-04 04:00:00 UTC
```

### Other use cases

You can calculate changes between any *(timezone, version)*, not only consecutive transitions of a timezone. This is useful if the tzdb has not been updated regularly in your system, say you need to check the changes for *(America/Santiago, 2015a)* → *(America/Santiago, 2017a)*.

Maybe your users need to change their timezone. This happened in my country in 2017: a new timezone America/Punta_Arenas was created for the south region only. So, we needed to check the changes for *(America/Santiago, 2015a)* → *(America/Punta_Arenas, 2017a)*.

```ruby
require 'a0-tzmigration-ruby'

version_a = A0::TZMigration::TZVersion.new('America/Santiago', '2015a')
version_b = A0::TZMigration::TZVersion.new('America/Punta_Arenas', '2017a')

puts version_a.changes(version_b)
# => [{:ini_str=>"-∞", :fin_str=>"1890-01-01 04:43:40 UTC", :off_str=>"-00:00:54", :ini=>-Infinity, :fin=>-2524504580, :off=>-54},
#     {:ini_str=>"1910-01-01 04:42:46 UTC", :fin_str=>"1910-01-10 04:42:46 UTC", :off_str=>"+00:17:14", :ini=>-1893439034, :fin=>-1892661434, :off=>1034},
#     {:ini_str=>"1918-09-01 04:42:46 UTC", :fin_str=>"1918-09-10 04:42:46 UTC", :off_str=>"-00:42:46", :ini=>-1619983034, :fin=>-1619205434, :off=>-2566},
#     {:ini_str=>"1946-09-01 03:00:00 UTC", :fin_str=>"1947-04-01 04:00:00 UTC", :off_str=>"+01:00:00", :ini=>-736376400, :fin=>-718056000, :off=>3600},
#     {:ini_str=>"1947-05-22 04:00:00 UTC", :fin_str=>"1947-05-22 05:00:00 UTC", :off_str=>"+01:00:00", :ini=>-713649600, :fin=>-713646000, :off=>3600},
#     {:ini_str=>"1988-10-02 04:00:00 UTC", :fin_str=>"1988-10-09 04:00:00 UTC", :off_str=>"-01:00:00", :ini=>591768000, :fin=>592372800, :off=>-3600},
#     {:ini_str=>"1990-03-11 03:00:00 UTC", :fin_str=>"1990-03-18 03:00:00 UTC", :off_str=>"-01:00:00", :ini=>637124400, :fin=>637729200, :off=>-3600},
#     {:ini_str=>"2016-05-15 03:00:00 UTC", :fin_str=>"2016-08-14 04:00:00 UTC", :off_str=>"-01:00:00", :ini=>1463281200, :fin=>1471147200, :off=>-3600}]
```

If you want to create an UI, you can query the index of currently known timezones:

```ruby
# get current known timezones in the repository
A0::TZMigration::TZVersion.timezones
# => { "Africa/Abidjan" =>
#      { "versions" => [ "2013c", "2013d", "2013e", "2013f", "2013g", …
```

You can also query the index of currently known versions:

```ruby
# get current known versions in the repository
A0::TZMigration::TZVersion.versions
# => { "2013c" =>
#      { "released_at" => "2013-04-19 16:17:40 -0700",
#        "timezones" => [ "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", …

```

### How it works

When you create a new TZVersion instance, it will download on demand the corresponding timezone file from our [tzdb version Repository](https://a0.github.io/a0-tzmigration-ruby/data/), which is documented here: [About the Repo](../../data/).

Your system needs to have access to the internet in order to download that file. The file is cached once per instance.

When you call `version_a.changes(version_b)`, it will compare the transitions of both versions and returns an array of changes.

The indexes are never cached in `TZVersion.timezones` or `TZVersion.versions`, but you may have a proxy.
