<template>
<div>
    <b-row>    
        <b-col lg="2">    
            <h4 class="page-title">    
                <span>Domestic Playback</span>    
            </h4>  
        </b-col> 
    </b-row>

    <b-row class="map-header">    
        <b-col xs="4" md="4"> 
            <b-input-group-append class="map-count">    
                <b-button variant="default" class="map-transit-count" size="md" @click="goToMap">    
                   <img  src="../../../assets/png/icn_truck_bl.png" alt="" class="truckCount" />  &nbsp;&nbsp;Total&nbsp; 
                   <span class='fw-semi-bold'> {{domesticTrailerCount.toLocaleString()}} </span>
                </b-button>  
            </b-input-group-append>
        </b-col> 

        <b-col lg="2" offset-lg="2" >  
           <DatePicker lang="en" v-model="datepickerText" :format="datepicketFormat" range input-class="form-control" width="220" :shortcuts="shortcuts" :not-before="notBefore">
                <i class="glyphicon glyphicon-glyph-calendar" slot="calendar-icon" />
            </DatePicker>
        </b-col>   
    
        <b-col lg="4" >    
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
            <GmapPolyline :path.sync="this.path" :options="{ strokeColor:'#E65442'}" />
            <GmapMarker v-for="(marker, index) in markers" :key="index" :icon="marker.icon" :position="marker.latLng"
                :clickable="true" :title="marker.title" :plateNo="marker.plateNo" :gpsDtm="marker.gpsDtm"
                @click="markerClickEvent(marker,index)" />  
            <GmapInfoWindow :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false">  
                <div class="infoContent" v-html="infoContent"></div>
            </GmapInfoWindow>
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
import DatePicker from 'vue2-datepicker';

