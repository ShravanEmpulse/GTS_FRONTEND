<template>
<div>
    <Detail ref="detail" />   
    <b-row>    
        <b-col lg="2">    
            <h4 class="page-title">    
                <span>Map</span>    
            </h4>    
        </b-col> 
    </b-row>

    <b-row class="map-header">    
        <b-col xs="4" md="4"> 
            <b-input-group-append class="map-count">    
                <b-button variant="default" class="map-total-count" size="md" @click="showTotalTrailer">    
                    <img  src="../../../assets/png/icn_truck_br.png" alt="" class="truckCount"/>  &nbsp;&nbsp;Total &nbsp; 
                    <span class='fw-semi-bold'> {{totalTrailerCount.toLocaleString()}} </span>   
                </b-button>    
                <b-button variant="default" class="map-transit-count" size="md" @click="showTransitTrailer">    
                   <img  src="../../../assets/png/icn_truck_bl.png" alt="" class="truckCount"/>  &nbsp;&nbsp;Transit&nbsp; 
                   <span class='fw-semi-bold'> {{transitTrailerCount.toLocaleString()}} </span>
                </b-button>   
            </b-input-group-append>
        </b-col> 
        <b-col lg="4" offset-lg="4">    
            <b-input-group class="map-search">    
                <b-input-group-append>    
                    <b-form-select v-model="search_selected" :options="search_options"></b-form-select>    
                </b-input-group-append>    
                <b-form-input placeholder="" v-model="search_input" maxlength="30" @keyup.enter="showSearchTrailer()"/>    
                    <b-input-group-append>    
                        <b-button variant="default" class="mr-xs" size="md" @click="showSearchTrailer()">Search</b-button>
                    </b-input-group-append>    
                </b-input-group>    
        </b-col>   
    </b-row>
    <div>
        <GmapMap v-bind:style="computedMapSize" style="position: absolute; left:0; will-change: transform; transform: translateZ(0);" :zoom="zoom" :center="center" ref="map">    
            <GmapCluster :grid-size="gridSize" :styles="clusterStyles">
                <GmapMarker v-for="(marker, index) in markers" :key="index" :icon="marker.icon" :position="marker.latLng"
                 :clickable="true" :title="marker.title" :plateNo="marker.plateNo"  @click="markerClickEvent(marker.plateNo)" />    
            </GmapCluster>
        </GmapMap> 
    </div>

    <loading
     :show="loadingShow"
     :label="loadingLabel"
     loader-class="loading">
    </loading>
</div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Detail from './Detail/Detail';
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import vSelect from 'vue-select';

