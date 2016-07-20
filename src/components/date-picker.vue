<style scoped lang="sass">
@import "style/main";
.date-picker {
  z-index: 10000;
  width: 250px;
  border-radius: 2px;
  font-size: 0;
  &.arrow-flip {
    .date-picker-header {
      &:before {
        z-index: 2;
        position: absolute;
        left: 50%;
        top: 100%;
        transform: rotateZ(135deg);
        margin-top: -2px;
        margin-left: -2px;
        border-width: 0;
        width: 8px;
        height: 8px;
        box-shadow: 0 4px 0 0 #ffffff, -4px 0 0 0 #ffffff, 0 0 4px 0 rgba(0, 0, 0, 0.13);
        background-color: #ffffff;
      }
    }
  }
  &:before {
    content: '';
    z-index: -1;
    position: absolute;
    left: 0;
    right: 0;
    top: 4px;
    bottom: 0;
    box-shadow: 0 0 4px 0 rgba(0,0,0,.13);
  }
}
.date-picker-header {
  margin-top: 4px;
  padding-bottom: 7px;
  padding-left: 8px;
  padding-right: 8px;
  text-align: center;
  font-size: 0;
  background-color: #96b19c;
  &::before {
    content: '';
    position: relative;
    top: -4px;
    margin-bottom: -4px;
    margin-left: auto;
    margin-right: auto;
    width:0;
    height: 0;
    border: 4px solid transparent;
    border-top-width: 0;
    border-bottom-color: #96b19c;
    display: block;
  }
  .year,
  .month {
    margin-top: 14px;
    margin-bottom: 14px;
  }
  .year {
    margin-left: 6px;
  }
}
.btn-switch {
  margin-top: 5px - 1px;
  margin-bottom: 5px - 1px;
  width: 5px + 10px;
  height: 10px + 20px;
  display: flex;
  padding: 0;
  cursor: pointer;
  border-width: 0;
  background-color: transparent;
  &:before {
    content: '';
    margin-top: auto;
    margin-bottom: auto;
    border-width: 5px;
    border-style: solid;
    display: block;
    border-color: #ffffff;
    border-top-color: transparent;
    border-bottom-color: transparent;
  }
}
.btn-switch-left {
  float: left;
  &:before {
    margin-right: auto;
    border-left-width: 0;
    border-left-color: transparent;
  }
}
.btn-switch-right {
  float: right;
  &:before {
    margin-left: auto;
    border-right-width: 0;
    border-right-color: transparent;
  }
}
.date-picker-main,
.date-picker-footer {
  background-color: #ffffff;
}
</style>

<template>
<div class="date-picker"
  v-el:el
  v-if="isWillOpen || isOpen"
  v-position="[isOpen, isOverScreen]"
>
  <div class="date-picker-header">
    <span class="btn-switch btn-switch-left" @click.stop="dcreaseMonth"></span>
    <span class="btn-switch btn-switch-right" @click.stop="increaseMonth"></span>
    <month class="month" :month-num="monthNum"></month>
    <year class="year" :year="year"></year>
    <week class="week-list"></week>
  </div>
  <day class="date-picker-main"
    :month-num="monthNum"
    :year="year"
    :day="day"
    @day-updated-by-click="dayUpdatedByClick"
  ></day>
  <time class="date-picker-footer"
    v-if="type === 'datetime'"
    :hour="hour"
    :minute="minute"
    @time-updated-by-time-input-box="timeUpdatedByTimeInputBox"
  ></time>
</div>
</template>

<script>
import $ from 'jquery'
import Tether from 'tether'
import Month from './month.vue'
import Year from './year.vue'
import Week from './week.vue'
import Day from './day.vue'
import Time from './time.vue'
import { MONTH_NAMES } from './constant'

const defaultDate = () => {
  const newDate = new Date()
  return {
    year: newDate.getFullYear(),
    monthNum: newDate.getMonth() + 1,
    day: newDate.getDate(),
    hour: newDate.getHours(),
    minute: newDate.getMinutes(),
  }
}

