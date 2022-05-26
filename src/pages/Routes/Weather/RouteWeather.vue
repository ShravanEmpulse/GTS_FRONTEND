<template>
<div>
    <b-row>
        <b-col lg="2">
            <h4 class="page-title">
                <span>Route Weather</span>
            </h4>
        </b-col>
        <b-col>
            <b-input-group class="input-base">
                <b-form-input></b-form-input>
                <b-input-group-append>
                    <span class="input-group-text"><i class="fa fa-search fa-lg"></i></span>
                </b-input-group-append>
            </b-input-group>
        </b-col>
        <b-col>
            <DateRangePicker />
        </b-col>
        <b-col class="right-align">
            <b-dropdown id="dropdown-right" right text="Select Route" class="m-2">
                <b-dropdown-item href="#">Action</b-dropdown-item>
                <b-dropdown-item href="#">Another action</b-dropdown-item>
                <b-dropdown-item href="#">Something else here</b-dropdown-item>
            </b-dropdown>
        </b-col>
    </b-row>
    <b-row>
        <b-col cols="8" v-bind:style="computedMapSize">
            <GmapMap v-bind:style="computedMapSize" :zoom="6" :center="{
                lat: 21.207,
                lng: 78.777
            }" ref="map">
                <GmapPolyline :path.sync="this.path" :options="{ strokeColor:'#E65442'}" />
                <GmapMarker v-for="(marker, index) in markers" :key="index" :icon="marker.icon" :position="marker.latLng" :clickable="true" :title="marker.title" :plateNo="marker.plateNo" :gpsDtm="marker.gpsDtm" @click="markerClickEvent(marker,index)" />
                <GmapInfoWindow :options="infoOptions" :position="infoWindowPos" :opened="infoWinOpen" @closeclick="infoWinOpen=false">
                    <div class="infoContent" v-html="infoContent"></div>
                </GmapInfoWindow>
            </GmapMap>
        </b-col>
        <b-col class="weather-details">
            <div>
                <h3>Weather in Degrees</h3>
                <b-row class="weather-row">
                    <b-col><i class="las la-cloud-sun-rain"></i></b-col>
                    <b-col>
                        <p>22°</p>
                    </b-col>
                    <b-col cols="10">
                        <p>: Rain</p>
                    </b-col>
                </b-row>
                <b-row class="weather-row">
                    <b-col><i class="las la-cloud-sun"></i></b-col>
                    <b-col>
                        <p>23°</p>
                    </b-col>
                    <b-col cols="10">
                        <p>: Mostly Cloudy</p>
                    </b-col>
                </b-row>
                <b-row class="weather-row">
                    <b-col><i class="las la-cloud-showers-heavy"></i></b-col>
                    <b-col>
                        <p>25°</p>
                    </b-col>
                    <b-col cols="10">
                        <p>: Scattered T-Storms</p>
                    </b-col>
                </b-row>
                <b-row class="weather-row">
                    <b-col><i class="las la-cloud-rain"></i></b-col>
                    <b-col>
                        <p>21°</p>
                    </b-col>
                    <b-col cols="10">
                        <p>: Light Rain</p>
                    </b-col>
                </b-row>
            </div>
            <div>
                <h3>Today and Week Weather</h3>
                <div class="week-weather">
                    <div class="header">MONDAY</div>
                    <b-row class="main-section">
                        <b-col>
                            <i class="las la-cloud-sun"></i>
                            <p>Partly Cloudy</p>
                        </b-col>
                        <b-col>
                            <h1>25°</h1>
                            <p>Feels Like 22°</p>
                        </b-col>
                        <b-col>
                            <div class="trend-section">
                                <p>
                                    <i class="las la-angle-down"></i>
                                    20°
                                </p>
                                <p>
                                    <i class="las la-angle-up"></i>
                                    27°
                                </p>
                            </div>
                            <div class="trend-section trend-section-bottom">
                                <p>Wind: 6km/h</p>
                                <p><i class="las la-tint"></i>
                                    72%</p>
                            </div>
                        </b-col>
                    </b-row>
                    <hr>
                    <b-row class="footer">
                        <p>
                            Tue
                            <i class="las la-cloud-showers-heavy"></i>
                            20°
                        </p>
                        <p>
                            Wed
                            <i class="las la-cloud-sun"></i>
                            20°
                        </p>
                        <p>
                            The
                            <i class="las la-sun"></i>
                            20°
                        </p>
                    </b-row>
                </div>
                <b-row class="weather-bottom-section">
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>MON</p>
                        <i class="las la-cloud-showers-heavy"></i>
                        <p>+05°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                    <b-col class="card">
                        <p>SUN</p>
                        <i class="las la-sun"></i>
                        <p>+20°C</p>
                    </b-col>
                </b-row>
            </div>
        </b-col>
    </b-row>
</div>
</template>

<script>
import DateRangePicker from '../../../components/DatePicker/DateRangePicker.vue'

export default {
    components: {
        DateRangePicker
    },
    computed: {
        computedMapSize() {
            return {
                width: '100%',
                height: '62rem'
            }
        }
    }
}
</script>

<style lang="scss">
$background: rgba($color: #ffffff, $alpha: 0.2);

.input-group {
    input {
        background-color: $background;
        border: none;
    }

    input:focus {
        background: #ffffff;
    }
}

.input-group-append {
    span {
        background-color: $background;
        border: none;
        color: #ffffff;
    }
}

.dropdown-toggle {
    background: $background;
    border: none;
}

.right-align {
    text-align: right;
}

.weather-details {
    width: 100%;
    height: 100%;
    background-color: #36455a;
    padding: 16px;

    h3 {
        padding: 6px;
    }

    .weather-row {
        font-size: larger;
        padding: 6px 12px;

        i {
            font-size: 26px;
        }
    }

    .week-weather {
        background-color: #799cbf;

        .header {
            background-color: #4f7397;
            padding: 14px;
            font-size: larger;
            font-weight: bold;
        }

        .main-section {
            text-align: center;
            font-size: 28px;

            i {
                font-size: 128px;
            }

            h1 {
                font-size: 100px;
            }

            .trend-section {
                padding: 8px;
                display: flex;
                justify-content: space-around;
                font-size: 18px;

                i {
                    font-size: 24px;
                }
            }

            .trend-section-bottom {
                margin-top: 30px;
                display: block;
                text-align: left;
            }

        }

        .footer {
            display: flex;
            justify-content: space-around;

            p {
                background: #4f7397;
                padding: 12px;
                font-size: 22px;
                font-weight: 400;
            }
        }
    }

    .weather-bottom-section {
        padding: 8px;
        text-align: center;

        .card {
            font-weight: 500;
            font-size: 18px;
            margin: 2px;
            padding: 6px;
            background: #00a2ff88;

            i {
                font-size: 36px;
            }
        }
    }
}
</style>
