<script setup lang="ts">
const handleClick = () => {
  alert('welcome')
}
</script>

<template>
  <div class="ioc-container">
    <p>Welcome to use ioc editor</p>
    <button @click="handleClick">确认</button>
  </div>
</template>

<style scoped lang="less">
.ioc-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  p {
    color: blue;
    font-size: 24px;
  }
  button {
    width: 120px;
    border: 0;
    background-color: cadetblue;
    border-radius: 5px;
  }
}
</style>
