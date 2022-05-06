<template>
<Widget title="<h5><i class='la la-slack'></i>&nbsp; GPS Stats <span class='fw-semi-bold'> Graph</span></h5>" customHeader><br>
    <div class="charts-overview">
    
        <div >
            <line-chart 
                    id="line" 
                    :data="gpsStats"
                    xkey = "dateTime"
                    ykeys = '["successCount", "failCount"]'
                    labels ='["SUCCESS", "FAIL"]'
                    line-colors = '["#8fe5d4", "#F78181"]'
                    grid-text-color= "#c1ccd3"
                    grid = "ture"
                    grid-text-weight="bold"
                    resize="true"
                    parseTime = "false"
                    hideHover = "true"
                    lineWidth = "3px"
                    stacked = "true"
                    class="status-graph"></line-chart>
        </div>
    
    </div>
</Widget>
</template>

<script>
import $ from 'jquery';

import Raphael from 'raphael/raphael';
global.Raphael = Raphael;

import { LineChart } from 'vue-morris';

import Widget from '@/components/Widget/Widget';

export default {
    name: 'GpsStatusChart',
    components: { Widget, LineChart },
    data() {
        return {
            gpsStats: [],
        };
    },
    created(){
        this.getGpsStats();
    },
    methods: {
        getGpsStats(){
            this.$axios.get('/api/dashboard/gpsStats')
            .then((response) => {
                console.log(response);
                this.gpsStats = response.data.resultBody;
            }).catch((ex)=> {
                console.log(ex);
            })

        }
    },
    mounted() {
    },
    destroyed() {
    },
};
</script>


<style src="./GpsStatsChart.scss" lang="scss" />