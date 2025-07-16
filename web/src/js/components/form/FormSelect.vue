<script setup>
const model = defineModel({ type: [ String, Number ] });

const props = defineProps({
	label: { type: String, default: '' },
	name: { type: String, required: true },
	options: {
		type: Array,
		required: true,
		validator(value) {
			return !value.some(option => {
				if (!Object.prototype.hasOwnProperty.call(option, 'value')) {
					console.error('Options must include a value');
					return true;
				}
			});
		}
	},
	defaultOption: { default: '' },
	placeholder: { type: String, default: '' }
});

</script>

<template>
	<div class="row mb-2">
		<div class="col-md-3 align-content-center">
			<label
				v-if="label"
				:for="name"
				v-text="label"
			/>
		</div>
		<div class="col-md-9 align-content-center">
			<div class="input-group">
				<select
					:id="props.name"
					v-bind="$attrs"
					v-model="model"
					class="form-select"
					:placeholder="placeholder"
					:name="props.name"
				>
					<option
						v-if="placeholder"
						:value="defaultOption"
						selected
						disabled
						v-text="placeholder"
					/>
					<template v-for="option in options" :key="option.value">
						<option :value="option.value" v-text="option.text || option.value" />
					</template>
				</select>
				<slot name="after" />
			</div>
		</div>
	</div>
</template>
