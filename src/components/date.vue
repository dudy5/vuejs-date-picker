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
    visibility: visible;
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
    :value="date || dateForClose"
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
        //比较难处理的一个问题,因为input在渲染时picker是还没有的,所以读取this.picker就会报错,所以就会进行this.isCreated判断,这样input渲染时是没问题了,但在picker关闭后,由于this.isCreated值会被再次取反为false,reactive机制,就会引起date的变化,返回空,我的解决办法就是用dateForClose在关闭时临时存储下这个值
        dateForClose: '',
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
        if (!this.isCreated) {
          if (!this.dateForClose) {
            if (this.value) {
              return this.value
            } else {
              return ''
            }
          } else {
            return ''
          }
        }
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
              value: inputVM.dateForClose || inputVM.value,
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
        this.dateForClose = ''
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
      closeCallback(evt) {
        this.pickerWrapper.$destroy()
        this.isCreated = false
        this.dateForClose = evt.date
        this.$emit('close', {
          date: evt.date,
          isChanged: evt.isChanged,
        })
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
      pickerDestroyedCallback(evt) {
        this.dateForClose = evt.date
        this.$emit('picker-destroyed', {
          date: evt.date,
          isChanged: evt.isChanged,
        })
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
