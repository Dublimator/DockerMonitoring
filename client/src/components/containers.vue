<script setup lang="ts">

// Функция для выполнения GET запроса
import axios from "axios";
import {ref} from "vue";
import {URL_API} from "../../config.ts";

const res = ref()

async function fetchData() {
  try {
    res.value = (await axios.get(URL_API + "/metrics")).data
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
  }
}

// Устанавливаем интервал для выполнения fetchData каждые 3 секунды (3000 миллисекунд)
setInterval(fetchData, 1000);



</script>

<template>
  <div v-for="container in res">
    <div class="stopped" v-if="container?.state == 'exited'">
      <div class="content">
        <div class="info size150">
          <p class="name">CONTAINER ID</p>
          <p class="stopped-data">{{(container.id).slice(0,12)}}</p>
        </div>
        <div class="info size304">
          <p class="name">NAME</p>
          <p class="stopped-data">{{(container.name).slice(1)}}</p>
        </div>
        <p class="stopped-title">Контейнер остановлен</p>
      </div>
    </div>

    <div class="running" v-if="container?.state == 'running'">
      <div class="content">
        <div class="info size150">
          <p class="name">CONTAINER ID</p>
          <p class="data">{{(container.id).slice(0,12)}}</p>
        </div>
        <div class="info size304">
          <p class="name">NAME</p>
          <p class="data">{{(container.name).slice(1)}}</p>
        </div>
        <div class="info size60">
          <p class="name">CPU %</p>
          <p class="data">{{container.cpuPercent}}%</p>
        </div>
        <div class="info size304">
          <p class="name">MEM USAGE / LIMIT</p>
          <p class="data">{{container.memory.usage}} MB / {{container.memory.limit}} MB</p>
        </div>
        <div class="info size150">
          <p class="name">UPTIME</p>
          <p class="data">{{container.uptime}}</p>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>

.content {
  display: flex;
  justify-content: space-between;

  margin: 16px 32px;
  align-items: center;

}

.running {
  max-width: 1200px;
  background-color: #2D2D2D;
  border-radius: 10px;
  margin-top: 32px;
  margin-inline: auto;
  border: 2px solid #2D2D2D;
}

.stopped {
  max-width: 1200px;
  background-color: #2D2D2D;
  border-radius: 10px;
  margin-top: 32px;
  margin-inline: auto;
  border: 2px solid #FF652F;
}

.stopped-data {
  font-size: 20px;
  color: #FF652F;
}

.size150 {
  min-width: 150px;
}
.size304 {
  min-width: 304px;
}
.size60 {
  min-width: 60px;
}

.info {
  display: flex;
  flex-direction: column;
  margin-right: 8px;

}

.name {
  font-size: 14px;
}

.data {
  font-size: 16px;
  color: #14A76C;
}

.stopped-title {
  color: #FF652F;
  font-size: 24px;
  margin-right: 32px;
}

</style>