<style lang="sass" scoped>
  @import "style/main";
  .date {
    width: 180px;
    height: 30px;
    border: 1px solid #ccc;
    padding: 0;
    text-indent: 0.6em;
    text-align: left;
    font-size: 14px;
    &:focus {
      outline: none;
    }
  }
</style>

<template>
  <input type="text"
    class="date"
    :required="required === 'required'
      || required === ''
      || (typeof required === 'boolean' && required)"
    :name="name"
    :value="date"
    v-focus="focus"
    v-blur="blur"
    v-bind-close-event="isOpen"
    @focus="onFocus"
    @blur="onBlur"
    @keyup="onKeyup"
  >
</template>

<script>
  import Vue from 'vue'
  import $ from 'jquery'
  import { focus, blur } from './directive'
  import picker from './date-picker.vue'

  export default {
    props: {
      focus: Boolean,
      blur: Boolean,
      value: String,
      type: String,
      target: [HTMLElement, String],
      name: String,
      required: [Boolean, String],
      formatDate: String,
      formatDatetime: String,
      utc: Boolean,
    },
    data() {
      return {
        pickerWrapper: null,
        isCreated: false,
        isFocus: false,
      }
    },
    computed: {
      id() {
        return this._uid
      },
      picker() {
        if (!this.isCreated) return
        return this.pickerWrapper.$refs.picker
      },
      isOpen() {
        if (!this.isCreated) return false
        return this.picker.isOpen
      },
      date() {
        if (!this.isCreated) return ''
        return this.picker.showDate
      },
    },
    methods: {
      create() {
        const inputVM = this
        let Wrapper = Vue.extend({})
        this.pickerWrapper = new Wrapper({
          template: '<picker v-ref:picker ' +
            ':value="value" ' +
            ':type="type" ' +
            ':target="target" ' +
            ':format-date="formatDate" ' +
            ':format-datetime="formatDatetime" ' +
            ':utc="utc" ' +
            '@will-open="willOpenCallback" ' +
            '@open="openCallback" ' +
            '@will-close="willCloseCallback" ' +
            '@close="closeCallback" ' +
            '@show-date-change="changeCallback" ' +
            '@flip="flipCallback" ' +
            '@will-destroy="pickerWillDestroyCallback" ' +
            '@destroyed="pickerDestroyedCallback" ' +
          '></picker>',
          data() {
            return {
              value: inputVM.value,
              type: inputVM.type || 'date',
              target: inputVM.target || inputVM.$el,
              formatDate: inputVM.formatDate,
              formatDatetime: inputVM.formatDatetime,
              utc: inputVM.utc
            }
          },
          methods: {
            willOpenCallback: inputVM.willOpenCallback,
            openCallback: inputVM.openCallback,
            willCloseCallback: inputVM.willCloseCallback,
            closeCallback: inputVM.closeCallback,
            changeCallback: inputVM.changeCallback,
            flipCallback: inputVM.flipCallback,
            pickerWillDestroyCallback: inputVM.pickerWillDestroyCallback,
            pickerDestroyedCallback: inputVM.pickerDestroyedCallback,
          },
          components: {
            picker,
          },
        })
        this.pickerWrapper.$mount().$appendTo('body')
        this.isCreated = true
      },
      onFocus() {
        this.isFocus = true
        if (this.isCreated) return
        this.create()
        this.picker.open()
      },
      close() {
        this.picker.close()
      },

      onBlur() {
        this.isFocus = false
      },
      onKeyup(evt) {
        return this.picker.onKeyup(evt)
      },

      willOpenCallback() {
        this.$emit('will-open')
      },
      openCallback() {
        this.$emit('open')
      },
      changeCallback(date) {
        this.$emit('change', date)
      },
      willCloseCallback(evt) {
        this.$emit('will-close', {
          date: evt.date,
          isChanged: evt.isChanged,
        })
      },
      closeCallback() {
        this.pickerWrapper.$destroy()
        this.isCreated = false
        this.$emit('close')
      },
      flipCallback() {
        this.$emit('flip')
      },
      pickerWillDestroyCallback(evt) {
        this.$emit('picker-will-destroy', {
          date: evt.date,
          isChanged: evt.isChanged,
        })
      },
      pickerDestroyedCallback() {
        this.$emit('picker-destroyed')
      },
    },
    beforeDestroy() {
      this.$emit('input-will-destroy')
    },
    destroyed() {
      this.$emit('input-destroyed')
      this.close()
      this.pickerWrapper.$destroy()
    },
    directives: {
      focus,
      blur,
      bindCloseEvent: {
        update(isOpen) {
          if (!isOpen) return
          $(document).on('click', this.handler = (evt) => {
            if (this.vm.isFocus) return
            const target = $(evt.target)
            if (target.closest(this.vm.$el).length
              || target.closest(this.vm.picker.$els.el).length) return
            this.vm.close()
            $(document).off('click', this.handler)
          })
          this.vm.$once('close', () => {
            $(document).off('click', this.handler)
          })
        },
        unbind() {
          this.vm.close()
          $(document).off('click', this.handler)
        },
      },
    },
  }
</script>
