<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Domestic Trailer</span>    
    </h4> 
    <Widget
      title="<h4></h4>"
      customHeader
      >
      <div class="widget-middle-overflow">

        <div class="export-button">
          <download-excel
            class   = "btn btn-outline-default"
            :data   = "exportData"
            worksheet = "DomesticTrailer"
            type    = "csv"
            :fields ="excel_fields"
            name    = "DomesticTrailer.csv">
            EXPORT EXCEL
          </download-excel>
        </div>
        <v-client-table class="trailerTableClass" ref="trailerTable" :data="tableData" :columns="trailerColumns" :options="trailerOptions">
           <b-button slot="status" slot-scope="props" :variant="props.row.status[0].type" class="trailer-status" >{{props.row.status[0].title}}</b-button>
        </v-client-table>
      </div>
    </Widget>

    <loading
      :show="loadingShow"
      :label="loadingLabel"
      loader-class="loading">
    </loading>
  
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';

export default {
  name: 'DomesticTrailer',
  components: { Widget },
  data() {
    return {
      role: '',
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
      /* TABLE */
      tableData: [],
      trailerColumns: ['plate_no', 'gps_provider', 'tp_vendor', 'latitude', 'longitude', 'gps_receive_time','status'],
      trailerOptions: {
        filterByColumn: true,
        perPage: 10,
        perPageValues: [],
        pagination: { chunk: 5, dropdown: false },
        skin: 'table table-striped',
        filterable: [ 'plate_no',  'gps_provider', 'tp_vendor', 'latitude', 'longitude', 'gps_receive_time', 'status' ]
      },
      
      /* EXCEL */
      excel_fields: {
        'PLATE NO': 'plate_no',
        'GPS PROVIDER' : 'gps_provider',
        'TP VENDOR': 'tp_vendor',
        'LATITUDE': 'latitude',
        'LONGITUDE': 'longitude',
        'GPS RECEIVE TIME': 'gps_receive_time',
        'STATUS': {
          field:'status',
          callback:(value)=>{
            return value[0].title;
          }
        },
      },

      trailerDestination: [],
      detailPlateNo: '',
    };
  },
  created() {
    this.getTrailer();
  },
  computed: {
    exportData(){
      if(typeof this.$refs.trailerTable !== 'undefined'){
        return this.$refs.trailerTable.allFilteredData;
      }else{
        return this.tableData;
      }
    }
  },
  methods: {
    parseDateforLastGpsReceiveTime(date) {
        if(date == null || date=='' ){
          return '';
        }else{
          return  this.$moment(date,'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
        }
    },
    showErrorAlert(errorCode) {
      this.$swal({
          title: 'Error',
          text: errorCode,
          confirmButtonText: 'OK'
      });
    },
    getTrailer(){
        this.tableData = [];
        this.loadingShow = true;

        this.$axios.get('/api/domesticTrailer/trailerList')
        .then((response) => {
          console.log(response);
          this.loadingShow = false;
          const data = response.data.resultBody;

          for(let i in data){
            this.tableData.push({
              plate_no: data[i].plateNo,
              status: this.settingStatus(data[i].trailerEvent),
              gps_provider : data[i].gpsProviderCode,
              tp_vendor: data[i].transporterName,
              latitude: data[i].lastLatitude,
              longitude: data[i].lastLongitude,
              gps_receive_time: this.parseDateforLastGpsReceiveTime(data[i].lastGpsReceiveTime),
            })
          }

        })
        .catch((ex)=> {
            console.log(ex);
            this.loadingShow = false;
        })
      },
      settingStatus(trailerEvent){

        this.status=[];

        if(trailerEvent == '0'){
            this.status.push({
              type: 'secondary',
              title: 'NONE'
            })
        }else if(trailerEvent == '3'){
            this.status.push({
              type: 'primary',
              title: 'GEO-FENCE IN'
            })
        }
        else if(trailerEvent == '4'){
            this.status.push({
              type: 'warning',
              title: 'GEO-FENCE OUT'
            })
        }
        return this.status;
    },
  }
};
</script>
<style src="./DomesticTrailer.scss" lang="scss" />
