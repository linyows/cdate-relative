import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getRelativeDate, relative, relativeWith, getFromNow } from './relative'
import { cdate } from 'cdate'
import { before } from 'node:test'

test.before(() => {
  process.env.TZ = 'UTC'
})

// Today is Saturday
const strToDate = (d: string) => new Date(Date.parse(d))
const today = '2024-02-10T00:00:00.000Z'
const todayDate = strToDate(today)

test('format returns correct when last week to next week', async () => {
  const addTime = (d: string) => strToDate(`${d}T00:00:00.000Z`)
  const tests = [
    { args: addTime('2024-01-27'), want: 'January 27, 2024' },
    { args: addTime('2024-01-28'), want: 'Last Sunday' },
    { args: addTime('2024-01-29'), want: 'Last Monday' },
    { args: addTime('2024-01-30'), want: 'Last Tuesday' },
    { args: addTime('2024-01-31'), want: 'Last Wednesday' },
    { args: addTime('2024-02-01'), want: 'Last Thursday' },
    { args: addTime('2024-02-02'), want: 'Last Friday' },
    { args: addTime('2024-02-03'), want: 'Last Saturday' },
    { args: addTime('2024-02-04'), want: 'Sunday' },
    { args: addTime('2024-02-05'), want: 'Monday' },
    { args: addTime('2024-02-06'), want: 'Tuesday' },
    { args: addTime('2024-02-07'), want: 'Wednesday' },
    { args: addTime('2024-02-08'), want: 'Thursday' },
    { args: addTime('2024-02-09'), want: 'Yesterday' }, // Friday
    { args: addTime('2024-02-10'), want: 'Today' },     // Saturday
    { args: addTime('2024-02-11'), want: 'Tomorrow' },  // Next Sunday
    { args: addTime('2024-02-12'), want: 'Next Monday' },
    { args: addTime('2024-02-13'), want: 'Next Tuesday' },
    { args: addTime('2024-02-14'), want: 'Next Wednesday' },
    { args: addTime('2024-02-15'), want: 'Next Thursday' },
    { args: addTime('2024-02-16'), want: 'Next Friday' },
    { args: addTime('2024-02-17'), want: 'Next Saturday' },
    { args: addTime('2024-02-18'), want: 'February 18, 2024' },
  ]

  for (const t of tests) {
    const { args, want } = t
    const got = getRelativeDate(args, { specificNow: todayDate })
    assert.equal(got, want)
  }
})

test('format returns correct when within time', async () => {
  const tests = [
    { args: '2024-02-10T21:23:45.000Z', want: 'Today', tz: 'UTC' },
    { args: '2024-02-10T21:23:45.000Z', want: 'Tomorrow', tz: 'Asia/Tokyo' },
    // Future
    { args: '2124-12-31T15:05:00.000Z', want: 'December 31, 2124', tz: 'UTC' },
    { args: '2124-12-31T15:05:00.000Z', want: 'January 1, 2125', tz: 'Asia/Tokyo' },
    // Past
    { args: '2023-12-31T15:05:00.000Z', want: 'December 31, 2023', tz: 'UTC' },
    { args: '2023-12-31T15:05:00.000Z', want: 'January 1, 2024', tz: 'Asia/Tokyo' },
  ]

  for (const t of tests) {
    const { args, want, tz } = t
    process.env.TZ = tz
    const got = getRelativeDate(strToDate(args), { specificNow: todayDate })
    assert.equal(got, want)
  }
})

test('format returns correct when over last week past and over next week future', async () => {
  const tests = [
    // Future
    { args: '2124-12-31T15:05:00.000Z', want: 'December 31, 2124', tz: 'UTC' },
    { args: '2124-12-31T15:05:00.000Z', want: 'January 1, 2125', tz: 'Asia/Tokyo' },
    // Past
    { args: '2023-12-31T15:05:00.000Z', want: 'December 31, 2023', tz: 'UTC' },
    { args: '2023-12-31T15:05:00.000Z', want: 'January 1, 2024', tz: 'Asia/Tokyo' },
  ]

  for (const t of tests) {
    const { args, want, tz } = t
    process.env.TZ = tz
    const got = getRelativeDate(strToDate(args), { specificNow: todayDate })
    assert.equal(got, want)
  }
})

