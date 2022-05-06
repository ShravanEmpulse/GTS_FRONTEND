<template>
    <div :class="{ 'theme-helper': true, 'theme-helper-opened': opened }">    
        <section class="widget theme-helper-content">    
            <header class="theme-helper-header d-flex p-0">    
                <div class="theme-helper-toggler" @click="toggle()">    
                    <div class="theme-helper-spinner text-white">    
                        <i class="la la-cog"></i>    
                        <i class="la la-cog"></i>    
                    </div>    
                </div>
                <br>    
                <h4>Trailer Detail</h4>
            </header>

            <div v-if="defaultPage" class="no-detail">
                  <div class="widget-body text-white">
                     <br><br><br>
                      <i class="fa fa-info-circle fa-4x opacity-50" />
                      <br><br>
                      <h3>
                          &nbsp; Please Click the <span class="fw-semi-bold">Trailer</span>.
                      </h3>
                  </div>
            </div>
    
            <div v-if="!defaultPage" class="widget-body mt-3 detail-body" >           
                <div class="table-resposive" v-for="row in trailerDetail" :key="row.plateNo">    
                    <table class="table">    
                        <tbody>    
                             <tr>    
                                <td class='fw-semi-bold'>  STATUS </td>    
                                <td > 
                                    <b-badge v-if="row.drivingStatus == '1'" variant="primary" class="status_badge" >TRANSIT</b-badge> 
                                    <b-badge v-if="row.drivingStatus == '2'" variant="success" class="status_badge" >ARRIVAL</b-badge>
                                    <b-badge v-if="row.drivingStatus == '3'" variant="info" class="status_badge" >IDLE</b-badge>
                                    <b-badge v-if="row.drivingStatus == '4'" variant="danger" class="status_badge" >DELAY</b-badge>
                                    <b-badge v-if="row.drivingStatus == '5'" variant="warning" class="status_badge" >STANDBY</b-badge>
                                </td>    
                            </tr>
                            <tr>    
                                <td class='fw-semi-bold'>  PLATE NO </td>    
                                <td >  {{row.plateNo}} </td>    
                            </tr>
                            <tr>    
                                <td class='fw-semi-bold'>  TI NO </td>    
                                <td >  {{row.tiNo}} </td>    
                            </tr>
                            <tr>    
                                <td class='fw-semi-bold'>  TP VENDOR </td>    
                                <td >  {{row.transporterName}} </td>    
                            </tr>
                            <tr>    
                                <td class='fw-semi-bold'>  DEPARTURE DATE </td>    
                                <td >  {{parseDate(row.shippingDetails[0].departureDate)}} </td>    
                            </tr>
                            <tr>    
                                <td class='fw-semi-bold'>  ETA </td>    
                                <td >  {{parseDate(row.shippingDetails[0].eta)}} </td>    
                            </tr>
                        </tbody>    
                    </table>  
                    <div role="tablist" class="item-detail">
                        <b-card no-body class="mb-1" v-for="sr in row.shippingDetails" :key="sr.dealerCode" >
                        <b-card-header header-tag="header" class="p-1" role="tab">
                            <b-button v-b-toggle="'collapse' + sr.dealerCode + sr.destName" block variant="outline-primary" class="fw-semi-bold">{{sr.dealerName}} - {{sr.destName}}</b-button>
                        </b-card-header>
                        <b-collapse :id="'collapse' + sr.dealerCode + sr.destName" accordion="my-accordion" role="tabpanel">
                            <b-card-body>
                                <table class="table">    
                                    <tbody v-for="item in sr.items" :key="item.itemNo">    
                                         <tr>    
                                            <td class='fw-semi-bold'>  {{item.itemNo}} </td>    
                                            <td > {{item.itemName}} </td>    
                                        </tr>
                                    </tbody>    
                                </table>
                            </b-card-body>
                        </b-collapse>
                        </b-card>
                       
                    </div>
                </div>    
                
            </div>    
        </section> 

        <loading
            :show="loadingShow"
            :label="loadingLabel"
            loader-class="loading">
        </loading>
    </div>
</template>

<script>
export default {
    name: 'Helper',
    data() {
        return {
            /* LOADING */
            loadingShow: false,
            loadingLabel: 'Loading...',
            /* DETAIL */
            opened: false,
            trailerDetail:[],
            result: null,
            paramPlateNo: 0,
            searchPlateNo: null,
             defaultPage: true,
        }
    },
    methods: {
        toggle(plateNo) {
            
            this.searchPlateNo = plateNo;

            if(plateNo !== undefined){
                this.defaultPage = false;
                 
                if(!this.opened){
                    this.opened = !this.opened;
                }
                this.paramPlateNo = plateNo ;  
                this.loadingShow = true;
                
                this.$axios.get('/api/map/trailer/detail', {
                     params: { plateNo:plateNo }
                 })
                .then((response) => {
                    console.log(response);
                    this.loadingShow = false;
                    this.trailerDetail = response.data.resultBody ; 
                })
                .catch((ex)=> {
                    console.log(ex);
                    this.loadingShow = false;
                })

            }else{
                 this.opened = !this.opened;
            }

        },
        parseDate(date) {
            return this.$moment(date,'YYYYMMDDHHmmss').format('DD MMM, YYYY')
        },
    }
};
</script>

<style src="./Detail.scss" lang="scss" scoped />