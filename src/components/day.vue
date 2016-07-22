<style scoped lang="sass">
@import "style/main";
.day-list {
  overflow: hidden;
  @include list-unstyled();
  margin-bottom: 0;
}
.day-item {
  position: relative;
  float: left;
  width: (1 / 7) * 100%;
  padding-bottom: (1 / 7) * 100%;
  border: 0 solid #dee5ec;
  border-width: 0 1px 1px 0;
  @include list-unstyled();
  margin-bottom: 0;
  cursor: pointer;
  &.inactive {
   .day-item-inner {
     color: #beccda;
   }
  }
  &.active {
    background-color: #f6eada;
  }
  &:nth-of-type(7n) {
    border-right-width: 0;
  }
  &:nth-last-of-type(7),
  &:nth-last-of-type(7) ~ & {
    border-bottom-width: 0;
  }
}
.day-item-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #667689;
  user-select: none;
}
</style>

<template>
<ul class="day-list">
  <li class="day-item"
      v-for="dayItem in curSheet"
      :class="{
        inactive: !dayItem.isCurMonth,
        active: $index === activeIndex && year === activeYear && monthNum === activeMonth && dayItem.isCurMonth
      }"
      @click.stop="chooseDay($index, dayItem.isCurMonth, dayItem.dayValue)"
  >
    <span class="day-item-inner">{{dayItem.dayValue}}</span>
  </li>
</ul>
</template>

<script>
const moment = require('moment')
import { MONTH_NAMES } from './constant'

export default {
  props: ['monthNum', 'year', 'day'],
  computed: {
    activeIndex() {
      return this.getDayIndexOfCurSheet(this.year, this.month['month-days'],
                                        this.monthNum, this.day)
    },
    activeYear() {
      return this.year
    },
    activeMonth() {
      return this.monthNum
    },
    months() {
      const months = []
      for (const [index, monthName] of MONTH_NAMES.entries()) {
        const monthNum = index + 1
        months.push({
          'month-name': monthName,
          'month-days': (() => {
            const days = []
            const dayNum = (() => {
              if ([1, 3, 5, 7, 8, 10, 12].some((val) => monthNum === val)) {
                return 31
              } else if (monthNum === 2) {
                // 世纪年时能被400整除是闰年
                if (this.year % 400 === 0) {
                  return 29
                }
                // 非世纪年,能被4整除时也是闰年
                if (this.year % 4 === 0) {
                  return 29
                } else if (this.year % 4 !== 0) {
                  return 28
                }
              }
              return 30
            })()
            for (let i = 0; i < dayNum; i++) {
              days.push(i + 1)
            }
            return days
          })(),
        })
      }
      return months
    },
    month() {
      return this.months[this.monthNum - 1]
    },
    curSheet() {
      return this.getSheet(this.year, this.monthNum, this.month)
    },
  },
  methods: {
    getSheet(year, monthNum, month) {
      const SHEET_CELL_NUM = 42
      const indexOfFirstday = this.getFirstDayIndexOfCurSheet(year, monthNum)
      const curMonthDayNum = month['month-days'].length
      const indexOfLastday = indexOfFirstday + curMonthDayNum
      const sheet = new Array(SHEET_CELL_NUM)
      // 中间当前选中月份的日期
      for (let i = indexOfFirstday; i < indexOfFirstday + curMonthDayNum; i++) {
        sheet[i] = {
          dayValue: month['month-days'][i - indexOfFirstday],
          isCurMonth: true,
        }
      }
      // 后面那几个灰色的日期
      let nextMonthFirstDay = 1
      for (let i = indexOfLastday; i < SHEET_CELL_NUM; i++) {
        sheet[i] = {
          dayValue: nextMonthFirstDay++,
          isCurMonth: false,
        }
      }
      // 前面那几个灰色的日期
      let prevMonth
      let prevMonthLastDay
      if (monthNum !== 1) {
        prevMonth = this.months[monthNum - 2]
        prevMonthLastDay = prevMonth['month-days'][prevMonth['month-days'].length - 1]
      } else if (monthNum === 1) {
        prevMonthLastDay = 31
      }
      for (let i = indexOfFirstday - 1; i > -1; i--) {
        sheet[i] = {
          dayValue: prevMonthLastDay--,
          isCurMonth: false,
        }
      }
      return sheet
    },
    chooseDay(index, isCurMonth, day) {
      if (!isCurMonth) {
        const lastDayIndex
          = this.getLastDayIndexOfCurSheet(this.year, this.month['month-days'], this.monthNum)
        if (index > lastDayIndex) {
          if (this.monthNum !== 12) {
            this.monthNum = Math.min(this.monthNum + 1, 12)
          } else if (this.monthNum === 12) {
            this.monthNum = 1
            this.year++
          }
        } else if (index < lastDayIndex) {
          if (this.monthNum !== 1) {
            this.monthNum = Math.max(this.monthNum - 1, 1)
          } else if (this.monthNum === 1) {
            this.monthNum = 12
            this.year--
          }
        }
      }
      this.$emit('day-updated-by-click', {
        day,
        year: this.year,
        monthNum: this.monthNum,
      })
    },
    computeWeekDay(year, month, day) {
      const weekDay = moment({ y: year, M: month - 1, d: day }).day()
      return (weekDay === 0) ? 7 : weekDay
    },
    getDayIndexOfMonth(month, day) {
      return month.indexOf(day)
    },
    getFirstDayIndexOfCurSheet(year, monthNum) {
      const weekDay = this.computeWeekDay(year, monthNum, 1)
      return [7, 1, 2, 3, 4, 5, 6].indexOf(weekDay)
    },
    getLastDayIndexOfCurSheet(year, month, monthNum) {
      return this.getDayIndexOfCurSheet(year, month, monthNum, month[month.length - 1])
    },
    getDayIndexOfCurSheet(year, month, monthNum, day) {
      return this.getFirstDayIndexOfCurSheet(year, monthNum) + this.getDayIndexOfMonth(month, day)
    },
  },
}
</script>