export default {
    components: { Widget, Detail, GmapCluster, vSelect },
    data() {
        return {
            /* LOADING */
            loadingShow: false,
            loadingLabel: 'Loading...',
            /* MAP */
            center: { lat: 21.207, lng: 78.777 },
            zoom: 5,
            markers: [],
            mapSize: { width: 100, heigth: 62 },
            /* CLUSTERS */
            gridSize: 60,
            clusterStyles: [
                {
                    url:require('../../../assets/svg/icn_density_lg.svg'),
                    textColor: 'black',
                    anchorText: [0,0],
                    height: 50,
                    width: 50
                },
                {
                    url:require('../../../assets/svg/icn_density_g.svg'),
                    textColor: 'black',
                    anchorText: [0,0],
                    height: 55,
                    width: 55
                },
                {
                    url:require('../../../assets/svg/icn_density_dg.svg'),                
                    textColor: 'white',
                    anchorText: [0,0],
                    height: 60,
                    width: 60
                },
                {
                    url:require('../../../assets/svg/icn_density_bl.svg'),                
                    textColor: 'white',
                    anchorText: [0,0],
                    height: 65,
                    width: 65
                },
                {
                    url:require('../../../assets/svg/icn_density_br.svg'),                
                    textColor: 'black',
                    anchorText: [0,0],
                    height: 65,
                    width: 65
                }
            ],
            
            /* COUNT */
            transitTrailerCount: 0,
            totalTrailerCount: 0,

            /* SEARCH */
            search_input: null,
            search_selected: 'PlateNo',
            search_options: [
                { value: 'PlateNo', text: 'Plate No' },
                { value: 'VIN', text: 'VIN' },
                { value: 'PartsNo', text: 'Parts No' },
                { value: 'DealerCode', text: 'Dealer Code' },
                { value: 'Origin', text: 'Origin' },
                { value: 'Destination', text: 'Destination' },
            ],

             Notrailer:'Can not find the trailer matching search value.',

            timeOut:null,
            userRole: null,
        }
    },
    created() {
        this.getTrailerCount();
        this.calculateMapSize();
    },
    mounted(){
      const token = window.sessionStorage.getItem('Dorothy-Auth-Token');
      this.userRole = this.$jwt.decode(token).jti;

        if(this.$route.params.status =='total'){
            this.showTotalTrailer();
        }else{
            this.showTransitTrailer();
        }
    },
    beforeDestroy(){
        clearTimeout(this.timeOut)
    },
    watch: {
        markers(markers) {
            if (markers.length > 2) {
                const bounds = new google.maps.LatLngBounds();
                for (let m of markers) {
                    bounds.extend(m.latLng)
                }
                this.$refs.map.fitBounds(bounds)
            }
        }
    },
    computed: {
        computedMapSize() {
            return {
                width: this.mapSize.width + '%',
                height: this.mapSize.height + 'rem'
            }
        }
    },
    methods: {
        showInfoAlert(textMessage) {
            this.$swal({
                title: 'Info',
                text: textMessage,
                confirmButtonText: 'OK'
            });
        },
        showErrorAlert(status) {
            this.$swal({
                title: 'Error',
                text: status,
                confirmButtonText: 'OK'
            });
        },
        showTotalTrailer() {
            clearTimeout(this.timeOut);
            this.markers = [];
            this.getTransitTrailer();
            this.getTotalTrailer();
            if (this.userRole !== "DEALER") {
              this.getShippingDeparture();
            }

            this.timeOut = setTimeout(this.showTotalTrailer, 30*60*1000);
        },
        showTransitTrailer() {
            clearTimeout(this.timeOut);
            this.markers = [];
            this.clearSearchInput();
            this.getTransitTrailer();
            if (this.userRole !== "DEALER") {
              this.getShippingDeparture();
            }

            this.timeOut = setTimeout(this.showTransitTrailer, 30*60*1000);
        },
        showSearchTrailer(){
            clearTimeout(this.timeOut);
             this.markers = [];
             this.searchByOption();

             this.timeOut = setTimeout(this.showSearchTrailer, 30*60*1000);
        },
        markerClickEvent(plateNo) {
            if (typeof plateNo !== 'undefined'){
                this.$refs.detail.toggle(plateNo);
            }
        },
        getTotalTrailer(){

            this.loadingShow = true;
            this.$axios.get('/api/map/total')
            .then((response) => {
                this.loadingShow = false;
                console.log(response);
                this.totalTrailerCount = response.data.resultBody.trailerCount;

                const position = new Array();
                const plateNo = new Array();

                for(var i in response.data.resultBody.trailers){

                    position[i]={
                        lat: response.data.resultBody.trailers[i].lastLatitude,
                        lng: response.data.resultBody.trailers[i].lastLongitude,
                    };

                    plateNo[i] = response.data.resultBody.trailers[i].plateNo;

                    this.markers.push({
                        latLng: position[i],
                        plateNo: plateNo[i],
                        title: 'Plate No : '+plateNo[i],
                        icon: {
                            url: require('../../../assets/png/icn_trailer_br.png'),
                            scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                        } 
                    });
                }
            })
            .catch((ex)=> {
                this.loadingShow = false;
                console.log(ex);
                this.showErrorAlert(ex.response.status);
            })
        },
        getTransitTrailer(){

            this.loadingShow = true;
            this.$axios.get('/api/map/transit')
            .then((response) => {
                this.loadingShow = false;
                console.log(response);
                this.transitTrailerCount = response.data.resultBody.trailerCount;

                const position = new Array();
                const plateNo = new Array();
                
                for(var i in response.data.resultBody.trailers){

                    position[i]={
                        lat: response.data.resultBody.trailers[i].lastLatitude,
                        lng: response.data.resultBody.trailers[i].lastLongitude,
                    }

                    plateNo[i] = response.data.resultBody.trailers[i].plateNo;

                    this.markers.push({
                        latLng: position[i],
                        plateNo: plateNo[i],
                        title:'Plate No : '+plateNo[i],
                        icon: {
                            url: require('../../../assets/png/icn_trailer_bl.png'),
                            scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                        } 
                    });
                }
            })
            .catch((ex)=> {
                this.loadingShow = false;
                console.log(ex);
                this.showErrorAlert(ex.response.status);
            })
        },
        getTrailerCount(){

            this.$axios.get('/api/map/count')
            .then((response) => {
                console.log(response);

                this.totalTrailerCount = response.data.resultBody.totalCount;
                this.transitTrailerCount = response.data.resultBody.transitCount;

            })
            .catch((ex)=> {
                console.log(ex);
                this.showErrorAlert(ex.response.status);
            })

        },
        searchByOption(){

            if(this.search_input == ''){
                this.showTransitTrailer();
            }else{
                this.loadingShow = true;
                this.$axios.get('/api/map/search', {
                    params: { selected: this.search_selected, input: this.search_input }
                })
                .then((response) => {
                    console.log(response);
                    this.loadingShow = false;
                    const position = new Array();
                    const plateNo = new Array();
                    
                    for(var i in response.data.resultBody){

                        position[i]={
                            lat: response.data.resultBody[i].lastLatitude,
                            lng: response.data.resultBody[i].lastLongitude,
                        }

                        plateNo[i]=response.data.resultBody[i].plateNo;

                        if(response.data.resultBody[i].drivingStatus == '1'){

                            this.markers.push({
                            latLng: position[i],
                            plateNo: plateNo[i],
                            title: 'Plate No : '+plateNo[i],
                            icon: {
                                    url: require('../../../assets/png/icn_trailer_bl.png'),
                                    scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                                } 
                            });

                        }else{

                            this.markers.push({
                            latLng: position[i],
                            plateNo: plateNo[i],
                            title: 'Plate No : '+plateNo[i],
                            icon: {
                                    url: require('../../../assets/png/icn_trailer_br.png'),
                                    scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                                } 
                            });

                        }
                    this.center = position[i];
                    this.zoom = 8;
                    }

                    if(response.data.resultBody.length == 0){
                        this.showInfoAlert(this.Notrailer);
                    }
                })
                .catch((ex)=> {
                    console.log(ex); 
                    this.loadingShow = false;
                    this.showErrorAlert(ex.response.status);
                })
            }

        },
        clearSearchInput(){
            this.search_selected = 'PlateNo';
            this.search_input = '';
            this.zoom = 5;
        },
        getShippingDeparture(){
            this.$axios.get('/api/map/departure')
            .then((response) => {
                console.log(response);
                const position = new Array();
                const departureCode = new Array();

                for(var i in response.data.resultBody){

                    position[i]={
                        lat: response.data.resultBody[i].latitude,
                        lng: response.data.resultBody[i].longitude,
                    };

                    departureCode[i] = response.data.resultBody[i].departureCode;
                    
                    if(response.data.resultBody[i].companyId=='1001' || response.data.resultBody[i].companyId=='1002'){

                        this.markers.push({
                            latLng: position[i],
                            title: '* '+departureCode[i],
                            icon: {
                                url: require('../../../assets/png/icn_factory.png'),
                                scaledSize: {width: 64, height: 64, f: 'px', b: 'px',},
                            } 
                       });

                    }else{

                        this.markers.push({
                            latLng: position[i],
                            title: '* '+departureCode[i],
                            icon: {
                                url: require('../../../assets/png/icn_storage.png'),
                                scaledSize: {width: 64, height: 64, f: 'px', b: 'px',},
                            } 
                       });
                
                    }
                }

            })
            .catch((ex)=> {
                console.log(ex);
                this.showErrorAlert(ex.response.status);
            })
        },
        calculateMapSize() {
            const availWidth = screen.availWidth;
            const availHeight = screen.availHeight;

            if ( availWidth >= 1900 ) { this.mapSize.height = 65 }
            else if ( availWidth >= 1500 ) { this.mapSize.height = 58 }
            else if ( availWidth < 1500 && availWidth >= 1300 ) { this.mapSize.height = 35 }
            else { this.mapSize.height = 48 }
        },
    }
};
</script>

<style src="./Map.scss" lang="scss" scoped />
