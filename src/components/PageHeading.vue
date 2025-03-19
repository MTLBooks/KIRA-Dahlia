<template>
	<NH2 prefix="bar" class="overflow-clip page-heading">
		<NText type="primary" class="inline-block">
			<slot></slot>
		</NText>
	</NH2>
</template>

<style>
	.page-heading {
		&,
		* {
			&,
			&::before,
			&::after {
				transition: all cubic-bezier(0, 0, 0, 1) 400ms 125ms !important;
			}
		}

		.n-text {
			transition-delay: 200ms !important;
		}
	}

	@starting-style {
		.page-heading .n-text {
			translate: calc(-100% - var(--n-prefix-width));
		}

		.page-heading::before {
			scale: 1 0;
		}
	}
</style>
