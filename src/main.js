import Vue from 'vue';
import firebase from 'firebase';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDn87BMYQop5h6i6p-hp9P1nR6DS_-m0TE',
  authDomain: 'platzi-rooms-b02ca.firebaseapp.com',
  projectId: 'platzi-rooms-b02ca',
  storageBucket: 'platzi-rooms-b02ca.appspot.com',
  messagingSenderId: '763453509362',
  appId: '1:763453509362:web:19af39fabdbf64467cca6b',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Observer auth
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    store.dispatch('FETCH_AUTH_USER');
  }
});

new Vue({
  router,
  store,
  render: h => h(App),
  beforeCreate() {
    if (store.state.authId) {
      this.$store.dispatch('FETCH_USER', { id: store.state.authId });
    }
  },
}).$mount('#app');
