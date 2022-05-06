<template>
    <div>    
      <b-row>
        <b-col lg="2">    
            <Widget customHeader>   
                <h6> Total </h6>
                <hr class="count-hr">   
                    <span class="text-white" @click="moveToTrailer('',dashboardCount.total)">
                        <img  src="../../../../assets/png/icn_total.png" alt="" class="truck"/>    
                        &nbsp; <animated-number :value="dashboardCount.total" :formatValue="formatCount" :duration="1000" :delay="0" />    
                    </span>   
            </Widget>
        </b-col>
        <b-col lg="2">    
            <Widget customHeader>   
                <h6> Transit </h6>
                <hr class="count-hr">   
                    <span class="text-white" @click="moveToTrailer('Transit',dashboardCount.transit)">
                        <img  src="../../../../assets/png/icn_transit.png" alt="" class="truck"/>    
                        &nbsp; <animated-number :value="dashboardCount.transit" :formatValue="formatCount" :duration="1000" :delay="0" />    
                    </span>  
            </Widget>
        </b-col>
        <b-col lg="2">    
            <Widget customHeader>   
                <h6> Arrival </h6>
                <hr class="count-hr">   
                    <span class="text-white" @click="moveToTrailer('Arrival',dashboardCount.arrival)">
                        <img  src="../../../../assets/png/icn_arrival.png" alt="" class="truck"/>    
                        &nbsp; <animated-number :value="dashboardCount.arrival" :formatValue="formatCount" :duration="1000" :delay="0" />    
                    </span>  
            </Widget>
        </b-col>
        <b-col lg="2">    
            <Widget customHeader>   
                <h6> Idle </h6>
                <hr class="count-hr">   
                    <span class="text-white" @click="moveToTrailer('Idle',dashboardCount.idle)">
                        <img  src="../../../../assets/png/icn_idle.png" alt="" class="truck"/>    
                        &nbsp;  <animated-number :value="dashboardCount.idle" :formatValue="formatCount" :duration="1000" :delay="0" />  
                    </span>  
            </Widget>
        </b-col>
        <b-col lg="4">    
            <Widget customHeader>   
                <h6> Delay </h6>
                <hr class="count-hr">   
                    <div class="text-white delay-truck-div" @click="moveToTrailer('Delay',dashboardCount.delay)">
                        <div>
                            <img  src="../../../../assets/png/icn_delay.png" alt="" class="truck"/>
                        </div>
                        <div class="delayCount">  
                            <animated-number :value="dashboardCount.delay" :formatValue="formatCount" :duration="1000" :delay="0" />
                        </div>
                        <div class="delayDetail">
                            <b-badge class="mr-xs outline-badge-light"> 1D : {{delayDetail.oneday}} </b-badge>
                            <b-badge class="mr-xs outline-badge-light"> 2D : {{delayDetail.twoday}} </b-badge>
                            <b-badge class="mr-xs outline-badge-light"> 3D : {{delayDetail.threeday}} </b-badge>
                            <b-badge class="mr-xs outline-badge-light"> 4D ~ : {{delayDetail.fourdayAbove}} </b-badge>
                        </div>
                    </div>  
            </Widget>
        </b-col>
      </b-row>  
    </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import AnimatedNumber from "animated-number-vue";

export default {
  name: 'DashboardCount',
    components: { 
      Widget,
      AnimatedNumber },
    data() {
        return {            
            /* DASHBOARD */
            dashboardCount: [],
            delayDetail: [],
        }
    },
    created(){
        this.dashboardGetCount();
        this.dashboardGetDelay();
    },
    methods: {
        formatCount(value) {
            return `${Number((value).toFixed()).toLocaleString().replace(/,/g,',')}`;
        },
        dashboardGetCount(){
            this.$axios.get('/api/dashboard/count')
            .then((response) => {
                console.log(response);
                this.dashboardCount =  response.data.resultBody;
            }).catch((ex)=> {
                console.log(ex);
            })
        },
        dashboardGetDelay(){
            this.$axios.get('/api/dashboard/delay')
            .then((response) => {
                console.log(response);
                const data = response.data.resultBody;
                this.delayDetail = data;
            }).catch((ex)=> {
                console.log(ex);

            })
        },
        moveToTrailer(status,count){
            if(status == 'Transit'){
                  this.$root.$router.push('/app/maps/map');
            }else{
                if(count !== 0){
                    this.$root.$router.push({
                        name: 'TrailerPage', 
                        params: { status: status }
                    });
                }
            }
        }
    },
}
</script>


<style src="./DashboardCount.scss" lang="scss" />