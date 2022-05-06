<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Genisys Trailer</span>    
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
            worksheet = "GenisysTrailer"
            type    = "csv"
            :fields ="excel_fields"
            name    = "GenisysTrailer.csv">
            EXPORT EXCEL
          </download-excel>
        </div>
        <v-client-table class="trailerTableClass" ref="trailerTable" :data="tableData" :columns="trailerColumns" :options="trailerOptions">
            <template slot="edit" slot-scope="{ row }">
              <b-button v-if="role === 'GENISYS'" variant="outline-warning" @click="editTrailer(row.plate_no, row.container_no)" v-b-modal.edit><i class="fa fa-edit" /></b-button>
              <b-button v-if="role === 'GENISYS USER'" variant="outline-warning" @click="noAuth()"><i class="fa fa-edit" /></b-button>
            </template>
        </v-client-table>
      </div>
    </Widget>
    <b-modal id="edit" size="lg" title="GPS Provider Edit" body-class="bg-white" hide-footer>
        <EditTrailer ref="editTrailerForm"/>
    </b-modal>

    <loading
      :show="loadingShow"
      :label="loadingLabel"
      loader-class="loading">
    </loading>
  
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';
import EditTrailer from './Modal/EditTrailer';

export default {
  name: 'Trailer',
  components: { Widget, EditTrailer },
  data() {
    return {
      role: '',
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
      /* TABLE */
      tableData: [],
      trailerColumns: ['container_no', 'plate_no', 'gps_provider', 'tp_vendor', 'latitude', 'longitude', 'gps_receive_time', 'edit' ],
      trailerOptions: {
        filterByColumn: true,
        perPage: 10,
        perPageValues: [],
        pagination: { chunk: 5, dropdown: false },
        skin: 'table table-striped',
        filterable: ['container_no', 'plate_no', 'gps_provider', 'tp_vendor', 'latitude', 'longitude', 'gps_receive_time']
      },
      
      /* EXCEL */
      excel_fields: {
        'CONTAINER_NO':'container_no',
        'PLATE NO': 'plate_no',
        'GPS PROVIDER' : 'gps_provider',
        'TP VENDOR': 'tp_vendor',
        'LATITUDE': 'latitude',
        'LONGITUDE': 'longitude',
        'GPS RECEIVE TIME': 'gps_receive_time', 
      },

      noAuthMessage: 'You do not have permission to modify.',
    };
  },
  created() {
    this.getTrailer();
    this.checkRole();
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

        this.$axios.get('/api/genisysTrailer/trailerList')
        .then((response) => {
          console.log(response);
          this.loadingShow = false;
          const data = response.data.resultBody;

          for(let i in data){
            this.tableData.push({
              container_no: data[i].containerNo,
              plate_no: data[i].plateNo,
              gps_provider : data[i].gpsProviderName,
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
      editTrailer(plateNo, containerNo){
        this.loadingShow = true;

        this.$axios.get('/api/genisysTrailer/gpsProvider',{
            params: { plateNo: plateNo, containerNo: containerNo }
        })
        .then((response) => {
          console.log(response);
          this.$refs.editTrailerForm.containerTrailer = response.data.resultBody;
          this.loadingShow = false;
        })
        .catch((ex)=> {
            console.log(ex);
            this.loadingShow = false;
            this.showErrorAlert(ex.response.status);
        }) 
      },
      checkRole(){
         this.role = window.sessionStorage.getItem('Role');
      },
      noAuth(){
        this.showErrorAlert(this.noAuthMessage);
      }
  }
};
</script>
<style src="./GenisysTrailer.scss" lang="scss" />
