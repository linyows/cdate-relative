import { cdate } from 'cdate'

const unixFormat = 'X'
const weekNameFormat = 'dddd'
const dateFormat = 'MMMM D, YYYY'
const timeFormat = 'h:mm A'
const cleared = 'T00:00:00.000Z'

// const relativeDate = {
//   yesterday: 'Yesterday',
//   today: 'Today',
//   tomorrow: 'Tomorrow',
//   next: 'Next',
//   last: 'Last',
// }

export function format (cd: cdate.cdate, iso8601: string, specificNow?: Date) {
  const isDateTime = iso8601.substring(10, 24) !== cleared

  // Now in Timezone
  const dateNow = specificNow ? specificNow : new Date(Date.now())
  const now = cd(dateNow)
  const today = now.format(dateFormat)
  const yesterday = now.add(-1, 'day').format(dateFormat)
  const tommorrow = now.add(1, 'day').format(dateFormat)

  // UTC to Timezone
  const utcOffset = -(dateNow.getTimezoneOffset())
  const target = cd(iso8601).utcOffset(utcOffset)
  const targetUnix = target.format(unixFormat)
  const targetDate = target.format(dateFormat)

  // When today, yesterday or tommorow
  switch (targetDate) {
    case today:
      return `Today${isDateTime ? ` ${target.format(timeFormat)}` : ''}`
    case yesterday:
      return `Yesterday${isDateTime ? ` ${target.format(timeFormat)}` : ''}`
    case tommorrow:
      return `Tomorrow${isDateTime ? ` ${target.format(timeFormat)}` : ''}`
  }

  const targetWeekName = target.format(isDateTime ? `${weekNameFormat} ${timeFormat}` : weekNameFormat)
  const targetDateTime = target.format(isDateTime ? `${dateFormat} ${timeFormat}` : dateFormat)

  // When last week
  const lastWeekStartUnix = now.add(-1, 'week').startOf('week').format(unixFormat)
  const lastWeekEndUnix = now.add(-1, 'week').endOf('week').format(unixFormat)
  if (lastWeekStartUnix <= targetUnix && targetUnix <= lastWeekEndUnix) {
    return `Last ${targetWeekName}`
  }

  // When this week
  const thisWeekStartUnix = now.startOf('week').format(unixFormat)
  const thisWeekEndUnix = now.endOf('week').format(unixFormat)
  if (thisWeekStartUnix <= targetUnix && targetUnix <= thisWeekEndUnix) {
    return targetWeekName
  }

  // When next week
  const nextWeekStartUnix = now.add(1, 'week').startOf('week').format(unixFormat)
  const nextWeekEndUnix = now.add(1, 'week').endOf('week').format(unixFormat)
  if (nextWeekStartUnix <= targetUnix && targetUnix <= nextWeekEndUnix) {
    return `Next ${targetWeekName}`
  }

  // When past than last week or future from next week
  return targetDateTime
}

interface Options {
  lang: string
}

interface CDateSchedule extends cdate.CDateFormat {
  schedule(): string
  scheduleFn(): scheduleFn
}

type scheduleFn = (dt?: string | number | Date) => CDateSchedule

export const plugin: cdate.Plugin<CDateSchedule> = (Parent) => {
  return class SchedulePlugin extends Parent implements CDateSchedule {
    // locale(lang: string) {
    //   // @ts-ignore
    //   this.x.lang = lang
    //   return super.locale(lang)
    // }

    schedule() {
      const out = this.inherit()
      // @ts-ignore
      //const lang = this.x.lang
      return format(this.cdateFn(), out.toDate().toString())
    }

    scheduleFn() {
      return this.cdateFn() as unknown as scheduleFn
    }
  }
}
