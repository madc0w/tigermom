<template>
	<div class="container">
		<h1>Nuxt 3 + MongoDB (TypeScript)</h1>

		<form class="row" @submit.prevent="add">
			<input
				v-model="newTitle"
				class="input"
				placeholder="Add a task..."
				:disabled="adding"
			/>
			<button class="btn" :disabled="adding || !newTitle.trim()">
				{{ adding ? 'Adding...' : 'Add' }}
			</button>
		</form>

		<div class="spacer" />

		<div v-if="pending">Loading...</div>
		<div v-else-if="error" class="error">{{ error.message }}</div>
		<ul v-else class="list">
			<li v-for="t in tasks || []" :key="asKey(t)">
				<span class="title">{{ t.title }}</span>
				<time class="date">{{ fmt(t.createdAt) }}</time>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch';
import { onMounted, ref } from 'vue';
type Task = {
	_id: string | { $oid: string } | any;
	title: string;
	createdAt: string | Date;
};

const newTitle = ref('');
const adding = ref(false);
const tasks = ref<Task[] | null>(null);
const pending = ref(true);
const error = ref<Error | null>(null);

async function refresh() {
	pending.value = true;
	try {
		tasks.value = await $fetch<Task[]>('/api/tasks');
		error.value = null;
	} catch (e: any) {
		error.value = e;
	} finally {
		pending.value = false;
	}
}

onMounted(() => {
	void refresh();
});

function asKey(t: Task) {
	// Handle possible different shapes for ObjectId when serialized
	return typeof t._id === 'string'
		? t._id
		: t._id?.$oid ?? JSON.stringify(t._id);
}

function fmt(d: string | Date) {
	return new Date(d).toLocaleString();
}

async function add() {
	if (!newTitle.value.trim()) return;
	adding.value = true;
	try {
		await $fetch('/api/tasks', {
			method: 'POST',
			body: { title: newTitle.value },
		});
		newTitle.value = '';
		await refresh();
	} finally {
		adding.value = false;
	}
}
</script>

<style scoped>
.container {
	max-width: 720px;
	margin: 40px auto;
	padding: 0 16px;
	font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu,
		Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji,
		Segoe UI Emoji;
}
h1 {
	font-size: 24px;
	margin: 0 0 16px;
}
.row {
	display: flex;
	gap: 8px;
}
.input {
	flex: 1;
	padding: 8px 12px;
	border: 1px solid #ccc;
	border-radius: 6px;
}
.btn {
	padding: 8px 14px;
	background: #00dc82;
	color: #111;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 600;
}
.btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
.spacer {
	height: 16px;
}
.list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 8px;
}
li {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}
.title {
	font-weight: 600;
}
.date {
	color: #6b7280;
	font-size: 12px;
}
.error {
	color: #b91c1c;
}
</style>
