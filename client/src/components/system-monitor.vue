<script setup lang="ts">

import {ref} from "vue";
import "vue3-circle-progress/dist/circle-progress.css";
import CircleProgress from "vue3-circle-progress";
import axios from "axios";
import {SERVER_NAME, URL_API} from "../../config.ts";

import {openModal} from "../App.vue"

const name = SERVER_NAME


const loadsPercent = ref()
const res = ref()

async function fetchData() {
  try {
    const response = (await axios.get(URL_API + "/server")).data

    loadsPercent.value = {
      cpu: response.cpu.percent,
      ram: response.ram.used / response.ram.total * 100,
      storage: response.storage.used / response.storage.total * 100
    }

    res.value = response

  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
  }
}

// Устанавливаем интервал для выполнения fetchData каждые 3 секунды (3000 миллисекунд)
setInterval(fetchData, 1000);


</script>

<template>
  <div class="system">
    <header class="header">
      <div class="main-info">
        <p class="name">{{ name }}</p>
        <p v-if="res" class="uptime">Uptime: {{ Math.ceil(res.uptime / 60**2) + " h"}}</p>
      </div>
      <a class="button" @click="openModal">
        <span class="alert">Уведомления</span>
      </a>
    </header>
    <div class="bars">

      <!--  Load CPU  -->
      <div v-if="res" class="progress-bar">
        <circle-progress
            class="progress"
            :percent="loadsPercent.cpu"
            fill-color="#14A76C"
            :border-bg-width="5"
            :border-width="5"
            empty-color="#747474"
        />
        <div class="progress-text">
          <p>CPU</p>
          <p class="load">{{ loadsPercent.cpu }}%</p>
        </div>
      </div>

      <!--  Load RAM  -->
      <div v-if="res" class="progress-bar">
        <circle-progress
            class="progress"
            :percent="loadsPercent.ram"
            fill-color="#14A76C"
            :border-bg-width="5"
            :border-width="5"
            empty-color="#747474"
        />
        <div class="progress-text">
          <p>RAM</p>
          <p class="load">{{ Math.ceil(res.ram.total / 1024 ** 2) + " MB" }} /
            {{ Math.ceil(res.ram.used / 1024 ** 2) + " MB" }}</p>
        </div>
      </div>

      <!--  Load STORAGE  -->
      <div v-if="res" class="progress-bar">
        <circle-progress
            class="progress"
            :percent="loadsPercent.storage"
            fill-color="#14A76C"
            :border-bg-width="5"
            :border-width="5"
            empty-color="#747474"
        />
        <div class="progress-text">
          <p>STORAGE</p>
          <p class="load">{{ Math.ceil(res.storage.total / 1024 ** 3) + " GB" }} /
            {{ Math.ceil(res.storage.used / 1024 ** 3) + " GB" }}</p>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.button {
  cursor: pointer;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-inline: 32px;
}

.system {
  background-color: #2D2D2D;
  max-width: 1200px;
  border-radius: 10px;

  margin-inline: auto;
}

.main-info {
  margin-top: 32px;
}

.name {
  font-size: 24px;
  color: #14A76C;
}

.uptime {
  font-size: 16px;
}

.alert {
  background-color: #2D2D2D;
  border-radius: 10px;
  margin-top: 32px;
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

.alert:hover {
  background-color: #14A76C;
  color: #2D2D2D;
}

.progress-bar {
  display: flex;
  flex-direction: column;
  max-width: 180px;

}


.progress-text {
  transform: translateY(-110px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.bars {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin-top: 32px;
  margin-inline: 32px;
}

</style>