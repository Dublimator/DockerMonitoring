<script setup lang="ts">

import Containers from "@/components/containers.vue";
import AlertModal from "./components/config-modal.vue";


import SystemMonitor from "@/components/system-monitor.vue";

</script>

<script lang="ts">
import {ref} from "vue";

const isModalOpened = ref(false);

export const openModal = () => {
  isModalOpened.value = true;
};

const closeModal = () => {
  isModalOpened.value = false;
};

const submitHandler = ()=>{
  //here you do whatever
}

</script>

<template>
  <header>
    <h1 class="name">Dublimator Pane</h1>
  </header>

  <main>
    <system-monitor/>

    <containers/>
  </main>

  <alert-modal :isOpen="isModalOpened" @modal-close="closeModal" @submit="submitHandler" name="first-modal"/>
</template>

<style scoped>
header {
  max-width: 1200px;
  background-color: #2D2D2D;
  margin: 16px auto 32px auto ;
  border-radius: 10px;

  display: flex;
  align-items: center;
  padding: 16px 32px;
}
.name {
  margin: 0;
}
</style>