export default {
    name: 'DomesticPlaybackPage',
    components: { Widget, DatePicker },
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
            path: [],
            searchPlateNo: null,
            /* COUNT */
            domesticTrailerCount: 0,
            /* SEARCH */
            search_input: null,
            search_selected: 'PlateNo',
            search_options: [
                { value: 'PlateNo', text: 'Plate No' },
            ],
            /* INFOWINDOW */
            infoContent: '',
            infoWindowPos: {
                lat: 0,
                lng: 0
            },
            infoWinOpen: false,
            infoOptions: {
                pixelOffset: {
                    width: 0,
                    height: 0
                }
            },
            /* DATE PICKER */
            datepickerText: [new Date(), new Date()],
            datepicketFormat: 'DD MMM, YYYY',
            notBefore: this.subtractMonth(new Date()),
            shortcuts:'',
            /* ALERT */
            NoGPSData:'GPS data does not exist during that period.',
            Notrailer:'Can not find the trailer matching search value.'
        }
    },
    created() {
        this.getTrailerCount();
        this.calculateMapSize();
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
        },
        datepickerText(date){
            const notBeforeDate = this.subtractMonth(date[1]);
            this.notBefore = this.parseDate(notBeforeDate);

            if(date[0] < notBeforeDate){
                this.datepickerText[0] = notBeforeDate;
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
    mounted(){
        if(this.$route.params.plateNo){
              this.getParamsFromMap();
        }
    },
    methods: {
        parseDate(date) {
            return this.$moment(date,'YYYYMMDDHHmmss').format('DD MMM, YYYY')
        },
        parseDateforSearch(date) {
            return this.$moment(date,'L').format('YYYYMMDD')
        },
        parseDateforInfoWindow(date) {
            return this.$moment(date,'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss')
        },
        parseDateforDepDate(date) {
            return  this.$moment(date,'YYYYMMDDHHmmss').format('L');
        },
        markerClickEvent(marker,idx) {
            if (typeof marker.gpsDtm !== 'undefined'){
                this.toggleInfoWindow(marker,idx);     
            }else if (typeof marker.plateNo !== 'undefined'){  
              this.toggleInfoWindowForTrailer(marker,idx);
            }
        },
        subtractMonth(date){
            return this.$moment(date,'YYYYMMDDHHmmss').subtract(1,'month').toDate();
        },
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
        toggleInfoWindow: function (marker, idx) {

            this.infoOptions.pixelOffset.width = -1;
            this.infoOptions.pixelOffset.height= -15;

            this.infoWindowPos = marker.latLng;
            this.infoContent = this.parseDateforInfoWindow(marker.gpsDtm);
            
            if (this.currentMidx == idx) {
                this.infoWinOpen = !this.infoWinOpen;
            }
            else {
                this.infoWinOpen = true;
                this.currentMidx = idx;
            }
          
        },
        toggleInfoWindowForTrailer: function (marker, idx) {

            this.infoOptions.pixelOffset.width = -1;
            this.infoOptions.pixelOffset.height= -40;

            const contentString='<div style="font-weight:500;">PLATE NO</div>'+marker.plateNo;

            this.infoWindowPos = marker.latLng;
            this.infoContent = contentString;
            
            if (this.currentMidx == idx) {
                this.infoWinOpen = !this.infoWinOpen;
            }
            else {
                this.infoWinOpen = true;
                this.currentMidx = idx;
            }
        },
        showSearchTrailer(){
            this.markers = [];
            this.path = [];
            this.searchByOption();
        },
        getTrailerCount(){
            this.loadingShow = true;

            this.$axios.get('/api/domesticMap/count')
            .then((response) => {
                console.log(response);
                this.loadingShow = false;
                this.domesticTrailerCount = response.data.resultBody;
            })
            .catch((ex)=> {
                console.log(ex);
                this.loadingShow = false;
                this.showErrorAlert(ex.response.status);
            })
        },
        getParamsFromMap(){
            this.search_input = this.$route.params.plateNo;
            this.search_selected = 'PlateNo';

            this.searchByOption();
        },
        searchByOption(){
            this.infoWinOpen = false;
            if(this.search_input == ''){
                this.clear();
            }else{
                this.loadingShow = true;
                this.$axios.get('/api/domesticMap/search', {
                    params: { selected: this.search_selected, input: this.search_input }
                })
                .then((response) => {
                    console.log(response);
                    const trailers = response.data.resultBody;
                    this.loadingShow = false;
                    const position = new Array();
                    const plateNo = new Array();
                    const containerNo = new Array();
                    
                    for(var i in trailers){

                        position[i]={
                            lat: trailers[i].lastLatitude,
                            lng: trailers[i].lastLongitude,
                        }

                        plateNo[i]=trailers[i].plateNo;

                        this.markers.push({
                        latLng: position[i],
                        plateNo: plateNo[i],
                        icon: {
                                url: require('../../../assets/png/icn_trailer_bl.png'),
                                scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                            } 
                        });

                        this.searchPlateNo = response.data.resultBody[0].plateNo;
                        this.center = position[i];
                        this.zoom = 10;
                    }

                    if(response.data.resultBody.length == 0){
                        this.showInfoAlert(this.Notrailer);
                        
                    }else{
                        this.getTrailerPaths(this.searchPlateNo);
                    }

                })
                .catch((ex)=> {
                    console.log(ex); 
                    this.loadingShow = false;
                    this.showErrorAlert(ex.response.status);
                })
            }
        },
        clear(){
            this.search_selected = 'PlateNo';
            this.search_input = '';
            this.zoom = 5;
            this.marker = [];
            this.path = [];
        },
        getTrailerPaths(plateNo){

        console.log(plateNo)
        console.log(this.datepickerText[0],"~",this.datepickerText[1] );

            this.loadingShow = true;
            this.path = [];
            this.$axios.get('/api/domesticPlayback/getPaths', {
                params: { plateNo: plateNo, startDate: this.parseDateforSearch(this.datepickerText[0]), endDate: this.parseDateforSearch(this.datepickerText[1]) }
            })
            .then((response) => {
                console.log(response);
                this.loadingShow = false;
                const position = new Array();

                for(var i in response.data.resultBody){

                    position[i]={
                        lat: response.data.resultBody[i].latitude,
                        lng: response.data.resultBody[i].longitude,
                    };

                    this.markers.push({
                        latLng  :position[i],
                        icon: {
                            url: require('../../../assets/png/icn_location.png'),
                            scaledSize: {width: 20, height: 20, f: 'px', b: 'px',},
                        },
                        gpsDtm: response.data.resultBody[i].gpsDateTime
                    });

                    this.path.push({
                        lat: response.data.resultBody[i].latitude,
                        lng: response.data.resultBody[i].longitude,
                    });
                }

                if(response.data.resultBody.length==0){
                    this.showInfoAlert(this.NoGPSData);
                }
            })
            .catch((ex)=> {
                console.log(ex);
                this.loadingShow = false;
                this.showErrorAlert(ex.response.status);
            })

            this.searchPlateNo=null;
        },
        calculateMapSize() {
            const availWidth = screen.availWidth;
            const availHeight = screen.availHeight;

            if ( availWidth >= 1900 ) { this.mapSize.height = 64 }
            else if ( availWidth >= 1500 ) { this.mapSize.height = 58 }
            else if ( availWidth < 1500 && availWidth >= 1300 ) { this.mapSize.height = 35 }
            else { this.mapSize.height = 48 }
        },
        goToMap(){
             this.$root.$router.push({
                name: 'DomesticMapPage', 
            });  
        }
    },
};
</script>

<style src="./DomesticPlayback.scss" lang="scss" scoped />
