import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { scheduleFormat, schedulePlugin } from './schedule'
import { cdate } from 'cdate'

test('scheduleFormat returns correct', async () => {
  // Today is Saturday
  const today = '2024-02-10T00:00:00.000Z'
  const todayDate = new Date(Date.parse(today))
  const addTime = (date: string) => `${date}T00:00:00.000Z`

  const tests = [
    { args: addTime('2024-01-27'), want: 'January 27, 2024', tz: 'UTC' },
    { args: addTime('2024-01-28'), want: 'Last Sunday', tz: 'UTC' },
    { args: addTime('2024-01-29'), want: 'Last Monday', tz: 'UTC' },
    { args: addTime('2024-01-30'), want: 'Last Tuesday', tz: 'UTC' },
    { args: addTime('2024-01-31'), want: 'Last Wednesday', tz: 'UTC' },
    { args: addTime('2024-02-01'), want: 'Last Thursday', tz: 'UTC' },
    { args: addTime('2024-02-02'), want: 'Last Friday', tz: 'UTC' },
    { args: addTime('2024-02-03'), want: 'Last Saturday', tz: 'UTC' },
    { args: addTime('2024-02-04'), want: 'Sunday', tz: 'UTC' },
    { args: addTime('2024-02-05'), want: 'Monday', tz: 'UTC' },
    { args: addTime('2024-02-06'), want: 'Tuesday', tz: 'UTC' },
    { args: addTime('2024-02-07'), want: 'Wednesday', tz: 'UTC' },
    { args: addTime('2024-02-08'), want: 'Thursday', tz: 'UTC' },
    { args: addTime('2024-02-09'), want: 'Yesterday', tz: 'UTC' }, // Friday
    { args: addTime('2024-02-10'), want: 'Today', tz: 'UTC' }, // Saturday
    { args: addTime('2024-02-11'), want: 'Tomorrow', tz: 'UTC' }, // Next Sunday
    { args: addTime('2024-02-12'), want: 'Next Monday', tz: 'UTC' },
    { args: addTime('2024-02-13'), want: 'Next Tuesday', tz: 'UTC' },
    { args: addTime('2024-02-14'), want: 'Next Wednesday', tz: 'UTC' },
    { args: addTime('2024-02-15'), want: 'Next Thursday', tz: 'UTC' },
    { args: addTime('2024-02-16'), want: 'Next Friday', tz: 'UTC' },
    { args: addTime('2024-02-17'), want: 'Next Saturday', tz: 'UTC' },
    { args: addTime('2024-02-18'), want: 'February 18, 2024', tz: 'UTC' },
    // With time
    { args: '2024-02-10T21:23:45.000Z', want: 'Today 9:23 PM', tz: 'UTC' },
    { args: '2024-02-10T21:23:45.000Z', want: 'Tomorrow 6:23 AM', tz: 'Asia/Tokyo' },
    // Future
    { args: '2124-12-31T15:05:00.000Z', want: 'December 31, 2124 3:05 PM', tz: 'UTC' },
    { args: '2124-12-31T15:05:00.000Z', want: 'January 1, 2125 12:05 AM', tz: 'Asia/Tokyo' },
    // Past
    { args: '2023-12-31T15:05:00.000Z', want: 'December 31, 2023 3:05 PM', tz: 'UTC' },
    { args: '2023-12-31T15:05:00.000Z', want: 'January 1, 2024 12:05 AM', tz: 'Asia/Tokyo' },
  ]

  for (const t of tests) {
    const { args, want, tz } = t
    process.env.TZ = tz
    const got = scheduleFormat(cdate, args, todayDate)
    assert.equal(got, want)
  }
})

test('schedulePlugin is works as cdate plugin', async () => {
  const target = '2023-02-10T00:00:00.000Z'
  const cal = cdate().plugin(schedulePlugin).scheduleFn()
  const got = cal(target).schedule()
  // const got = cal(target).locale('ja').schedule()
  const want = 'February 10, 2023 9:00 AM'
  assert.equal(got, want)
})

test.run()

