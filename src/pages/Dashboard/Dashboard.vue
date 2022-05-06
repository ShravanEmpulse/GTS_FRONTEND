<template>
  <div>
    <h4 class="page-title">Dashboard</h4>
        <DashboardCount ref="dashboardCount"/>
        <b-row>
            <b-col lg="9">
                <GpsStatsChart ref="gpsStatsChart"/> 
            </b-col>
            
            <b-col lg="3">
                <DashboardNotification ref="dashboardNotification" />
            </b-col>
        </b-row>

        <b-row>
            <b-col lg="12">
                <GpsProviderStatus ref="gpsProviderStatus"/>
            </b-col>
        </b-row>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import AnimatedNumber from "animated-number-vue";
import GpsStatsChart from './components/Chart/GpsStatsChart';
import DashboardCount from './components/Count/DashboardCount';
import GpsProviderStatus from './components/Status/GpsProviderStatus';
import DashboardNotification from './components/Notification/DashboardNotification';
import 'imports-loader?jQuery=jquery,this=>window!govpredict-morris/morris';

export default {
    name: 'Dashboard',
    components: {
        Widget,
        AnimatedNumber,
        GpsStatsChart,
        DashboardCount,
        GpsProviderStatus,
        DashboardNotification
    },
    data() {
        return {
             polling: null,
        };
    },
    created(){
        this.pollData();
    },
    beforeDestroy(){
        clearInterval(this.polling)
     },
    methods: {
         pollData(){
            this.polling = setInterval(()=>{
            this.$refs.dashboardCount.dashboardGetCount();
            this.$refs.dashboardCount.dashboardGetDelay();
            this.$refs.gpsStatsChart.getGpsStats();
            this.$refs.gpsProviderStatus.getProviderStatus();
            this.$refs.dashboardNotification.getDashboardNotification();
            },5*60*1000);
         }
     }

};
</script>

<style src="./Dashboard.scss" lang="scss" />
