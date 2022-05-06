import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';

// Dashboards
import Dashboard from '@/pages/Dashboard/Dashboard';
import SupervisorDashboard from '@/pages/SupervisorDashboard/SupervisorDashboard';
// Maps
import MapPage from '@/pages/Maps/Map/Map';
import PlaybackPage from '@/pages/Maps/Playback/Playback';

//Genisys
import GenisysMapPage from '@/pages/Genisys/GenisysMap/GenisysMap';
import GenisysTrailerPage from '@/pages/Genisys/GenisysTrailer/GenisysTrailer';
import GenisysPlaybackPage from '@/pages/Genisys/GenisysPlayback/GenisysPlayback';

//Domestic
import DomesticMapPage from '@/pages/Domestic/DomesticMap/DomesticMap';
import DomesticTrailerPage from '@/pages/Domestic/DomesticTrailer/DomesticTrailer';
import DomesticPlaybackPage from '@/pages/Domestic/DomesticPlayback/DomesticPlayback';

// Trailer
import TrailerPage from '@/pages/Trailer/Trailer';
// Report
import DeliveryDistanceReportPage from '@/pages/Report/DeliveryDistanceReport/DeliveryDistanceReport';
import IdleReportPage from '@/pages/Report/IdleReport/IdleReport';
import DelayReportPage from '@/pages/Report/DelayReport/DelayReport';
import ShippingArrivalReportPage from '@/pages/Report/ShippingArrivalReport/ShippingArrivalReport';
import TrackingReportPage from '@/pages/Report/TrackingReport/TrackingReport';
import OverSpeedReportPage from '@/pages/Report/OverSpeedReport/OverSpeedReport';
import YearlyTrailerSummaryReportPage from '@/pages/Report/TrailerSummaryReport/YearlyReport/YearlyTrailerSummaryReport';
import MonthlyTrailerSummaryReportPage from '@/pages/Report/TrailerSummaryReport/MonthlyReport/MonthlyTrailerSummaryReport';
import DomesticGeofencesHistoryPage from '@/pages/Report/DomesticGeofenceHistory/DomesticGeofenceHistory';

// History
import LoginHistoryPage from '@/pages/History/LoginHistory/LoginHistory';
import SchedulerHistoryPage from '@/pages/History/SchedulerHistory/SchedulerHistory';

// Settings
import MyAccountPage from '@/pages/Settings/MyAccount/MyAccount';
import UserPage from '@/pages/Settings/User/User';
import RolePage from '@/pages/Settings/Role/Role';
import MenuPage from '@/pages/Settings/Menu/Menu';
import ChangePasswordPage from '@/pages/Settings/Password/ChangePassword';

