import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';
import countObjectProperties from './utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    rooms: {},
    users: {},
    services: {},
    authId: null,
    modals: {
      login: false,
      register: false,
    },
  },
  getters: {
    modals: state => state.modals,
    rooms: state => state.rooms,
    userRoomsCount: state => id => countObjectProperties(state.users[id].rooms),
    authUser(state) {
      return (state.authId) ? state.users[state.authId] : null;
    },
  },
  mutations: {
    SET_MODAL: (state, { name, value }) => {
      state.modals[name] = value;
    },
    SET_ROOM: (state, { newRoom, roomId }) => {
      Vue.set(state.rooms, roomId, newRoom);
    },
    SET_ROOM_TO_USER: (state, { roomId, userId }) => {
      Vue.set(state.users[userId].rooms, roomId, roomId);
    },
    SET_ITEM: (state, { item, id, resource }) => {
      const newItem = item;
      newItem['.key'] = id;
      Vue.set(state[resource], id, newItem);
    },
    SET_AUTH_ID: (state, id) => {
      state.authId = id;
    },
  },
  actions: {
    TOGGLE_MODAL: ({ commit }, { name, value }) => {
      commit('SET_MODAL', { name, value });
    },
    CREATE_ROOM: ({ state, commit }, room) => {
      const newRoom = room;
      const roomId = firebase.database().ref('rooms').push().key;
      newRoom.userId = state.authId;
      newRoom.publishedAt = Math.floor(Date.now() / 1000);
      newRoom.meta = { likes: 0 };
      const updates = {};
      updates[`rooms/${roomId}`] = newRoom;
      updates[`users/${newRoom.userId}/rooms/${roomId}`] = roomId;
      firebase.database().ref().update(updates).then(() => {
        commit('SET_ROOM', { newRoom, roomId });
        commit('SET_ROOM_TO_USER', { roomId, userId: newRoom.userId });
        return Promise.resolve(state.rooms[roomId]);
      });
    },
    FETCH_ROOMS: ({ state, commit }, limit) => new Promise((resolve) => {
      let instance = firebase.database().ref('rooms');
      if (limit) {
        instance = instance.limitToFirst(limit);
      }
      instance.once('value', (snapshot) => {
        const rooms = snapshot.val();
        Object.keys(rooms).forEach((roomId) => {
          const room = rooms[roomId];
          commit('SET_ITEM', { item: room, id: roomId, resource: 'rooms' });
        });
        resolve(Object.values(state.rooms));
      });
    }),
    FETCH_USER: ({ state, commit }, { id }) => new Promise((resolve) => {
      firebase.database().ref('users').child(id).once('value', (snapshot) => {
        commit('SET_ITEM', { item: snapshot.val(), resource: 'users', id: snapshot.key });
        resolve(state.users[id]);
      });
    }),
    FETCH_SERVICES: ({ state, commit }) => new Promise((resolve) => {
      firebase.database().ref('services').once('value', (snapshot) => {
        const services = snapshot.val();
        Object.keys(services).forEach((serviceId) => {
          commit('SET_ITEM', { item: services[serviceId], id: serviceId, resource: 'services' });
        });
        resolve(state.services);
      });
    }),
    CREATE_USER: ({ state, commit }, { email, name, password }) => new Promise((resolve) => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((account) => {
          const id = account.user.uid;
          const registerAt = Math.floor(Date.now() / 1000);
          const newUser = { email, name, registerAt };
          firebase.database().ref('users').child(id).set(newUser)
            .then(() => {
              commit('SET_ITEM', { resource: 'users', id, item: newUser });
              resolve(state.users[id]);
            });
        });
    }),
    FETCH_AUTH_USER: ({ dispatch, commit }) => {
      const userId = firebase.auth().currentUser.uid;
      return dispatch('FETCH_USER', { id: userId })
        .then(() => {
          commit('SET_AUTH_ID', userId);
        });
    },
    SIGN_IN(context, { email, password }) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    },
    LOG_OUT({ commit }) {
      firebase.auth().signOut()
        .then(() => commit('SET_AUTH_ID', null));
    },
  },
});
