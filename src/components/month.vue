<style scoped lang="sass">
@import "style/main";
.month-wrap {
  vertical-align: top;
  display: inline-block;
  font-size: 0;
}
.month-inner {
  display: inline-block;
  line-height: .78;
  font-size: 14px;
  color: #ffffff;
}
</style>

<template>
<div class="month-wrap">
  <span class="month-inner">{{monthName}}</span>
</div>
</template>

<script>
import { MONTH_NAMES } from './constant'

export default {
  props: ['monthNum'],
  computed: {
    monthName() {
      return MONTH_NAMES[this.monthNum - 1]
    },
  },
}
</script>
