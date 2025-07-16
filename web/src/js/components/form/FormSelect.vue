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
	<div class="row mb-3">
		<label
			v-if="label"
			:for="name"
			class="col-sm-3 col-form-label"
			v-text="label"
		/>
		<div class="col-sm-9">
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
