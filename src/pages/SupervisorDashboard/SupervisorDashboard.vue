<template>
  <div>
    <h4 class="page-title">Dashboard</h4>
        <b-row>
            <b-col lg="2" md="8" xs="12">
                <Widget class="mb-0">
                     <h4 class="fw-semi-bold">Glovis Tracking System </h4>
                     <h5> System Information </h5>
                    <Clock />
                    <br />
                    <h5>Agent Status</h5>
                    <div class="widget-middle-overflow">
                        <table class="table">
                            <tbody>
                                <tr v-for="data in monitoringData" :key="data.agentURL" :item="data">
                                    <td><p class="m-0">{{data.machineName}}</p></td>
                                    <td>
                                        <i v-if="data.agentStatus ==='up'" class="fa fa-circle text-link mr-1" />
                                        <Blink v-else>
                                            <i class="fa fa-circle text-danger mr-1" />
                                        </Blink>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Widget>
            </b-col>
            <b-col lg="2" md="8" xs="12" v-for="data in monitoringData" :key="data.agentURL" :item="data">
                <Widget >
                    <div class="clearfix">
                        <b-row class="flex-nowrap">
                            <b-col lg="4">
                            <span class="dashboard-widget-icon">
                                <i v-if="data.machineType === 'AP'" class="fa fa-server"  />
                                <i v-if="data.machineType === 'DB'" class="fa fa-database" />
                            </span>
                            </b-col>
                            <b-col lg="8">
                                <h5 class="m-0">{{data.machineName}}</h5>
                                <p class="fw-semi-bold small-font">{{formattingAgentURL(data.agentURL)}}</p>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col lg="12">
                            <div class="clearfix fs-mini">
                                <span class="pull-right m-0 fw-semi-bold">CPU</span>
                                <span class="fs-mini">{{data.resource.cpuLoad}} %</span>
                            </div>
                            <b-progress animated variant="warning" class="bg-gray-lighter progress-xs"
                                :value="data.resource.cpuLoad" :max="100" />
                            <div class="clearfix fs-mini mt">
                                <span class="pull-right m-0 fw-semi-bold">MEM</span>
                                <span class="fs-mini">{{setMemoryPercentage(data.resource.memory)}} %</span>
                            </div>
                            <b-progress animated variant="primary" class="bg-gray-lighter progress-xs"
                                :value="setMemoryPercentage(data.resource.memory)" :max="100" />
                            <div class="clearfix fs-mini mt">
                                <span class="pull-right m-0 fw-semi-bold">I/O</span>
                                <span class="fs-mini">{{data.resource.ioThroughput}} %</span>
                            </div>
                            <b-progress animated variant="success" class="bg-gray-lighter progress-xs"
                                :value="data.resource.ioThroughput" :max="100" />
                            </b-col>
                        </b-row>
                        <hr>
                        <h6>Partition</h6>
                        <div class="widget-middle-overflow">
                            <b-row class="flex-nowrap">
                                <b-col xs="12">
                                    <table class="table">
                                        <tbody>
                                            <tr v-for="partition in data.resource.partitions" :key="partition.mount" :item="partition">
                                                <td>{{partition.mount}}</td>
                                                <td>
                                                    {{partition.use}}%
                                                </td>
                                                <td style="width:80%">
                                                    <b-progress animated variant="info" class="bg-gray-lighter progress"
                                                        :value="partition.use" :max="100" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </b-col>
                            </b-row>
                        </div>
                        <hr>
                        <h6>Process Status</h6>
                        <div class="widget-middle-overflow">
                            <b-row class="flex-nowrap">
                                <b-col xs="12">
                                    <table class="table m-0">
                                        <tbody>
                                            <tr v-for="process in data.resource.processes" :key="process.name" :item="process">
                                                <td>
                                                    <p v-if="process.name !== 'DatabaseSyncWorker'" class="m-0 small-font">{{process.name}}</p>
                                                    <p v-if="process.name === 'DatabaseSyncWorker'" class="m-0 small-font">TMSGateway</p>
                                                </td>
                                                <td>
                                                    <i v-if="process.running ===true" class="fa fa-circle text-link mr-1" />
                                                    <Blink v-else>
                                                        <i class="fa fa-circle text-danger mr-1" />
                                                    </Blink>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </b-col>
                            </b-row>
                         </div>
                    </div>
                </Widget>
            </b-col>
        </b-row>

  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Clock from './components/Clock';
import Blink from 'vue-blink';
import 'imports-loader?jQuery=jquery,this=>window!govpredict-morris/morris';

export default {
    name: 'Dashboard',
    components: {
        Widget,Blink,Clock
    },
    data() {
        return {
            polling: null,
            monitoringData:[],
        };
    },
    mounted() {
        this.getMonitoringData();
    },
    created(){
        this.pollData();
    },
    beforeDestroy(){
        clearInterval(this.polling)
    },
    methods: {
        showErrorAlert(status) {
            this.$swal({
                title: 'Error',
                text: status,
                confirmButtonText: 'OK'
            });
        },
        getMonitoringData(){
             this.$axios.get('/api/monitoring')
            .then((response) => {
                console.log(response);
                this.monitoringData = JSON.parse(response.data.resultBody);
            }).catch((ex)=> {
                console.log(ex.response);
                const errorMessage = "Lost connection."
                this.showErrorAlert(errorMessage);
            })
        },
        pollData(){
            this.polling = setInterval(()=>{
                this.getMonitoringData();
            },10000);
        },
        formattingAgentURL(url){
            const formatUrl = url.split(':');
            return formatUrl[0];
        },
        setMemoryPercentage(memory){
            const total = memory.total;
            const free = memory.free;
            const used = memory.used;

            return Math.round(((total-free)/total)*100);
        },
    },

};
</script>

<style src="./SupervisorDashboard.scss" lang="scss" />