test('getFromNow returns correct', async () => {
  const tests = [
    // Future
    { args: '2024-02-10T00:00:01.000Z', want: 'in 1 seconds', tz: 'UTC' },
    { args: '2024-02-10T00:01:00.000Z', want: 'in 1 minutes', tz: 'UTC' },
    { args: '2024-02-10T00:59:00.000Z', want: 'in 59 minutes', tz: 'UTC' },
    { args: '2024-02-10T01:00:00.000Z', want: 'in 1 hours', tz: 'UTC' },
    { args: '2024-02-10T23:00:00.000Z', want: 'in 23 hours', tz: 'UTC' },
    { args: '2024-02-11T00:00:00.000Z', want: 'in 1 days', tz: 'UTC' },
    { args: '2024-03-10T23:59:59.000Z', want: 'in 29 days', tz: 'UTC' },
    { args: '2024-03-12T00:00:00.000Z', want: 'in 1 months', tz: 'UTC' },
    { args: '2025-02-08T23:59:59.000Z', want: 'in 12 months', tz: 'UTC' },
    { args: '2025-02-10T00:00:00.000Z', want: 'in 1 years', tz: 'UTC' },
    { args: '2048-02-10T00:00:00.000Z', want: 'in 24 years', tz: 'UTC' },
    { args: '2048-02-10T00:00:00.000Z', want: 'in 24 years', tz: 'Asia/Tokyo' },
    // Past
    { args: '2024-02-09T23:59:59.000Z', want: '1 seconds ago', tz: 'UTC' },
    { args: '2024-02-09T23:59:59.000Z', want: '1 seconds ago', tz: 'Asia/Tokyo' },
    { args: '2024-02-09T23:59:00.000Z', want: '1 minutes ago', tz: 'UTC' },
    { args: '2024-02-09T23:00:01.000Z', want: '59 minutes ago', tz: 'UTC' },
    { args: '2024-02-09T23:00:00.000Z', want: '1 hours ago', tz: 'UTC' },
    { args: '2024-02-09T00:00:01.000Z', want: '23 hours ago', tz: 'UTC' },
    { args: '2024-02-09T00:00:00.000Z', want: '1 days ago', tz: 'UTC' },
    { args: '2024-01-11T00:00:01.000Z', want: '29 days ago', tz: 'UTC' },
    { args: '2024-01-11T00:00:00.000Z', want: '1 months ago', tz: 'UTC' },
    { args: '2023-02-10T00:00:01.000Z', want: '12 months ago', tz: 'UTC' },
    { args: '2023-02-10T00:00:00.000Z', want: '1 years ago', tz: 'UTC' },
    { args: '2000-02-10T00:00:00.000Z', want: '24 years ago', tz: 'UTC' },
  ]

  for (const t of tests) {
    const { args, want, tz } = t
    process.env.TZ = tz
    const got = getFromNow(strToDate(args), { specificNow: todayDate })
    assert.equal(got, want)
  }
})

test('handler is works as cdate handler', async () => {
  const tests = [
    { args: 'R H:mm A', want: 'February 10, 2023 0:00 AM' },
    { args: 'F', want: `${new Date(Date.now()).getFullYear() - 2023} years ago` },
  ]
  const target = '2023-02-10T00:00:00.000Z'
  const cal = cdate().handler(relative).cdateFn()

  for (const t of tests) {
    const { args, want } = t
    const got = cal(target).format(args)
    assert.equal(got, want)
  }
})

test('handler with locale is works as cdate handler', async () => {
  const target = '2023-02-10T00:00:00.000Z'
  const labels = {
    others: 'YYYY年M月DD日',
    future: '%s後',
    past: '%s前',
    seconds: '秒',
    minutes: '分',
    hours: '時間',
    days: '日',
    months: 'ヶ月',
    years: '年',
  }
  const cal = cdate().handler(relativeWith(labels)).cdateFn()

  const tests = [
    { args: 'R AH:mm', want: '2023年2月10日 午前0:00' },
    { args: 'F', want: `${new Date(Date.now()).getFullYear() - 2023} 年前` },
  ]

  for (const t of tests) {
    const { args, want } = t
    const got = cal(target).locale('ja').format(args)
    assert.equal(got, want)
  }
})

test.run()
