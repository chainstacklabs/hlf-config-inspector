<template>
  <span>
    <span v-for="(value, subject, i) in subjects" :key="i">
      <span>{{ subject }} = {{ value }}</span>
      <span v-if="i !== Object.keys(subjects).length - 1">, </span>
    </span>
  </span>
</template>

<script>
export default {
  name: "Subjects",
  props: ["subjects"]
};
</script>

<style scoped></style>
