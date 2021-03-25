<template>
  <page-layout>
    <section class="py-4 bg-teal-dark">
      <div class="container">
        <form class="form">
          <div class="form__field relative">
            <i class="input-icon material-icons absolute text-grey-darker">search</i>
            <input
              class="input__search"
              id="where"
              type="text"
              placeholder="Mexico City, Mexico">
          </div>
        </form>
      </div>
    </section>
    <section class="section__create py-6">
      <div class="container">
        <h1 class="text-3x1">Publish a new room</h1>
        <form>
          <div class="mb-4">
            <label for="input_title" class="input__label">Title</label>
            <input
              v-model="room.title"
              class="input__field"
              type="text"
              name="input_title"
              id="input_title"
              placeholder="Bruce Wayne"
            >
          </div>

          <div class="mb-4">
            <label for="input_description" class="input__label">Description</label>
            <textarea
              v-model="room.description"
              class="input__field"
              name="input_description"
              id="input_description"
              rows="10"
            >
            </textarea>
          </div>

          <div class="mb-4">
            <label for="input_featured_image" class="input__label">Featured Image</label>
            <input
              v-model="room.featured_image"
              class="input__field"
              type="text"
              name="input_featured_image"
              id="input_featured_image"
              placeholder="Bruce Wayne"
            >
          </div>
          <div class="mb-4 text-right">
            <button
              @click.prevent="save"
              class="w-full bg-yellow-dark text-yellow-darker font-semibold py-3 px-6 rounded"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </section>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout.vue';

export default {
  components: { PageLayout },
  data() {
    return {
      room: {
        title: '',
        description: '',
        featured_image: '',
      },
    };
  },
  created() {
    this.$store.dispatch('FETCH_SERVICES');
  },
  methods: {
    save() {
      const room = {
        ...this.room,
        publishedAt: Date.now(),
      };
      this.$store.dispatch('CREATE_ROOM', room).then(() => {
        this.$router.push({ name: 'SearchPage' });
      });
    },
  },

};
</script>

<style>

</style>
