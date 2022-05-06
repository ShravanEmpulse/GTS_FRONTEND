<template>
<div>
    <b-row>    
        <b-col lg="2">    
            <h4 class="page-title">    
                <span>Genisys Tracking Map</span>    
            </h4>    
        </b-col> 
    </b-row>

    <b-row class="map-header">
        <b-col xs="4" md="4"> 
            <b-input-group-append class="map-count">    
                <b-button variant="default" class="map-transit-count" size="md" @click="showTransitTrailer">    
                   <img  src="../../../assets/png/icn_truck_bl.png" alt="" class="truckCount"/>  &nbsp;&nbsp;Transit&nbsp; 
                   <span class='fw-semi-bold'> {{transitContainerTrailerCount.toLocaleString()}} </span>
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
                 :clickable="true" :plateNo="marker.plateNo"  :containerNo="marker.containerNo"
                 @click="markerClickEvent(marker,index)" />  
                <GmapInfoWindow :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false" :infoMarker="infoMarker">  
                     <div>
                        <div class="infoContent" v-html="infoContent" ></div>
                        <a class="btn btn-warning btn-sm" id="playbackBtn" @click="goToPlayback(infoMarker.plateNo)">PLAYBACK</a>
                     </div>
                </GmapInfoWindow>   
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
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import vSelect from 'vue-select';

export default {
    name: 'GenisysMapPage',
    components: { Widget, GmapCluster, vSelect },
    data() {
        return {
            /* LOADING */
            loadingShow: false,
            loadingLabel: 'Loading...',
            /* MAP */
            center: { lat: 21.207, lng: 78.777 },
            zoom: 4,
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
            /* INFOWINDOW */
            infoContent: '',
            infoWindowPos: {
                lat: 0,
                lng: 0
            },
            infoMarker: [],
            infoWinOpen: false,
            infoOptions: {
                pixelOffset: {
                    width: -1,
                    height: -40
                }
            },
            /* COUNT */
            transitContainerTrailerCount: 0,
            /* SEARCH */
            search_input: null,
            search_selected: 'ContainerNo',
            search_options: [
                { value: 'ContainerNo', text: 'Container No' },
                { value: 'PlateNo', text: 'Plate No' },
            ],

            Notrailer:'Can not find the trailer matching search value.'
        }
    },
    created() {
        this.getTrailerCount();
        this.calculateMapSize();
    },
    mounted(){
        this.getTransitTrailer();
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
        showTransitTrailer() {
            this.markers = [];
            this.clearSearchInput();
            this.getTransitTrailer();
        },
        showSearchTrailer(){
             this.markers = [];
             this.searchByOption();
        },
        markerClickEvent(marker,idx) {
            if (typeof marker.plateNo !== 'undefined'){  
              this.toggleInfoWindow(marker,idx);
            }
        },
        toggleInfoWindow: function (marker, idx) {

            const contentString='<div style="font-weight:500;">PLATE NO</div>'+marker.plateNo+'<div style="font-weight:500;">CONTAINER NO</div>'+marker.containerNo;
            
            this.infoWindowPos = marker.latLng;
            this.infoContent = contentString;
            
            if (this.currentMidx == idx) {
                this.infoWinOpen = !this.infoWinOpen;
            }
            else {
                this.infoWinOpen = true;
                this.currentMidx = idx;
            }

            this.infoMarker = marker;
        },
        getTrailerCount(){
            this.$axios.get('/api/genisysMap/count')
            .then((response) => {
                console.log(response);
                this.transitContainerTrailerCount = response.data.resultBody;
            })
            .catch((ex)=> {
                console.log(ex);
            })
        },
        getTransitTrailer(){
            this.loadingShow = true;
            this.$axios.get('/api/genisysMap/transit')
            .then((response) => {
                this.loadingShow = false;
                console.log(response);
                const trailers = response.data.resultBody;

                 const position = new Array();
                 const plateNo = new Array();
                 const containerNo = new Array();
                
                for(var i in trailers){

                    position[i]={
                        lat: trailers[i].lastLatitude,
                        lng: trailers[i].lastLongitude,
                    }

                    plateNo[i] = trailers[i].plateNo;
                    containerNo[i] = trailers[i].containerNo;

                     this.markers.push({
                        latLng: position[i],
                        plateNo: plateNo[i],
                        containerNo: containerNo[i],
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
            })
        },
        searchByOption(){
            this.infoWinOpen = false;
            if(this.search_input == ''){
                this.showTransitTrailer();
            }else{
                this.loadingShow = true;
                this.$axios.get('/api/genisysMap/search', {
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
                        containerNo[i] = trailers[i].containerNo;
                        
                        this.markers.push({
                        latLng: position[i],
                        plateNo: plateNo[i],
                        containerNo: containerNo[i],
                        icon: {
                                url: require('../../../assets/png/icn_trailer_bl.png'),
                                scaledSize: {width: 45, height: 45, f: 'px', b: 'px',},
                            } 
                        });

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
                })
            }
        },
        clearSearchInput(){
            this.search_selected = 'ContainerNo';
            this.search_input = '';
            this.zoom = 4;
        },
        calculateMapSize() {
            const availWidth = screen.availWidth;
            const availHeight = screen.availHeight;

            if ( availWidth >= 1900 ) { this.mapSize.height = 65 }
            else if ( availWidth >= 1500 ) { this.mapSize.height = 58 }
            else if ( availWidth < 1500 && availWidth >= 1300 ) { this.mapSize.height = 35 }
            else { this.mapSize.height = 48 }
        },
        goToPlayback(plateNo){
            this.$root.$router.push({
                name: 'GenisysPlaybackPage', 
                params: { plateNo: plateNo }
            });  
        }
    }
};

</script>


<style src="./GenisysMap.scss" lang="scss" scoped />