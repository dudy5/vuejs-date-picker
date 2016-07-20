<style scoped lang="sass">
@import "style/main";
.time-wrap {
  border-top: 1px solid #dee5ec;
  height: 35px;
  text-align: center;
  font-size: 0;
  &::before{
    content: '';
    vertical-align: middle;
    display: inline-block;
    height: 100%;
    width: 0;
    overflow: hidden;
  }
}
.time-inner {
  vertical-align: middle;
  display: inline-block;
  .item-hour,
  .colon,
  .item-minute {
    vertical-align: top;
    display: inline-block;
    height: 16px;
    line-height: 16px;
    font-size: 14px;
  }
  .item-hour,
  .item-minute {
    width: 22px;
    padding: 0;
    border-width: 0;
    text-align: center;
    appearance: none;
    background-color: transparent;
    color: transparent;
    text-shadow : 0 0 0 #667689;
    &:focus {
      outline: none;
      background-color: #f6eada;
    }
    &::selection {
      background-color: transparent;
    }
  }
  .colon {
    margin-left: 8px;
    margin-right: 8px;
    color: #667689;
  }
}
</style>

<template>
<div class="time-wrap">
  <div class="time-inner">
    <input type="text" class="item-hour" maxlength="2"
           v-model="vmHour"
           v-selection
           v-focus="focusing === 'item-hour'"
           @keyup="keyup"
           @click.stop="click"
    >
    <span class="colon">:</span>
    <input type="text" class="item-minute" maxlength="2"
           v-model="vmMinute"
           v-selection
           v-focus="focusing === 'item-minute'"
           @keyup="keyup"
           @click.stop="click"
    >
  </div>
</div>
</template>

<script>
import { focus, blur, selection } from './directive'

export default {
  props: ['hour', 'minute'],
  data() {
    return {
      focusing: null,
      focusingIndex: 0,
    }
  },
  computed: {
    vmHour: {
      get() {
        return this.hour.toString().length === 2 ? this.hour.toString() : `0${this.hour}`
      },
      set(value) {
        this.$emit('time-updated-by-time-input-box', {
          value,
          type: 'hour',
        })
      },
    },
    vmMinute: {
      get() {
        return this.minute.toString().length === 2 ? this.minute.toString() : `0${this.minute}`
      },
      set(value) {
        this.$emit('time-updated-by-time-input-box', {
          value,
          type: 'minute',
        })
      },
    },
  },
  methods: {
    keyup(evt) {
      if (evt.target.value.length >= 2) {
        if (this.focusingIndex === 1) {
          this.focusingIndex = -1
        }
        this.focusing = ['item-hour', 'item-minute'][++this.focusingIndex]
      }
    },
    click(evt) {
      const className = evt.target.className
      this.focusing = className
      if (className === 'item-hour') {
        this.focusingIndex = 0
      } else if (className === 'item-minute') {
        this.focusingIndex = 1
      }
    },
  },
  directives: {
    focus,
    blur,
    selection,
  },
}
</script>
