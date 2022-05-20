<template>
<div>
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
                <b-button variant="default" class="map-total-count" size="md" @click="goToMapTotal">    
                    <img  src="../../../assets/png/icn_truck_br.png" alt="" class="truckCount"/>  &nbsp;&nbsp;Total &nbsp; 
                    <span class='fw-semi-bold'> {{totalTrailerCount.toLocaleString()}} </span>   
                </b-button>    
                <b-button variant="default" class="map-transit-count" size="md" @click="goToMapTransit">    
                   <img  src="../../../assets/png/icn_truck_bl.png" alt="" class="truckCount"/>  &nbsp;&nbsp;Transit &nbsp; 
                   <span class='fw-semi-bold'> {{transitTrailerCount.toLocaleString()}} </span>
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
                <b-form-input placeholder="" v-model="search_input" maxlength="30"  @keyup.enter="showSearchTrailer()"/>    
                <b-input-group-append>    
                     <b-button variant="default" class="mr-xs" size="md" @click="showSearchTrailer()">Search</b-button>
                </b-input-group-append>    
                </b-input-group>    
        </b-col>   
        
    </b-row>
    <b-row v-bind:style="computedMapSize">
     <GmapMap v-bind:style="computedMapSize"  :zoom="zoom" :center="center" ref="map">    
                <GmapPolyline :path.sync="this.path" :options="{ strokeColor:'#E65442'}" />
                <GmapMarker v-for="(marker, index) in markers" :key="index" :icon="marker.icon" :position="marker.latLng"
                 :clickable="true" :title="marker.title" :plateNo="marker.plateNo" :gpsDtm="marker.gpsDtm" 
                 @click="markerClickEvent(marker,index)" />  
                <GmapInfoWindow :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false">  
                     <div class="infoContent" v-html="infoContent"></div>
                </GmapInfoWindow>
        </GmapMap> 
    </b-row>
<b-row class="widget-middle-overflow">
     <div class="export-button">
          <download-excel
            class   = "btn btn-outline-default"
            :data   = "vehicles"
            worksheet = "RouteAnalysis"
            type    = "csv"
            :fields ="excel_fields"
            name    = "RouteAnalysis.csv">
            EXPORT EXCEL
          </download-excel>
        </div>
    <v-client-table class="trailerTableClass" :data="vehicles" :columns="vehicleColumns" :options="vehicleOptions">
    </v-client-table>
</b-row>
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
            transitTrailerCount: 0,
            totalTrailerCount: 0,
            /* SEARCH */
            search_input: null,
            search_selected: 'PlateNo',
            search_options: [
                { value: 'PlateNo', text: 'Plate No' },
                { value: 'Destination', text: 'Destination' },
                { value: 'States', text: 'States' },
                { value: 'DealerCode', text: 'Dealer Code' },
                { value: 'TransporterCode', text: 'Transporter Code' },
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
                    width: -1,
                    height: -15
                }
            },
            /* DATE PICKER */
            datepickerText: [new Date(), new Date()],
            datepicketFormat: 'DD MMM, YYYY',
            notBefore: this.subtractMonth(new Date()),
                  vehicleOptions: {
                filterByColumn: true,
                perPage: 10,
                perPageValues: [],
                pagination: { chunk: 5, dropdown: false },
                orderBy:{ ascending:true},
                skin: 'table table-striped',
                // filterable: ['plate_no', 'ti_no', 'departure_date', 'eta', 'destination', 'location', 'status'],
                texts:{
                    filterBy: "Search by...",
                    defaultOption: "ALL",
                },
            },
            vehicleColumns: ['destination','transporters_name','plate_number','departure_date','arrival_date','gps_distance','transit_days','no_of_tolls','toll_charges','state_borders_crossed'],
            vehicles: [{
                destination: 'Rajasthan',
                transporters_name: 'KMT',
                plate_number: 'NL01AA4521',
                departure_date: '10-04-2022',
                arrival_date: '18-04-2022',
                gps_distance: '1200',
                transit_days: '7',
                no_of_tolls: '15',
                toll_charges: '4500',
                state_borders_crossed: '5',
            },
            {
                destination: 'Rajasthan',
                transporters_name: 'RSAI',
                plate_number: 'NL01AB1921',
                departure_date: '14-04-2022',
                arrival_date: '22-04-2022',
                gps_distance: '2300',
                transit_days: '15',
                no_of_tolls: '22',
                toll_charges: '8500',
                state_borders_crossed: '8',
            }],
                  /* EXCEL */
      excel_fields: {
        'DESTINATION': 'destination',
        'TRANSPORTER NAME' : 'transporters_name',
        'PLATE NO': 'plate_number',
        'DEPARTURE DATE': 'departure_date',
        'ARRIVAL DATE': 'arrival_date',
        'GPS DISTANCE': 'gps_distance',
        'TRANSIT DAYS': 'transit_days',
        'NO OF TOLLS': 'no_of_tolls',
        'TOLL CHARGES': 'toll_charges',
        'STATE BORDERS CROSSED': 'state_borders_crossed',
      },
        }
    },
    created() {
        this.getTrailerCount();
        this.calculateMapSize();
    },
    mounted(){
        this.getShippingDeparture();
        if(this.$route.params.plateNo){
              this.getParamsFromMap();
        }
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
            const notBeforeDate =  this.subtractMonth(date[1]);
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
            }else{
                if (typeof marker.plateNo !== 'undefined'){
                    this.$refs.detail.toggle(marker.plateNo);
                }
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
        showSearchTrailer(){
            this.markers = [];
            this.path = [];
            this.searchByOption();
        },
        getTrailerCount(){
            this.loadingShow = true;

            this.$axios.get('/api/map/count')
            .then((response) => {
                console.log(response);
                this.loadingShow = false;
                this.totalTrailerCount = response.data.resultBody.totalCount;
                this.transitTrailerCount = response.data.resultBody.transitCount;
            })
            .catch((ex)=> {
                console.log(ex);
                this.loadingShow = false;
                this.showErrorAlert(ex.response.status);
            })
        },
        getParamsFromMap(){
            const depDate = this.$route.params.depDate;
            this.search_input = this.$route.params.plateNo;
            this.search_selected = 'PlateNo';
            this.datepickerText=[this.parseDateforDepDate(depDate), new Date()];

            this.searchByOption();
        },
        searchByOption(){

            if(this.search_input == ''){

                this.clear();

            }else{
                this.loadingShow = true;
                this.getShippingDeparture();
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
            this.$refs.detail.clearTrailerDetail();
            this.getShippingDeparture();
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
                            latLng  :position[i],
                            title   : '* '+departureCode[i],
                            icon: {
                                url: require('../../../assets/png/icn_factory.png'),
                                scaledSize: {width: 64, height: 64, f: 'px', b: 'px',},
                            } 
                       });

                    }else{

                        this.markers.push({
                            latLng  :position[i],
                            title   : '* '+departureCode[i],
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
        getTrailerPaths(plateNo){
            this.loadingShow = true;
            this.path = [];
            this.$axios.get('/api/playback/getPaths', {
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
            this.$refs.detail.toggle(this.searchPlateNo);
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
        goToMapTotal(){
            this.$root.$router.push({
                name: 'MapPage', 
                params: { status: 'total' }
            });  
        },
        goToMapTransit(){
             this.$root.$router.push({
                name: 'MapPage', 
            });  
        }
    },
};
</script>

<style src="./RouteAnalysis.scss" lang="scss" scoped />