export default {
  props: {
    value: String,
    type: String,
    target: [HTMLElement, String],
    formatDate: String,
    formatDatetime: String,
  },
  data() {
    return {
      isOpen: false,
      isClose: true,
      isWillClose: false,
      isWillOpen: false,

      showDateChangeable: false,
      showDateIsChanged: false,
      year: defaultDate().year,
      monthNum: defaultDate().monthNum,
      day: defaultDate().day,
      hour: defaultDate().hour,
      minute: defaultDate().minute,
      showDate: '',
      isOverScreen: false,
      overScreenSide: null,
    }
  },
  computed: {
    format() {
      if (this.type === 'date') {
        if (this.formatDate) {
          return this.formatDate
        } else {
          return 'YYYY-MM-DD'
        }
      } else if (this.type === 'datetime') {
        if (this.formatDatetime) {
          return this.formatDatetime
        } else {
          return 'YYYY-MM-DD HH:mm'
        }
      }
    },
    monthName() {
      return MONTH_NAMES[this.monthNum - 1]
    },
    shortMonthName() {
      const nameArr = Array.from(MONTH_NAMES[this.monthNum - 1])
      nameArr.splice(3, nameArr.length - 3)
      return nameArr.join('')
    },
    dateOfNoTime() {
      if ([this.year, this.monthNum, this.day].indexOf('') > -1) return ''
      return `${this.year}-${this.numToTwoPlace(this.monthNum)}-${this.numToTwoPlace(this.day)}`
    },
    dateOfHasTime() {
      if ([this.year, this.monthNum, this.day, this.hour, this.minute].indexOf('') > -1) return ''
      return `${this.year}-${this.numToTwoPlace(this.monthNum)}-${this.numToTwoPlace(this.day)}` +
              ` ${this.numToTwoPlace(this.hour)}:${this.numToTwoPlace(this.minute)}`
    },
  },
  methods: {
    open() {
      if (this.isOpen) return
      this.isWillOpen = true
      this.$emit('will-open')
      this.$nextTick(() => {
        this.isWillOpen = false
        this.isClose = false
        this.isOpen = true
        this.$emit('open')
      })
    },
    close() {
      if (this.isClose) return
      this.isWillClose = true
      this.$emit('will-close', {
        date: this.showDate,
        isChanged: this.showDateIsChanged,
      })
      this.isOpen = false
      this.$nextTick(() => {
        this.isWillClose = false
        this.isClose = true
        this.$emit('close', {
          date: this.showDate,
          isChanged: this.showDateIsChanged,
        })
      })
    },
    flipIfIsOverScreen() {
      const pageHeight = window.innerHeight
      const pageWidth = window.innerWidth
      if (this.$els.el.getBoundingClientRect().bottom >= pageHeight) {
        this.isOverScreen = true
        this.overScreenSide = 'bottom'
        this.$emit('flip')
      }
      if (this.$els.el.getBoundingClientRect().left < 0) {
        this.isOverScreen = true
        this.overScreenSide = 'left'
        this.$emit('flip')
      }
      if (this.$els.el.getBoundingClientRect().right > pageWidth) {
        this.isOverScreen = true
        this.overScreenSide = 'right'
        this.$emit('flip')
      }
    },

    increaseYear() {
      this.year++
    },
    dcreaseYear() {
      this.year--
    },

    increaseMonth() {
      this.$emit('date-will-change', this.$data)
      if (this.monthNum !== 12) {
        this.monthNum = Math.min(this.monthNum + 1, 12)
      } else if (this.monthNum === 12) {
        this.monthNum = 1
        this.increaseYear()
      }
      this.$emit('date-change', this.$data)
      if (this.showDateChangeable) {
        this.setShowDate()
        this.$emit('show-date-change', this.showDate)
      }
    },
    dcreaseMonth() {
      this.$emit('date-will-change', this.$data)
      if (this.monthNum !== 1) {
        this.monthNum = Math.max(this.monthNum - 1, 1)
      } else if (this.monthNum === 1) {
        this.monthNum = 12
        this.dcreaseYear()
      }
      this.$emit('date-change', this.$data)
      if (this.showDateChangeable) {
        this.setShowDate()
        this.$emit('show-date-change', this.showDate)
      }
    },
    timeUpdatedByTimeInputBox(evt) {
      this.$emit('date-will-change', this.$data)
      if (evt.type === 'hour') {
        this.hour = evt.value
      } else if (evt.type === 'minute') {
        this.minute = evt.value
      }
      this.$emit('date-change', this.$data)
      if (this.showDateChangeable) {
        this.setShowDate()
        this.$emit('show-date-change', this.showDate)
      }
    },
    dayUpdatedByClick(evt) {
      this.$emit('date-will-change', this.$data)
      this.day = evt.day
      this.year = evt.year
      this.monthNum = evt.monthNum
      if (!this.showDateChangeable && !this.showDateIsChanged) {
        this.showDateChangeable = true
      }
      this.$emit('date-change', this.$data)
      this.setShowDate()
      this.$emit('show-date-change', this.showDate)
      if (this.type === 'date') {
        this.close()
      }
    },

    onKeyup(evt) {
      this.$emit('date-will-change', this.$data)
      const val = evt.target.value
      if (!(this.isCorrectFormatDate(val))) return
      const date = this.getDate(val)
      this.year = date.year()
      this.monthNum = date.month()
      this.day = date.day()
      this.hour = date.hour()
      this.minute = date.minute()
      if (!this.showDateChangeable && !this.showDateIsChanged) {
        this.showDateChangeable = true
      }
      this.$emit('date-change', this.$data)
      this.setShowDate()
      this.$emit('show-date-change', this.showDate)
    },

    initDate() {
      this.initYear()
      this.initMonthNum()
      this.initDay()
      this.initHour()
      this.initMinute()
      this.$emit('date-change', this.$data)
    },
    initYear() {
      this.year = this.getDate(this.value).year()
    },
    initMonthNum() {
      this.monthNum = this.getDate(this.value).month()
    },
    initDay() {
      this.day = this.getDate(this.value).day()
    },
    initHour() {
      this.hour = this.getDate(this.value).hour()
    },
    initMinute() {
      this.minute = this.getDate(this.value).minute()
    },

    numToTwoPlace(val) {
      return val.toString().length === 2 ? val.toString() : `0${val}`
    },
    getDate(value) {
      const self = this
      const date = self.isCorrectFormatDate(value) ? new Date(value.replace(/-/g, '/')) : ''
      return {
        year() {
          if (date) {
            return date.getFullYear()
          }
          if (!self.isDefaultDate) {
            self.isDefaultDate = true
          }
          return defaultDate().year
        },
        month() {
          if (date) {
            return date.getMonth() + 1
          }
          if (!self.isDefaultDate) {
            self.isDefaultDate = true
          }
          return defaultDate().monthNum
        },
        day() {
          if (date) {
            return date.getDate()
          }
          if (!self.isDefaultDate) {
            self.isDefaultDate = true
          }
          return defaultDate().day
        },
        hour() {
          if (date) {
            return date.getHours()
          }
          if (!self.isDefaultDate) {
            self.isDefaultDate = true
          }
          return defaultDate().hour
        },
        minute() {
          if (date) {
            return date.getMinutes()
          }
          if (!self.isDefaultDate) {
            self.isDefaultDate = true
          }
          return defaultDate().minute
        },
      }
    },
    isCorrectFormatDate(val) {
      if (typeof val === 'undefined' || val === null) {
        return false
      }
      const s = /^\d{4}-\d{2}-\d{2}$/
      const l = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/
      if (!((val.match(s) !== null) || (l.exec(val) !== null))) {
        return false
      }
      if (new Date(val.replace(/-/g, '/')).toString() === 'Invalid Date') {
        return false
      }
      return true
    },
    setToDefaultDateIfNeeded() {
      let arr
      if (this.type === 'datetime') {
        arr = [{ year: this.year }, { monthNum: this.monthNum }, { day: this.day },
          { hour: this.hour }, { minute: this.minute }]
      } else if (this.type === 'date') {
        arr = [{ year: this.year }, { day: this.day }, { monthNum: this.monthNum }]
      } else {
        arr = [{ year: this.year }, { day: this.day }, { monthNum: this.monthNum }]
      }
      arr.forEach((val) => {
        if (Object.values(val)[0] === '') {
          this[Object.keys(val)[0]] = defaultDate()[Object.keys(val)[0]]
        }
      })
    },
    setShowDate(date = null) {
      if (date) {
        this.showDate = date
        this.showDateChangeable = true
      } else if (!this.showDateChangeable && this.isDefaultDate) {
        this.showDate = ''
      } else if (this.type === 'datetime') {
        this.showDate = this.dateOfHasTime
        this.showDateChangeable = true
      } else if (this.type === 'date') {
        this.showDate = this.dateOfNoTime
        this.showDateChangeable = true
      } else {
        this.showDate = this.dateOfNoTime
        this.showDateChangeable = true
      }
    },
  },
  events: {
    'date-will-change'() {
      if (this.isDefaultDate) {
        this.isDefaultDate = false
      }
    },
    'show-date-change'() {
      this.setToDefaultDateIfNeeded()
      this.showDateIsChanged = true
    },
  },

  ready() {
    this.initDate()
    this.setShowDate()
  },
  beforeDestroy() {
    const date = this.showDate
    this.$emit('will-destroy', {
      date,
      isChanged: this.showDateIsChanged,
    })
  },
  destroyed() {
    this.$emit('destroyed')
  },
  directives: {
    position: {
      update([isOpen, isOverScreen]) {
        if (!this.vm.target) return
        if (!isOpen) return
        if (!isOverScreen) {
          new Tether({
            element: this.el,
            target: this.vm.target,
            attachment: 'top middle',
            targetAttachment: 'bottom middle',
            targetOffset: '15px 0',
          })
          $(this.el).removeClass('arrow-flip')
          this.vm.flipIfIsOverScreen()
        } else {
          if (this.vm.overScreenSide === 'bottom') {
            new Tether({
              element: this.el,
              target: this.vm.target,
              attachment: 'bottom middle',
              targetAttachment: 'top middle',
              targetOffset: '-15px 0',
            })
            $(this.el).addClass('arrow-flip')
          } else if (this.vm.overScreenSide === 'left') {
            new Tether({
              element: this.el,
              target: this.vm.target,
              attachment: 'top left',
              targetAttachment: 'bottom left',
              targetOffset: '15px 0',
            })
          } else if (this.vm.overScreenSide === 'right') {
            new Tether({
              element: this.el,
              target: this.vm.target,
              attachment: 'top right',
              targetAttachment: 'bottom right',
              targetOffset: '15px 0',
            })
          }
        }
      },
    },
  },
  components: {
    Month,
    Year,
    Week,
    Day,
    Time,
  },
}
</script>
