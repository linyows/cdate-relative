cdate-schedule
==

This is a [cdate](https://github.com/kawanet/cdate) plugin for schedule format.

[![Build Status](https://img.shields.io/github/actions/workflow/status/linyows/cdate-schedule/build.yml?branch=main&style=for-the-badge)](https://github.com/linyows/cdate-schedule/actions)

Usage
--

```ts
import { cdate } from 'cdate'
import { plugin } from 'cdate-schedule'

const date = cdate().plugin(plugin).scheduleFn()

const now = Date.now

console.log(date(new Date(now)).schedule())
// Today 11:00 AM

const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()-7)
console.log(date(lastWeek).schedule())
// Last Wednesday 11:01 AM

const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()+5)
console.log(date(nextWeek).schedule())
// Next Monday 11:02 AM
```

Author
--

[@linyows](https://github.com/linyows)
