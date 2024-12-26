<script setup lang="ts">
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css';
import {getConfigAlert, getTelegram, testMessage, updateTelegram} from "@/httpReq.ts";
import {ref} from "vue";

const chatId = ref(getTelegram())

const confirmTG = async () => {

  const update = await updateTelegram(chatId.value)

  if (update) {
    ElMessage({
      showClose: false,
      customClass: 'alerts-message',
      message: 'Телеграм успешно сохранен',
      type: 'success',
    })
  } else {
    ElMessage({
      showClose: false,
      customClass: 'alerts-message',
      message: 'При сохранение произошла ошибка',
      type: 'error',
    })
  }
}

const testMessageTG = async () => {

  const test = await testMessage()
  if (test) {
    ElMessage({
      showClose: false,
      message: 'Сообщение успешно отправлено',
      customClass: 'alerts-message',
      type: 'success',
    })
  } else {
    ElMessage({
      showClose: false,
      message: 'При отправке произошла ошибка',
      customClass: 'alerts-message',
      type: 'error',
    })
  }

}

</script>

<template>
  <div class="input-block">
    <p class="input-title">Укажите ChatId куда будут приходить сообщения об ошибках. <br>
      Получить ChatId можно использовав команду /getChatId <br>
      в том чате где добавлен бот или в лс</p>
    <input class="input-tg" v-model="chatId" placeholder="ChatId" type="text"/>
    <div class="buttons-tg">
      <a class="button confirm" @click="confirmTG">
        <span>Подтвердить</span>
      </a>
      <a class="button test" @click="testMessageTG">
        <span>Тестовое сообщение</span>
      </a>
    </div>
  </div>
</template>

<style scoped>

.button {
  cursor: pointer;
}

.input-block {
  margin-top: 32px;
  max-width: 512px;
  display: flex;
  flex-direction: column;
}

.input-title {
  font-size: 14px;
}

.input-tg {
  background-color: #2D2D2D;
  margin-top: 8px;
  border: 2px solid #14A76C;
  border-radius: 10px;
  height: 32px;
  font-size: 14px;
  font-family: Montserrat-SemiBold,serif;
  padding-left: 14px;
  outline: 0;
  outline-offset: 0;
  color: #14A76C;
}

.buttons-tg {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 16px;
}

.confirm {
  background-color: #2D2D2D;
  border-radius: 10px;
  height: 32px;
  width: 100%;
  color: #14A76C;
  font-size: 16px;
  border: 2px solid #14A76C;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  margin-right: 14px;
}

.confirm:hover {
  background-color: #14A76C;
  color: #2D2D2D;
}

.test {
  background-color: #2D2D2D;
  border-radius: 10px;
  height: 32px;
  width: 100%;
  color: #FFE400;
  font-size: 16px;
  border: 2px solid #FFE400;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

}

.test:hover {
  background-color: #FFE400;
  color: #2D2D2D;
}
</style>