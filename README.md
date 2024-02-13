cdate-relative
==

This is a [cdate](https://github.com/kawanet/cdate) plugin for relative format.

[![Build Status](https://img.shields.io/github/actions/workflow/status/linyows/cdate-relative/build.yml?branch=main&style=for-the-badge)](https://github.com/linyows/cdate-relative/actions)A

Usage
--

```ts
import { cdate } from 'cdate'
import { relative, relativeWith } from 'cdate-relative'

const date = cdate().handler(relative).cdateFn()
const now = Date.now

console.log(date(new Date(now)).format('R HH:mm A'))
// Today 11:00 AM

const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()-7)
console.log(date(lastWeek).format('R HH:mm A'))
// Last Wednesday 11:01 AM

const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()+5)
console.log(date(nextWeek).format('R HH:mm A'))
// Next Monday 11:02 AM

const labels = { next: '次の' }
const jaDate = cdate().locale('ja').handler(relativeWith(labels)).cdateFn()
console.log(jaDate(nextWeek).format('R AHH:mm'))
// 次の日曜日 午前11:02
```

Author
--

[@linyows](https://github.com/linyows)