// Other
import Login from '@/pages/Login/Login';
import ResetPassword from '@/pages/Login/ResetPassword/ResetPassword';
import ErrorPage from '@/pages/Error/Error';
import AccessDeniedPage from '@/pages/Error/AccessDeniedPage';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [{
            path: '/',
            name: 'Login',
            component: Login,
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
        },
        {
            path: '/resetPassword',
            name: 'ResetPassword',
            component: ResetPassword,
        },
        {
            path: '/error',
            name: 'Error',
            component: ErrorPage,
        },
        {
            path: '/app',
            name: 'Layout',
            component: Layout,
            children: [
                // DASHBOARD
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: Dashboard,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "ADMIN" || role == "SUPERVISOR") {
                            return next();
                        } else {
                            return next('/app/accessDenied');
                        }
                    }
                },
                {
                    path: 'supervisorDashboard',
                    name: 'SupervisorDashboard',
                    component: SupervisorDashboard,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "SUPERVISOR") {
                            return next();
                        } else {
                            return next('/app/accessDenied');
                        }
                    }
                },
                // MAPS
                {
                    path: 'maps/map',
                    name: 'MapPage',
                    component: MapPage,
                },
                {
                    path: 'maps/playback',
                    name: 'PlaybackPage',
                    component: PlaybackPage,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "DEALER") {
                            return next('/app/accessDenied');
                        } else {
                            return next();
                        }
                    }
                },
                // Trailer
                {
                    path: 'trailer',
                    name: 'TrailerPage',
                    component: TrailerPage,
                },
                // Genisys 
                {
                    path: 'genisysTrackingMap',
                    name: 'GenisysMapPage',
                    component: GenisysMapPage,
                },
                {
                    path: 'genisysTrailer',
                    name: 'GenisysTrailerPage',
                    component: GenisysTrailerPage,
                },
                {
                    path: 'genisysPlayback',
                    name: 'GenisysPlaybackPage',
                    component: GenisysPlaybackPage,
                },
                // Domestic
                {
                    path: 'domesticMap',
                    name: 'DomesticMapPage',
                    component: DomesticMapPage,
                },
                {
                    path: 'domesticTrailer',
                    name: 'DomesticTrailerPage',
                    component: DomesticTrailerPage,
                },
                {
                    path: 'domesticPlayback',
                    name: 'DomesticPlaybackPage',
                    component: DomesticPlaybackPage,
                },
                //REPORT
                {
                    path: 'report/deliveryDistance',
                    name: 'DeliveryDistanceReportPage',
                    component: DeliveryDistanceReportPage,
                },
                {
                    path: 'report/idle',
                    name: 'IdleReportPage',
                    component: IdleReportPage,
                },
                {
                    path: 'report/delay',
                    name: 'DelayReportPage',
                    component: DelayReportPage,
                },
                {
                    path: 'report/shippingArrival',
                    name: 'ShippingArrivalReportPage',
                    component: ShippingArrivalReportPage,
                },
                {
                    path: 'report/tracking',
                    name: 'TrackingReportPage',
                    component: TrackingReportPage,
                },
                {
                    path: 'report/overSpeed',
                    name: 'OverSpeedReportPage',
                    component: OverSpeedReportPage,
                },
                {
                    path: 'report/yearlyTrailerSummary',
                    name: 'YearlyTrailerSummaryReportPage',
                    component: YearlyTrailerSummaryReportPage,
                },
                {
                    path: 'report/monthlyTrailerSummary',
                    name: 'MonthlyTrailerSummaryReportPage',
                    component: MonthlyTrailerSummaryReportPage,
                },
                {
                    path: 'report/domesticGeofence',
                    name: 'DomesticGeofenceHistoryPage',
                    component: DomesticGeofencesHistoryPage,
                },
                // History 
                {
                    path: 'history/loginHistory',
                    name: 'LoginHistoryPage',
                    component: LoginHistoryPage,
                },
                {
                    path: 'history/schedulerHistory',
                    name: 'SchedulerHistoryPage',
                    component: SchedulerHistoryPage,
                },
                // Settings
                {
                    path: 'myAccount',
                    name: 'MyAccountPage',
                    component: MyAccountPage,
                },
                {
                    path: 'user',
                    name: 'UserPage',
                    component: UserPage,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "ADMIN" || role == "SUPERVISOR") {
                            return next();
                        } else {
                            return next('/app/accessDenied');
                        }
                    }
                },
                {
                    path: 'role',
                    name: 'RolePage',
                    component: RolePage,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "SUPERVISOR") {
                            return next();
                        } else {
                            return next('/app/accessDenied');
                        }
                    }
                },
                {
                    path: 'menu',
                    name: 'MenuPage',
                    component: MenuPage,
                    beforeEnter: (to, from, next) => {
                        const role = window.sessionStorage.getItem('Role');
                        if (role == "SUPERVISOR") {
                            return next();
                        } else {
                            return next('/app/accessDenied');
                        }
                    }
                },
                {
                    path: 'changePassword',
                    name: 'ChangePasswordPage',
                    component: ChangePasswordPage,
                },
                {
                    path: 'accessDenied',
                    name: 'AccessDeniedPage',
                    component: AccessDeniedPage,
                },
            ],
        },
        {
            path: '*',
            name: 'Error',
            component: ErrorPage,
        }
    ],
});