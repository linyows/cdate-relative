import { cdate } from 'cdate'

export interface Labels {
  yesterday?: string
  today?: string
  tomorrow?: string
  next?: string
  last?: string
  week?: string
  others?: string
}

export interface Options {
  specificNow?: Date,
  labels?: Labels
}

const defaultOptions = {
  labels: {
    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow',
    next: 'Next',
    last: 'Last',
    week: 'dddd',
    others: 'MMMM D, YYYY',
    past: '%s ago',
    future: 'in %s',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    months: 'months',
    years: 'years',
  },
}

export function getRelativeDate (d: cdate.DateLike, options: Options = defaultOptions) {
  const unixFormat = 'X'
  const iso8601 = d.toString()
  const { specificNow, labels } = {
    specificNow: options.specificNow,
    labels: { ...defaultOptions.labels, ...options.labels },
  }

  // Now in Timezone
  const dateNow = specificNow ? specificNow : new Date(Date.now())
  const now = cdate(dateNow)
  const today = now.format(labels.others)
  const yesterday = now.add(-1, 'day').format(labels.others)
  const tommorrow = now.add(1, 'day').format(labels.others)

  // UTC to Timezone
  const utcOffset = -(dateNow.getTimezoneOffset())
  const target = cdate(iso8601).utcOffset(utcOffset)
  const targetUnix = target.format(unixFormat)
  const targetDate = target.format(labels.others)

  // When today, yesterday or tommorow
  switch (targetDate) {
    case today:
      return labels.today
    case yesterday:
      return labels.yesterday
    case tommorrow:
      return labels.tomorrow
  }

  const targetWeekName = target.format(labels.week)
  const targetDateTime = target.format(labels.others)

  // When last week
  const lastWeekStart = now.add(-1, 'week').startOf('week')
  const lastWeekEnd = now.add(-1, 'week').endOf('week')
  const lastWeekStartUnix = lastWeekStart.format(unixFormat)
  const lastWeekEndUnix = lastWeekEnd.format(unixFormat)
  if (lastWeekStartUnix <= targetUnix && targetUnix <= lastWeekEndUnix) {
    return `${labels.last} ${targetWeekName}`
  }

  // When this week
  const thisWeekStart = now.startOf('week')
  const thisWeekEnd = now.endOf('week')
  const thisWeekStartUnix = thisWeekStart.format(unixFormat)
  const thisWeekEndUnix = thisWeekEnd.format(unixFormat)
  if (thisWeekStartUnix <= targetUnix && targetUnix <= thisWeekEndUnix) {
    return targetWeekName
  }

  // When next week
  const nextWeekStart = now.add(1, 'week').startOf('week')
  const nextWeekEnd = now.add(1, 'week').endOf('week')
  const nextWeekStartUnix = nextWeekStart.format(unixFormat)
  const nextWeekEndUnix = nextWeekEnd.format(unixFormat)
  if (nextWeekStartUnix <= targetUnix && targetUnix <= nextWeekEndUnix) {
    return `${labels.next} ${targetWeekName}`
  }

  // When past than last week or future from next week
  return targetDateTime
}

export function getFromNow (d: cdate.DateLike, options: Options = defaultOptions) {
  const unixFormat = 'X'
  const iso8601 = d.toString()

  const { specificNow, labels } = {
    specificNow: options.specificNow,
    labels: { ...defaultOptions.labels, ...options.labels },
  }

  const secInMin = 60
  const secInHour = 60 * secInMin
  const secInDay = 24 * secInHour
  const secInMonth = 30 * secInDay
  const secInYear = 365 * secInDay

  const dateNow = specificNow ? specificNow : new Date(Date.now())
  const now = +cdate(dateNow).format(unixFormat)
  const target = +cdate(iso8601).format(unixFormat)

  // Future or Past seconds
  const diff = (now < target) ? target - now : now - target

  let words = ''

  switch (true) {
    case diff < secInMin:
      words = `${diff} ${labels.seconds}`
      break
    case diff < secInHour:
      words = `${Math.floor(diff / secInMin)} ${labels.minutes}`
      break
    case diff < secInDay:
      words =  `${Math.floor(diff / secInHour)} ${labels.hours}`
      break
    case diff < secInMonth:
      words = `${Math.floor(diff / secInDay)} ${labels.days}`
      break
    case diff < secInYear:
      words = `${Math.floor(diff / secInMonth)} ${labels.months}`
      break
    default:
      words = `${Math.floor(diff / secInYear)} ${labels.years}`
      break
  }

  return ((now < target) ? labels.future : labels.past).replace('%s', words)
}

export function relativeWith(labels?: Labels): cdate.Handlers {
  return {
    "R": (dt: cdate.DateLike) => getRelativeDate(dt, { labels })
  }
}

export const relative = relativeWith()
