<script setup>
import { onBeforeMount, watch } from "vue";
import { questions } from "~/data/data.js";

const votes = ref([]);

const dataLoaded = ref(false);

const flag = ref(false);

const netlifyButton = ref(false);

useHead({
  title: "Dev OPinion - Netlify Dynamic site challenge",
});

const localVotingState = ref(
  JSON.parse(window.localStorage.getItem("localVotingState")) || {}
);

onBeforeMount(async () => {
  fetch("/.netlify/functions/getVotes", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((result) => {
      votes.value = result.questions;
      dataLoaded.value = true;
    });
});

function getVotes(key) {
  return votes.value.filter((e) => e.key === key)[0].votes;
}

function getTotalVotes(key) {
  return getVotes(key).reduce((a, b) => a + b, 0);
}

function getPercentage(key, option) {
  return Math.round((getVotes(key)[option] / getTotalVotes(key)) * 100);
}

function buttonClicked(key, option) {
  flag.value = true;
  localVotingState.value[key] = true;

  fetch("/.netlify/functions/vote", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: key,
      option: option,
    }),
  }).catch((err) => {
    console.error(err);
  });
}

watch(
  localVotingState,
  (val) => {
    window.localStorage.setItem("localVotingState", JSON.stringify(val));
  },
  { deep: true }
);
</script>

<template>
  <div class="flex justify-center max-w-5xl mx-auto pb-32 px-3">
    <div class="w-full max-w-[600px]">
      <h1
        class="text-4xl sm:text-6xl font-bold text-green-700 text-center my-8"
      >
        Dev OPinion
      </h1>

      <ul class="space-y-36 mt-28">
        <li v-for="question in questions">
          <div
            class="bg-white my-4 rounded-md border-2 border-green-700 shadow-[4px_5px_0px_0px_rgba(21,128,61,1)] p-4 w-full"
          >
            <p class="font-semibold text-lg text-center mt-4 mb-8">
              {{ question.label }}
            </p>

            <div
              v-if="!dataLoaded || !localVotingState[question.key]"
              class="options grid grid-cols-2 gap-2"
            >
              <button
                v-for="(option, index) in question.options"
                @click="buttonClicked(question.key, index)"
                class="text-center font-semibold border-2 border-green-700 px-4 py-3 rounded-md transition-all hover:translate-y-[1px] duration-100"
              >
                {{ option }}
              </button>
            </div>

            <template v-if="dataLoaded && localVotingState[question.key]">
              <div
                class="votes-count border-green-700 border-2 rounded-md mt-2"
              >
                <div
                  class="progress-bar h-7 bg-green-700 text-white font-semibold p-2 transition-all ease-in-out duration-1000"
                  :style="[
                    localVotingState[question.key]
                      ? `width: ${getPercentage(question.key, 0)}%;`
                      : 'width: 0;',
                  ]"
                ></div>
              </div>
              <div class="flex justify-between px-1.5 text-sm">
                <div>
                  {{ question.options[0] }} ({{
                    getPercentage(question.key, 0)
                  }}%)
                </div>
                <div>
                  {{
                    new Intl.NumberFormat("en-US").format(
                      parseInt(
                        getVotes(question.key).reduce((a, b) => a + b, 0)
                      )
                    )
                  }}
                  votes
                </div>
                <div>
                  {{ question.options[1] }} ({{
                    getPercentage(question.key, 1)
                  }}%)
                </div>
              </div>
            </template>
          </div>
        </li>

        <!-- Custom -->
        <li>
          <div
            class="bg-white my-4 rounded-md border-2 border-green-700 shadow-[4px_5px_0px_0px_rgba(21,128,61,1)] p-4 w-full"
          >
            <p class="font-semibold text-lg text-center mt-4 mb-8">
              Netlify or Other platforms?
            </p>

            <div class="options grid grid-cols-2 gap-2" v-if="!netlifyButton">
              <button
                class="text-center font-semibold border-2 border-green-700 px-4 py-3 rounded-md transition-all hover:translate-y-[1px] duration-100"
                @click="netlifyButton = true"
              >
                Netlify ❤
              </button>
              <button
                class="text-center font-semibold border-2 border-green-700 px-4 py-3 rounded-md transition-all hover:translate-y-[1px] duration-100 cursor-not-allowed"
                disabled
              >
                Others
              </button>
            </div>

            <template v-if="netlifyButton">
              <div
                class="votes-count border-green-700 border-2 rounded-md mt-2"
              >
                <div
                  class="progress-bar h-7 bg-green-700 text-white font-semibold p-2 transition-all ease-in-out duration-1000 w-100"
                ></div>
              </div>
              <div class="flex justify-between px-1.5 text-sm">
                <div>Netlify (100%)</div>
                <div>1,000,000 votes</div>
                <div>Others (0%)</div>
              </div>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div class="text-center my-8 text-sm text-gray-500 font-semibold">
    Created by
    <a
      href="https://frikishaan.com"
      target="_blank"
      class="underline text-green-800"
      >Ishaan</a
    >
  </div>
</template>

<style>
body {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12' viewBox='0 0 20 12'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='charlie-brown' fill='%23a8d5b8' fill-opacity='0.4'%3E%3Cpath d='M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.progress-bar {
  background-color: #15803d;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%237dc096' fill-opacity='0.4'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
