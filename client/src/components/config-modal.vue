<script setup>
import {defineProps, defineEmits, ref} from "vue";
import {onClickOutside} from '@vueuse/core'
import SelectorAlerts from "@/components/selector-alerts.vue";
import SelectorTg from "@/components/selector-tg.vue";
import {ElMessage} from "element-plus";
import {getConfigAlert, saveConfigAlert} from "@/httpReq.ts";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["modal-close"]);

const target = ref(null)
onClickOutside(target, () => emit('modal-close'))

getConfigAlert()

const saveData = async () => {

  const save = await saveConfigAlert()

  if (save) {
    ElMessage({
      showClose: false,
      message: 'Данные успешно сохранены',
      customClass: 'alerts-message',
      type: 'success',
    })
  } else {
    ElMessage({
      showClose: false,
      message: 'При сохранение произошла ошибка',
      customClass: 'alerts-message',
      type: 'error',
    })
  }
}


</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">

        <div class="modal-header">
          <h1 class="title">Настройка уведомлений при ошибках</h1>
          <el-icon :size="32" @click.stop="emit('modal-close')">
            <Close/>
          </el-icon>
        </div>

        <div class="modal-body">
          <selector-tg/>
          <div class="selectors-block">
            <p class="selector-title">Уведомления</p>
            <selector-alerts/>
          </div>
        </div>

        <div class="modal-footer">
          <p class="footer-text">Для активации бота, найдите @dublimator_pane и напишите /start </p>
          <a class="button" @click="saveData">
            <span class="save">Сохранить</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.button {
  cursor: pointer;
}

.modal-mask {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
  max-width: 1000px;
  margin: 150px auto;
  padding: 32px 48px;
  background-color: #2D2D2D;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.modal-header {
  display: flex;
  justify-content: space-between;
}

.title {
  font-size: 24px;
  margin: 0;
  color: #14A76C;
}

.modal-body {
  display: flex;
  justify-content: space-between;
}

.selector-title {
  font-size: 16px;
  margin-bottom: 16px;
}

.selectors-block {
  margin-top: 32px;
}


.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-top: 32px;
}

.footer-text {
  font-size: 14px;
  max-width: 512px;
}

.save {
  background-color: #2D2D2D;
  border-radius: 10px;
  width: 256px;
  height: 48px;
  color: #14A76C;
  font-size: 16px;
  border: 2px solid #14A76C;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

}

.save:hover {
  background-color: #14A76C;
  color: #2D2D2D;
}

</style>