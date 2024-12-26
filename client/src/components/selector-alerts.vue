<script setup lang="ts">
import {ref} from "vue";
import {getAlerts, getConfigAlert, updateAlerts} from "@/httpReq.ts";



const stoppedContainer = ref()
const upperRam = ref()
let upperRamPercent = ref()
const upperCpu = ref()
let upperCpuPercent = ref()
const upperStorage = ref()
let upperStoragePercent = ref()

const alerts = getAlerts()

if (alerts != null) {
  stoppedContainer.value = alerts.containerStopped.condition

  upperRam.value = alerts.ram.condition
  upperRamPercent.value = alerts.ram.percent

  upperCpu.value = alerts.cpu.condition
  upperCpuPercent.value = alerts.cpu.percent

  upperStorage.value = alerts.storage.condition
  upperStoragePercent.value = alerts.storage.percent
}



const saveAlerts = () => {
  const newAlerts = {
    "containerStopped": {
      "condition": stoppedContainer.value
    },
    "ram": {
      "condition": upperRam.value,
          "percent": upperRamPercent.value
    },
    "cpu": {
      "condition": upperCpu.value,
          "percent": upperCpuPercent.value
    },
    "storage": {
      "condition": upperStorage.value,
          "percent": upperStoragePercent.value
    },
  }

  updateAlerts(newAlerts)
}

const handleInput = () => {
  saveAlerts();
};

</script>


<template>
  <div class="alert-select" :class="{'green-text': stoppedContainer}">
    <el-switch
        v-model="stoppedContainer"
        class="ml-2"
        style="--el-switch-on-color: #14A76C; --el-switch-off-color: #747474; margin-right: 8px"
        size="large"
        @click="saveAlerts"
    />
    <p class="text-select">Контейнер остановлен</p>
  </div>

  <div class="alert-select" :class="{'green-text': upperRam}">
    <el-switch
        v-model="upperRam"
        class="ml-2"
        style="--el-switch-on-color: #14A76C; --el-switch-off-color: #747474; margin-right: 8px"
        size="large"
        @click="saveAlerts"
    />
    <p class="text-select">Превышение RAM
      <input class="input"
             :class="{'input-percent-enable': upperRam, 'input-percent-disable' : !upperRam} "
             v-model="upperRamPercent"
             placeholder="80"
             type="number"
             max="100"
             min="1"
             pattern="[0-9]*"
             @input="handleInput"
      /> %
    </p>

  </div>
  <div class="alert-select" :class="{'green-text': upperCpu}">
    <el-switch
        v-model="upperCpu"
        class="ml-2"
        style="--el-switch-on-color: #14A76C; --el-switch-off-color: #747474; margin-right: 8px"
        size="large"
        @click="saveAlerts"
    />
    <p class="text-select">Нагрузка CPU больше
      <input class="input"
             :class="{'input-percent-enable': upperCpu, 'input-percent-disable' : !upperCpu}"
             v-model="upperCpuPercent"
             placeholder="80"
             type="number"
             max="100"
             min="1"
             @input="handleInput"
      /> %
    </p>

  </div>
  <div class="alert-select" :class="{'green-text': upperStorage}">
    <el-switch
        v-model="upperStorage"
        class="ml-2"
        style="--el-switch-on-color: #14A76C; --el-switch-off-color: #747474; margin-right: 8px"
        size="large"
        @click="saveAlerts"
    />
    <p class="text-select">Хранилище заполнено
      <input class="input"
             :class="{'input-percent-enable': upperStorage, 'input-percent-disable' : !upperStorage}"
             v-model="upperStoragePercent"
             placeholder="80"
             type="number"
             max="100"
             min="1"
             @input="handleInput"
      /> %
    </p>
  </div>

</template>

<style scoped>

.alert-select {
  display: flex;
  align-items: center;
}
.text-select {
  font-size: 16px;
  margin-right: 8px;
}

.green-text {
  color: #14A76C;
  border: #14A76C;
}

.input {
  margin-top: 8px;
  border-radius: 10px;
  background-color: #2D2D2D;
  height: 24px;
  width: 32px;
  font-size: 16px;
  font-family: Montserrat-SemiBold,serif;
  padding-left: 14px;
  outline: 0;
  outline-offset: 0;
}

.input-percent-disable {
  border: 2px solid #747474;
  color: #747474;
  user-select: none;
  pointer-events: none;
}

.input-percent-enable {
  border: 2px solid #14A76C;
  color: #14A76C;
}

</style>