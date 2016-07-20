<style scoped lang="sass">
@import "style/main";
.week-list {
  clear: both;
  margin-left: -8px;
  margin-right: -8px;
  width: auto;
  @include clearfix()
}
.week-item {
  float: left;
  width: 1 / 7 * 100%;
  border-bottom-width: 0;
  text-align: center;
  line-height: .78;
  font-size: 12px;
  color: #ffffff;
}
</style>

<template>
<div class="week-list">
  <abbr class="week-item" title="Sunday">Sun</abbr>
  <abbr class="week-item" title="Monday">Mon</abbr>
  <abbr class="week-item" title="Tuesday">Tue</abbr>
  <abbr class="week-item" title="Wednesday">Wed</abbr>
  <abbr class="week-item" title="Thursday">Thu</abbr>
  <abbr class="week-item" title="Friday">Fri</abbr>
  <abbr class="week-item" title="Saturday">Sat</abbr>
</div>
</template>

<script>
export default {}
</script>
