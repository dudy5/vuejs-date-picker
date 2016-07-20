<style scoped lang="sass">
@import "style/main";
.year-wrap {
  vertical-align: top;
  display: inline-block;
  font-size: 0;
}
.year-inner {
  display: inline-block;
  line-height: .78;
  font-size: 14px;
  color: #ffffff;
}
</style>

<template>
<div class="year-wrap">
  <span class="year-inner">{{year}}</span>
</div>
</template>

<script>
export default {
  props: ['year'],
}
</script>
