import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getRelativeDate, relative, relativeWith, getFromNow } from './relative'
import { cdate } from 'cdate'

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

test('handler is works as cdate handler', async () => {
  const target = '2023-02-10T00:00:00.000Z'
  const cal = cdate().handler(relative).cdateFn()
  const got = cal(target).format('R H:mm A')
  const want = 'February 10, 2023 9:00 AM'
  assert.equal(got, want)
})

test('handler with locale is works as cdate handler', async () => {
  const target = '2023-02-10T00:00:00.000Z'
  const cal = cdate().handler(relativeWith({ others: 'YYYY年M月DD日' })).cdateFn()
  const got = cal(target).locale('ja').format('R AH:mm')
  const want = '2023年2月10日 午前9:00'
  assert.equal(got, want)
})

test.run()
