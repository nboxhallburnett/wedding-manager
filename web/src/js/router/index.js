import { inject } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Login',
			component: () => import('../views/RSVPLogin.vue'),
			beforeEnter: (to, from, next) => {
				// If the user has already signed in, redirect them to the home page instead
				const rsvp = inject('rsvp');
				if (rsvp.value) {
					next({ name: 'Home' });
				}
				next();
			}
		},
		{
			path: '/',
			name: 'Home',
			component: () => import('../views/RSVPHome.vue')
		},
		{
			path: '/about',
			name: 'About',
			component: () => import('../views/AboutView.vue')
		},
		{
			path: '/admin',
			name: 'Admin Overview',
			component: () => import('../views/AdminOverview.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/rsvp/new',
			name: 'Admin Create RSVP',
			component: () => import('../views/AdminCreateRSVP.vue'),
			meta: { admin: true }
		},
		{
			path: '/admin/rsvp/list',
			name: 'Admin List RSVPs',
			component: () => import('../views/AdminListRSVPs.vue'),
			meta: { admin: true }
		},
		{
			path: '/:pathMatch(.*)+',
			name: '404',
			component: () => import('../views/NotFound.vue')
		}
	]
});

router.beforeEach((to, from, next) => {
	const rsvp = inject('rsvp');
	if (to.meta?.admin && !rsvp.value?.admin) {
		return next({ name: '404', params: { pathMatch: to.path.split('/').slice(1) } });
	}

	next();
});

export default router;
