import { inject } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Login',
			component: () => import('../views/LoginView.vue'),
			beforeEnter: (to, from, next) => {
				// If the user has already signed in, redirect them to the home page instead
				const invitation = inject('invitation');
				if (invitation.value) {
					return next({ name: 'Home' });
				}
				next();
			}
		},
		{
			path: '/',
			name: 'Home',
			component: () => import('../views/HomeView.vue'),
			meta: { session: true }
		},
		{
			path: '/edit',
			name: 'Edit Invitation',
			component: () => import('../views/InvitationEdit.vue'),
			meta: { session: true }
		},
		{
			path: '/about',
			name: 'About',
			component: () => import('../views/AboutView.vue'),
			meta: { session: true }
		},
		{
			path: '/questions',
			name: 'Q&A',
			component: () => import('../views/QAndA.vue'),
			meta: { session: true }
		},
		{
			path: '/gallery',
			name: 'Gallery',
			component: () => import('../views/GalleryView.vue'),
			meta: { session: true }
		},
		{
			path: '/admin',
			name: 'Admin Overview',
			component: () => import('../views/admin/Index.vue'),
			meta: { admin: true },
			children: [
				{
					path: 'stats',
					name: 'Admin Stats',
					component: () => import('../views/admin/InvitationStats.vue')
				},
				{
					path: 'calendar',
					name: 'Admin List Calendar Events',
					component: () => import('../views/admin/CalendarList.vue')
				},
				{
					path: 'calendar/new',
					name: 'Admin Create Calendar Event',
					component: () => import('../views/admin/CalendarEdit.vue')
				},
				{
					path: 'calendar/:calendarEventId/edit',
					name: 'Admin Edit Calendar Event',
					component: () => import('../views/admin/CalendarEdit.vue')
				},
				{
					path: 'calendar/:calendarEventId',
					name: 'Admin View Calendar Event',
					component: () => import('../views/admin/CalendarView.vue')
				},
				{
					path: 'invitation',
					name: 'Admin List Invitations',
					component: () => import('../views/admin/InvitationList.vue')
				},
				{
					path: 'invitation/new',
					name: 'Admin Create Invitation',
					component: () => import('../views/admin/InvitationCreate.vue')
				},
				{
					path: 'invitation/:invitationId',
					name: 'Admin Edit Invitation',
					component: () => import('../views/InvitationEdit.vue')
				},
				{
					path: 'menu',
					name: 'Admin List Menu Items',
					component: () => import('../views/admin/MenuList.vue')
				},
				{
					path: 'menu/:menuItemId',
					name: 'Admin View Menu Item',
					component: () => import('../views/admin/MenuView.vue')
				},
				{
					path: 'menu/new',
					name: 'Admin Create Menu Item',
					component: () => import('../views/admin/MenuEdit.vue')
				},
				{
					path: 'menu/:menuItemId/edit',
					name: 'Admin Edit Menu Item',
					component: () => import('../views/admin/MenuEdit.vue')
				},
				{
					path: 'about',
					name: 'Admin Edit About Content',
					component: () => import('../views/admin/AboutEdit.vue')
				},
				{
					path: 'questions',
					name: 'Admin Q&A Content',
					component: () => import('../views/admin/QAndAEdit.vue')
				},
				{
					path: 'gallery',
					name: 'Admin Gallery Content',
					component: () => import('../views/admin/GalleryEdit.vue')
				},
				{
					path: 'feedback',
					name: 'Admin List Feedback Items',
					component: () => import('../views/admin/FeedbackList.vue')
				}
			]
		},
		{
			path: '/:pathMatch(.*)+',
			name: '404',
			component: () => import('../views/NotFound.vue')
		}
	]
});

router.beforeEach((to, from, next) => {
	const invitation = inject('invitation');
	if (to.meta?.session && !invitation.value?.id) {
		return next({ name: '404', params: { pathMatch: to.path.split('/').slice(1) } });
	}
	if (to.meta?.admin && !invitation.value?.admin) {
		return next({ name: '404', params: { pathMatch: to.path.split('/').slice(1) } });
	}

	next();
});

export default router;
